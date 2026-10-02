"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface ProductSearchProps {
  initialValue?: string;
}

export default function ProductSearch({ initialValue = "" }: ProductSearchProps) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const search = value.trim();

    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <form onSubmit={submitSearch} role="search" className="relative w-full sm:max-w-sm">
      <label htmlFor="product-search" className="sr-only">Search products</label>
      <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
      <input
        id="product-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products, brands..."
        className="h-11 w-full rounded-sm border border-[color:var(--line)] bg-white pl-10 pr-4 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)] focus:ring-2 focus:ring-[color:var(--ink)]/10 placeholder:text-[color:var(--muted)]"
      />
    </form>
  );
}