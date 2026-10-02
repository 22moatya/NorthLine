import Product, { type StoredProduct } from "@/models/Product";
import { authorizeProductWrite } from "@/lib/admin-auth";
import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeProduct, slugifyProductName } from "@/lib/product-service";
import { productIdSchema, updateProductSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ProductRouteContext): Promise<Response> {
  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    return errorResponse("Product ID is invalid", 400);
  }

  try {
    await connectToDatabase();
    const product = await Product.findById(parsedId.data).lean<StoredProduct | null>().exec();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(serializeProduct(product), "Product retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: ProductRouteContext): Promise<Response> {
  const authorizationError = await authorizeProductWrite(request);
  if (authorizationError) return authorizationError;

  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    return errorResponse("Product ID is invalid", 400);
  }

  try {
    const body: unknown = await request.json();
    const parsedUpdate = updateProductSchema.safeParse(body);

    if (!parsedUpdate.success) {
      return validationErrorResponse(parsedUpdate.error);
    }

    await connectToDatabase();
    const product = await Product.findById(parsedId.data).exec();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const update = { ...parsedUpdate.data };
    const nextPrice = update.price ?? product.price;
    const nextComparePrice = update.comparePrice ?? product.comparePrice;

    if (nextComparePrice !== undefined && nextComparePrice <= nextPrice) {
      return errorResponse("Product data is invalid", 400, [
        {
          field: "comparePrice",
          message: "Compare price must be greater than the current price",
        },
      ]);
    }

    if (update.name && update.slug === undefined) {
      update.slug = slugifyProductName(update.name);
    }

    if (update.sku) {
      update.sku = update.sku.toUpperCase();
    }

    Object.assign(product, update);
    product.discount =
      nextComparePrice && nextComparePrice > nextPrice
        ? Math.round(((nextComparePrice - nextPrice) / nextComparePrice) * 100)
        : 0;
    await product.save();

    return successResponse(
      serializeProduct(product.toObject() as unknown as StoredProduct),
      "Product updated successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: ProductRouteContext): Promise<Response> {
  const authorizationError = await authorizeProductWrite(request);
  if (authorizationError) return authorizationError;

  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);

  if (!parsedId.success) {
    return errorResponse("Product ID is invalid", 400);
  }

  try {
    await connectToDatabase();
    const product = await Product.findByIdAndDelete(parsedId.data).exec();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({ id: product._id.toString() }, "Product deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}