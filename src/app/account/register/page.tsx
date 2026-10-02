import type { Metadata } from "next";
import { RegisterForm } from "@/components/commerce/AuthForms";

export const metadata: Metadata = {
  title: "Create an account | Northline Market",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-[75vh] w-full max-w-5xl items-center gap-10 px-4 py-12 sm:px-7 lg:grid-cols-[.8fr_1fr] lg:gap-20 lg:px-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">Northline account</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-[color:var(--ink)] sm:text-5xl">A better place for your everyday picks.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--muted)]">Create an account to save your details and keep track of your orders.</p>
      </div>
      <section className="border border-[color:var(--line)] bg-white p-5 sm:p-8" aria-labelledby="register-heading">
        <h2 id="register-heading" className="mb-5 font-display text-2xl text-[color:var(--ink)]">Create account</h2>
        <RegisterForm />
      </section>
    </main>
  );
}