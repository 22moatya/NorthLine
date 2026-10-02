"use client";

import { RefreshCw } from "lucide-react";

export default function ProductsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">Catalog unavailable</p>
      <h1 className="mt-3 font-display text-3xl text-[color:var(--ink)]">We couldn’t load the shop</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">Something went wrong while loading products. Try again shortly.</p>
      <button type="button" onClick={() => reset()} className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">
        <RefreshCw size={14} /> Try again
      </button>
    </main>
  );
}