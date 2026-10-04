import type { Metadata } from "next";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import type { OrderRecord } from "@/types/order";
import OrderManager, { type AdminOrderSummary } from "@/components/admin/OrderManager";

export const metadata: Metadata = { title: "Manage orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type StoredAdminOrder = OrderRecord & { _id: { toString(): string } };

export default async function AdminOrdersPage() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100).lean<StoredAdminOrder[]>().exec();
  const orderSummaries: AdminOrderSummary[] = orders.map((order) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerName: order.shippingAddress.fullName,
    customerEmail: order.shippingAddress.email,
    customerPhone: order.shippingAddress.phone,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    total: order.total,
    currency: order.currency ?? "USD",
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <section>
      <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">Fulfillment</p><h2 className="mt-1 font-display text-3xl text-[color:var(--ink)]">Orders</h2></div>
      <OrderManager orders={orderSummaries} />
    </section>
  );
}