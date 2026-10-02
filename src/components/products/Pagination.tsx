import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProductPagination } from "@/types/product";

interface PaginationProps {
  pagination: ProductPagination;
  queryString: string;
}

function pageHref(queryString: string, page: number): string {
  const params = new URLSearchParams(queryString);
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default function Pagination({ pagination, queryString }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const previousPage = pagination.page - 1;
  const nextPage = pagination.page + 1;

  return (
    <nav aria-label="Product pages" className="mt-12 flex items-center justify-between border-t border-[color:var(--line)] pt-5">
      {previousPage >= 1 ? (
        <Link href={pageHref(queryString, previousPage)} className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-xs font-semibold text-[color:var(--ink)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">
          <ArrowLeft size={15} /> Previous
        </Link>
      ) : (
        <span aria-disabled="true" className="inline-flex h-10 items-center gap-2 px-3 text-xs text-[color:var(--muted)]/60">
          <ArrowLeft size={15} /> Previous
        </span>
      )}
      <span className="text-xs tabular-nums text-[color:var(--muted)]">Page {pagination.page} of {pagination.totalPages}</span>
      {nextPage <= pagination.totalPages ? (
        <Link href={pageHref(queryString, nextPage)} className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-xs font-semibold text-[color:var(--ink)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">
          Next <ArrowRight size={15} />
        </Link>
      ) : (
        <span aria-disabled="true" className="inline-flex h-10 items-center gap-2 px-3 text-xs text-[color:var(--muted)]/60">
          Next <ArrowRight size={15} />
        </span>
      )}
    </nav>
  );
}