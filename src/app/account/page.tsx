import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "My account | Northline Market",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/account/login");

  return (
    <main className="mx-auto min-h-[75vh] w-full max-w-4xl px-4 py-12 sm:px-7 lg:px-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">Your account</p>
      <h1 className="mt-2 font-display text-4xl text-[color:var(--ink)]">Hello, {session.user.name ?? "there"}</h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{session.user.email}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/orders" className="group border border-[color:var(--line)] bg-white p-5 transition-colors hover:border-[color:var(--ink)]">
          <h2 className="font-display text-2xl text-[color:var(--ink)]">Your orders</h2>
          <p className="mt-2 text-xs text-[color:var(--muted)]">View recent purchases and payment status.</p>
        </Link>
        <Link href="/products" className="group border border-[color:var(--line)] bg-white p-5 transition-colors hover:border-[color:var(--ink)]">
          <h2 className="font-display text-2xl text-[color:var(--ink)]">Keep exploring</h2>
          <p className="mt-2 text-xs text-[color:var(--muted)]">Find something useful for the everyday.</p>
        </Link>
      </div>
    </main>
  );
}