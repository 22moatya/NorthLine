"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";

interface ProductSearchProps {
  initialValue?: string;
}

export default function ProductSearch({ initialValue = "" }: ProductSearchProps) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();

  const updateSearch = useCallback((searchValue: string, query: string) => {
    const params = new URLSearchParams(query);
    const search = searchValue.trim();
    if ((params.get("search") ?? "") === search) return;

    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page");

    const nextQuery = params.toString();
    startTransition(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    });
  }, [pathname, router]);

  useEffect(() => {
    if ((new URLSearchParams(currentQuery).get("search") ?? "") === value.trim()) return;

    const timeout = window.setTimeout(() => updateSearch(value, currentQuery), 100);
    return () => window.clearTimeout(timeout);
  }, [currentQuery, updateSearch, value]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearch(value, currentQuery);
  }

  return (
    <form onSubmit={submitSearch} role="search" className="relative w-full sm:max-w-sm">
      <label htmlFor="product-search" className="sr-only">Search products</label>
      {isPending ? (
        <LoaderCircle size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-[color:var(--muted)]" />
      ) : (
        <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
      )}
      <input
        id="product-search"
        type="search"
        value={value}
        aria-busy={isPending}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products, brands..."
        className="h-11 w-full rounded-sm border border-[color:var(--line)] bg-white pl-10 pr-4 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)] focus:ring-2 focus:ring-[color:var(--ink)]/10 placeholder:text-[color:var(--muted)]"
      />
    </form>
  );
}