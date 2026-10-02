import { auth } from "@/auth";
import Order from "@/models/Order";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { adminOrderStatusSchema } from "@/lib/admin-validations";
import type { OrderRecord } from "@/types/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminOrder = OrderRecord & { _id: { toString(): string } };

export async function GET(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) return errorResponse("Authentication is required", 401);
  if (session.user.role !== "admin") return errorResponse("Administrator access is required", 403);

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const parsedStatus = statusParam ? adminOrderStatusSchema.safeParse(statusParam) : undefined;
  if (parsedStatus && !parsedStatus.success) return errorResponse("Order status filter is invalid", 400);

  try {
    await connectToDatabase();
    const orders = await Order.find(parsedStatus ? { status: parsedStatus.data } : {})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean<AdminOrder[]>()
      .exec();

    return successResponse(
      orders.map((order) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress.fullName,
        customerEmail: order.shippingAddress.email,
        itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      })),
      "Admin orders retrieved successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}