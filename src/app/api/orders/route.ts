import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { auth } from "@/auth";
import Order from "@/models/Order";
import Product, { type StoredProduct } from "@/models/Product";
import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeOrder, type StoredOrder } from "@/lib/order-service";
import { checkoutSchema, idempotencyKeySchema } from "@/lib/commerce-validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Authentication is required", 401);

  try {
    await connectToDatabase();
    const orders = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean<StoredOrder[]>()
      .exec();

    return successResponse(orders.map(serializeOrder), "Orders retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Authentication is required", 401);

  const parsedIdempotencyKey = idempotencyKeySchema.safeParse(request.headers.get("idempotency-key"));
  if (!parsedIdempotencyKey.success) {
    return errorResponse("A valid Idempotency-Key header is required", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must contain valid JSON", 400);
  }

  const parsedCheckout = checkoutSchema.safeParse(body);
  if (!parsedCheckout.success) return validationErrorResponse(parsedCheckout.error);

  try {
    await connectToDatabase();
    const userId = new Types.ObjectId(session.user.id);
    const idempotencyKey = parsedIdempotencyKey.data;
    const existingOrder = await Order.findOne({ user: userId, idempotencyKey }).lean<StoredOrder | null>().exec();

    if (existingOrder) {
      return successResponse(serializeOrder(existingOrder), "Order already placed");
    }

    const reservedItems: Array<{ productId: Types.ObjectId; quantity: number }> = [];
    const orderItems = [];
    let subtotal = 0;

    const rollbackInventory = async () => {
      await Promise.all(
        reservedItems.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }).exec(),
        ),
      );
    };

    try {
    for (const requestedItem of parsedCheckout.data.items) {
      const productId = new Types.ObjectId(requestedItem.productId);
      const product = await Product.findById(productId).lean<StoredProduct | null>().exec();

      if (!product) {
        await rollbackInventory();
        return errorResponse("A product in your bag is no longer available", 404);
      }

      const productVariants = product.variants ?? [];
      const requestedVariants = Object.entries(requestedItem.variants);
      const validVariants = productVariants.length === requestedVariants.length &&
        productVariants.every((variant) => requestedItem.variants[variant.name] && variant.options.includes(requestedItem.variants[variant.name]));

      if (!validVariants) {
        await rollbackInventory();
        return errorResponse("Choose a valid option for every product variant", 400);
      }

      const reserved = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: requestedItem.quantity } },
        { $inc: { stock: -requestedItem.quantity } },
        { returnDocument: "after" },
      ).lean<StoredProduct | null>().exec();

      if (!reserved) {
        await rollbackInventory();
        return errorResponse(`${product.name} no longer has enough stock`, 409);
      }

      reservedItems.push({ productId, quantity: requestedItem.quantity });
      const lineTotal = Math.round(reserved.price * requestedItem.quantity * 100) / 100;
      subtotal = Math.round((subtotal + lineTotal) * 100) / 100;
      orderItems.push({
        productId,
        name: reserved.name,
        slug: reserved.slug,
        image: reserved.images[0],
        unitPrice: reserved.price,
        quantity: requestedItem.quantity,
        lineTotal,
        variants: requestedItem.variants,
      });
    }

    const shippingCost = 0;
    const order = await Order.create({
      orderNumber: `NL-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      user: userId,
      idempotencyKey,
      items: orderItems,
      shippingAddress: parsedCheckout.data.shippingAddress,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: "pending",
      paymentStatus: "unpaid",
    });

    return successResponse(
      serializeOrder(order.toObject() as unknown as StoredOrder),
      "Order placed; payment is pending",
      { status: 201 },
    );
    } catch (error) {
      await rollbackInventory();

      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        const duplicateOrder = await Order.findOne({ user: userId, idempotencyKey }).lean<StoredOrder | null>().exec();
        if (duplicateOrder) return successResponse(serializeOrder(duplicateOrder), "Order already placed");
      }

      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}