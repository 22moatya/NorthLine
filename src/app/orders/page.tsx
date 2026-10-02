import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import type { OrderRecord } from "@/types/order";

export const metadata: Metadata = {
  title: "Your orders | Northline Market",
  robots: { index: false, follow: false },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=/orders");

  await connectToDatabase();
  const orders = await Order.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<Array<OrderRecord & { _id: { toString(): string } }>>()
    .exec();
  const params = await searchParams;
  const placed = Array.isArray(params.placed) ? params.placed[0] : params.placed;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-16 pt-10 sm:px-7 lg:px-10">
      {placed ? <div role="status" className="mb-7 border-l-2 border-[color:var(--stock)] bg-white px-4 py-3 text-sm text-[color:var(--stock)]">Order {placed} was placed. Payment is pending.</div> : null}
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">Account</p>
      <h1 className="mt-2 font-display text-4xl text-[color:var(--ink)]">Your orders</h1>
      {orders.length > 0 ? (
        <div className="mt-7 divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {orders.map((order) => (
            <article key={order._id.toString()} className="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-5 sm:px-5">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[color:var(--ink)]">{order.orderNumber}</h2>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <span className="capitalize text-[color:var(--muted)]">{order.status} · {order.paymentStatus}</span>
                <span className="font-semibold tabular-nums text-[color:var(--ink)]">${order.total.toFixed(2)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 border-y border-[color:var(--line)] py-12 text-center">
          <h2 className="font-display text-2xl text-[color:var(--ink)]">No orders yet</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Your completed checkouts will appear here.</p>
          <Link href="/products" className="mt-4 inline-flex text-xs font-semibold text-[color:var(--accent)] underline underline-offset-4">Browse the shop</Link>
        </div>
      )}
    </main>
  );
}