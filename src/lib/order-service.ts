import type { Types } from "mongoose";
import type { OrderDto, OrderRecord } from "@/types/order";

export type StoredOrder = OrderRecord & { _id: Types.ObjectId };

export function serializeOrder(order: StoredOrder): OrderDto {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      slug: item.slug,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      variants: item.variants,
    })),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    taxAmount: order.taxAmount ?? 0,
    total: order.total,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
  };
}