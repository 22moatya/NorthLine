import Link from "next/link";
import { PackageSearch } from "lucide-react";

interface ProductEmptyStateProps {
  title?: string;
  description?: string;
}

export default function ProductEmptyState({
  title = "No products found",
  description = "Try changing your search or filters to find what you are looking for.",
}: ProductEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center border-y border-[color:var(--line)] px-5 py-12 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--ink)]">
        <PackageSearch size={22} strokeWidth={1.5} />
      </span>
      <h2 className="font-display text-2xl text-[color:var(--ink)]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      <Link href="/products" className="mt-5 inline-flex h-10 items-center justify-center rounded-sm bg-[color:var(--ink)] px-4 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">
        Clear filters
      </Link>
    </div>
  );
}