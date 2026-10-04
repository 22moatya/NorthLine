import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CheckoutForm from "@/components/commerce/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/account/login?callbackUrl=/checkout");

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 pb-16 pt-10 sm:px-7 lg:px-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">Checkout</p>
      <h1 className="mb-8 mt-2 font-display text-4xl text-[color:var(--ink)]">Delivery details</h1>
      <CheckoutForm customer={{ name: session.user.name ?? "", email: session.user.email ?? "" }} />
    </main>
  );
}