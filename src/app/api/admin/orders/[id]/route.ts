import Order from "@/models/Order";
import { requireAdmin } from "@/lib/admin-auth";
import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { adminOrderIdSchema, adminOrderStatusSchema } from "@/lib/admin-validations";
import type { OrderRecord } from "@/types/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderRouteContext = { params: Promise<{ id: string }> };
type StoredOrder = OrderRecord & { _id: { toString(): string } };

export async function PATCH(request: Request, { params }: OrderRouteContext): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  const { id } = await params;
  const parsedId = adminOrderIdSchema.safeParse(id);
  if (!parsedId.success) return errorResponse("Order ID is invalid", 400);

  try {
    const body: unknown = await request.json();
    const parsedBody = adminOrderStatusSchema.safeParse(
      typeof body === "object" && body !== null && "status" in body ? body.status : undefined,
    );
    if (!parsedBody.success) return validationErrorResponse(parsedBody.error);

    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(
      parsedId.data,
      { $set: { status: parsedBody.data } },
      { returnDocument: "after", runValidators: true },
    ).lean<StoredOrder | null>().exec();

    if (!order) return errorResponse("Order not found", 404);

    return successResponse(
      { id: order._id.toString(), orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus },
      "Order status updated successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}