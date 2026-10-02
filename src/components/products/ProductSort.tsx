"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownWideNarrow } from "lucide-react";
import type { ProductSort as ProductSortValue } from "@/types/product";

const sortLabels: Array<{ value: ProductSortValue; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "popular", label: "Most popular" },
];

export default function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "featured";

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <label className="flex h-11 items-center gap-2 rounded-sm border border-[color:var(--line)] bg-white px-3 text-xs text-[color:var(--muted)] focus-within:border-[color:var(--ink)]">
      <ArrowDownWideNarrow size={16} aria-hidden="true" />
      <span className="sr-only">Sort products</span>
      <select
        value={currentSort}
        onChange={(event) => changeSort(event.target.value)}
        className="h-full min-w-32 bg-transparent text-xs font-semibold text-[color:var(--ink)] outline-none"
      >
        {sortLabels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}