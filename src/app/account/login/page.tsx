import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/commerce/AuthForms";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callback = params.callbackUrl;
  const callbackUrl = Array.isArray(callback) ? callback[0] : callback;
  const registered = params.registered === "1";

  return (
    <main className="mx-auto grid min-h-[75vh] w-full max-w-5xl items-center gap-10 px-4 py-12 sm:px-7 lg:grid-cols-[.8fr_1fr] lg:gap-20 lg:px-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">Welcome back</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-[color:var(--ink)] sm:text-5xl">Good things, right where you left them.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--muted)]">Sign in to check your orders and continue to checkout.</p>
        <Link href="/products" className="mt-5 inline-flex text-xs font-semibold text-[color:var(--accent)] underline underline-offset-4">Continue browsing</Link>
      </div>
      <section className="border border-[color:var(--line)] bg-white p-5 sm:p-8" aria-labelledby="login-heading">
        <h2 id="login-heading" className="mb-5 font-display text-2xl text-[color:var(--ink)]">Sign in</h2>
        {registered ? <p role="status" className="mb-4 bg-[color:var(--surface-soft)] px-3 py-2 text-xs text-[color:var(--stock)]">Your account is ready. Sign in to continue.</p> : null}
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}