"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/commerce/CommerceShell";
import Money from "@/components/commerce/Money";
import { useSiteSettings } from "@/components/commerce/SiteSettingsContext";
import { calculateOrderCharges } from "@/types/site-settings";

interface CheckoutFormProps {
  customer: { name: string; email: string };
}

const inputClassName = "auth-input mt-1.5";

export default function CheckoutForm({ customer }: CheckoutFormProps) {
  const router = useRouter();
  const { lines, subtotal, clearCart } = useCart();
  const settings = useSiteSettings();
  const { shippingCost, taxAmount, total } = calculateOrderCharges(subtotal, settings);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const shippingAddress = Object.fromEntries(formData.entries());
    idempotencyKey.current ??= crypto.randomUUID();

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey.current,
        },
        body: JSON.stringify({
          shippingAddress,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            variants: line.variants,
          })),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message ?? "We could not place the order.");
        return;
      }

      clearCart();
      router.push(`/orders?placed=${encodeURIComponent(result.data.orderNumber)}`);
    } catch {
      setErrorMessage("We could not reach the checkout service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="border-y border-[color:var(--line)] py-12 text-center">
        <h2 className="font-display text-2xl text-[color:var(--ink)]">Your bag is empty</h2>
        <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--accent)] underline underline-offset-4"><ArrowLeft size={14} /> Return to shop</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-9">
        <section>
          <h2 className="mb-4 font-display text-2xl text-[color:var(--ink)]">Contact and delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Full name<input required name="fullName" autoComplete="name" defaultValue={customer.name} className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)]">Email<input required name="email" type="email" autoComplete="email" defaultValue={customer.email} className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)]">Phone<input required name="phone" type="tel" autoComplete="tel" className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Address<input required name="addressLine1" autoComplete="address-line1" className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Apartment, suite, etc. <span className="font-normal text-[color:var(--muted)]">Optional</span><input name="addressLine2" autoComplete="address-line2" className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)]">City<input required name="city" autoComplete="address-level2" className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)]">State or region<input required name="region" autoComplete="address-level1" className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)]">Postal code<input required name="postalCode" autoComplete="postal-code" className={inputClassName} /></label>
            <label className="text-xs font-semibold text-[color:var(--ink)]">Country code<input required name="country" minLength={2} maxLength={2} placeholder="US" autoComplete="country" className={inputClassName} /></label>
          </div>
        </section>
        <p className="flex items-start gap-2 border-l-2 border-[color:var(--sun)] bg-white px-4 py-3 text-xs leading-5 text-[color:var(--muted)]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[color:var(--stock)]" />
          Shipping and tax are estimates. The final total is recalculated from current store settings and live catalog prices when the order is placed. Payment is not collected in this checkout.
        </p>
      </div>

      <aside className="h-fit border border-[color:var(--line)] bg-white p-5">
        <h2 className="font-display text-2xl text-[color:var(--ink)]">Order summary</h2>
        <ul className="mt-4 divide-y divide-[color:var(--line)]">
          {lines.map((line) => (
            <li key={line.key} className="flex justify-between gap-4 py-3 text-xs">
              <span className="min-w-0 text-[color:var(--muted)]"><span className="font-semibold text-[color:var(--ink)]">{line.quantity} ×</span> {line.name}{Object.keys(line.variants).length > 0 ? ` · ${Object.values(line.variants).join(" / ")}` : ""}</span>
              <span className="shrink-0 font-semibold tabular-nums text-[color:var(--ink)]"><Money amount={line.unitPrice * line.quantity} /></span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2 border-t border-[color:var(--line)] pt-4 text-xs">
          <div className="flex justify-between text-[color:var(--muted)]"><span>Shipping</span><span>{shippingCost === 0 ? "Free" : <Money amount={shippingCost} />}</span></div>
          <div className="flex justify-between text-[color:var(--muted)]"><span>Tax ({settings.taxRatePercent}%)</span><span><Money amount={taxAmount} /></span></div>
          <div className="flex justify-between pt-2 text-sm font-bold text-[color:var(--ink)]"><span>Estimated total</span><span><Money amount={total} /></span></div>
          <p className="text-[10px] text-[color:var(--muted)]">Final total is confirmed by the server.</p>
        </div>
        {errorMessage ? <p role="alert" className="mt-4 text-xs leading-5 text-[color:var(--accent)]">{errorMessage}</p> : null}
        <button disabled={submitting} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
          {submitting ? <LoaderCircle className="animate-spin" size={16} /> : null}
          Place order
        </button>
      </aside>
    </form>
  );
}