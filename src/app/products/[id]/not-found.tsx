import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--ink)]">
        <PackageSearch size={22} strokeWidth={1.5} />
      </span>
      <h1 className="mt-4 font-display text-3xl text-[color:var(--ink)]">Product not found</h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">This item may have moved or is no longer available.</p>
      <Link href="/products" className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">
        <ArrowLeft size={14} /> Back to shop
      </Link>
    </main>
  );
}