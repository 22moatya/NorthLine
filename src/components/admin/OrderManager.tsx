"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/types/order";
import { formatMoney, type CurrencyCode } from "@/types/site-settings";
import { createWhatsAppOrderLink } from "@/lib/whatsapp";

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemCount: number;
  total: number;
  currency: CurrencyCode;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

interface OrderManagerProps {
  orders: AdminOrderSummary[];
}

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderManager({ orders }: OrderManagerProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [updatedOrder, setUpdatedOrder] = useState("");
  const [savingId, setSavingId] = useState("");

  async function changeStatus(orderId: string, status: OrderStatus) {
    setSavingId(orderId);
    setErrorMessage("");
    setUpdatedOrder("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.message ?? "Order status could not be updated.");
        return;
      }

      setUpdatedOrder(orderId);
      router.refresh();
    } catch {
      setErrorMessage("Order status could not be updated. Check your connection and try again.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <section aria-labelledby="orders-list-heading">
      <div className="mb-4"><h3 id="orders-list-heading" className="font-display text-2xl text-[color:var(--ink)]">Recent orders</h3><p className="mt-1 text-xs text-[color:var(--muted)]">Latest 100 orders. Payment status is read-only until a payment provider is configured.</p></div>
      {errorMessage ? <p role="alert" className="mb-3 text-xs text-[color:var(--accent)]">{errorMessage}</p> : null}
      {updatedOrder ? <p role="status" className="mb-3 text-xs text-[color:var(--stock)]">Order status saved.</p> : null}
      <div className="overflow-x-auto border-y border-[color:var(--line)] bg-white">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead className="border-b border-[color:var(--line)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]"><tr><th className="px-4 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Placed</th><th className="px-4 py-3 font-semibold">Items</th><th className="px-4 py-3 font-semibold">Total</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Fulfillment</th></tr></thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[color:var(--canvas)]">
                <td className="px-4 py-3 font-mono text-[11px] font-semibold text-[color:var(--ink)]">{order.orderNumber}</td>
                <td className="px-4 py-3"><p className="font-semibold text-[color:var(--ink)]">{order.customerName}</p><p className="mt-0.5 text-[10px] text-[color:var(--muted)]">{order.customerEmail}</p></td>
                <td className="px-4 py-3">
                  <p className="whitespace-nowrap text-[color:var(--muted)]">{order.customerPhone}</p>
                  {(() => {
                    const whatsappLink = createWhatsAppOrderLink(order.customerPhone, order.customerName, order.orderNumber);
                    return whatsappLink ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Contact ${order.customerName} about order ${order.orderNumber} on WhatsApp`}
                        className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-sm bg-[#25d366] px-2.5 text-[11px] font-semibold text-white hover:bg-[#1fb85a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128c4a]"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    ) : (
                      <p className="mt-1 max-w-36 text-[10px] leading-4 text-[color:var(--muted)]">WhatsApp needs an international number with country code.</p>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[color:var(--muted)]">{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</td>
                <td className="px-4 py-3 tabular-nums text-[color:var(--ink)]">{order.itemCount}</td>
                <td className="px-4 py-3 tabular-nums font-semibold text-[color:var(--ink)]">{formatMoney(order.total, order.currency)}</td>
                <td className="px-4 py-3 capitalize text-[color:var(--muted)]">{order.paymentStatus}</td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`order-status-${order.id}`}>Fulfillment status for {order.orderNumber}</label>
                  <select id={`order-status-${order.id}`} value={order.status} disabled={savingId === order.id} onChange={(event) => void changeStatus(order.id, event.target.value as OrderStatus)} className="admin-input h-9 min-w-32 py-1 capitalize">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[color:var(--muted)]">No orders yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}