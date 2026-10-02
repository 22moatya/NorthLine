"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import type { CategoryDto } from "@/types/category";
import type { ProductAvailability } from "@/types/product";

interface ProductFiltersProps {
  categories: Array<Pick<CategoryDto, "slug" | "name">>;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: ProductAvailability;
}

const filterKeys = ["category", "minPrice", "maxPrice", "rating", "availability"] as const;

export default function ProductFilters({ categories, category, minPrice, maxPrice, rating, availability }: ProductFiltersProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCount = [category, minPrice, maxPrice, rating, availability].filter((value) => value !== undefined).length;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    for (const key of filterKeys) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setOpen(false);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of filterKeys) params.delete(key);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setOpen(false);
  }

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="product-filter-panel"
          className="flex h-11 items-center gap-2 rounded-sm border border-[color:var(--line)] bg-white px-4 text-sm font-semibold text-[color:var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeCount > 0 ? <span className="grid size-5 place-items-center rounded-full bg-[color:var(--ink)] text-[10px] text-white">{activeCount}</span> : null}
        </button>
      </div>
      {open ? (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
        />
      ) : null}
      <aside
        id="product-filter-panel"
        aria-label="Product filters"
        className={`${open ? "fixed inset-y-0 left-0 z-50 block w-[min(88vw,340px)] overflow-y-auto bg-white p-5 shadow-2xl" : "hidden"} lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:block lg:h-fit lg:w-full lg:bg-transparent lg:p-0 lg:shadow-none`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <h2 className="font-display text-2xl text-[color:var(--ink)]">Filters</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" title="Close filters" className="grid size-9 place-items-center rounded-full hover:bg-[color:var(--surface-soft)]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={applyFilters} className="space-y-7">
          <section className="border-b border-[color:var(--line)] pb-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.11em] text-[color:var(--ink)]">Category</h3>
            <label className="sr-only" htmlFor="filter-category">Category</label>
            <select id="filter-category" name="category" defaultValue={category ?? ""} className="filter-select">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
          </section>

          <section className="border-b border-[color:var(--line)] pb-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.11em] text-[color:var(--ink)]">Price range</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0">
                <span className="mb-1 block text-[11px] text-[color:var(--muted)]">Min</span>
                <input name="minPrice" type="number" min="0" step="1" defaultValue={minPrice} placeholder="$0" className="filter-input" />
              </label>
              <label className="min-w-0">
                <span className="mb-1 block text-[11px] text-[color:var(--muted)]">Max</span>
                <input name="maxPrice" type="number" min="0" step="1" defaultValue={maxPrice} placeholder="No max" className="filter-input" />
              </label>
            </div>
          </section>

          <section className="border-b border-[color:var(--line)] pb-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.11em] text-[color:var(--ink)]">Customer rating</h3>
            <label className="sr-only" htmlFor="filter-rating">Minimum rating</label>
            <select id="filter-rating" name="rating" defaultValue={rating ?? ""} className="filter-select">
              <option value="">Any rating</option>
              <option value="4">4 stars & up</option>
              <option value="3">3 stars & up</option>
              <option value="2">2 stars & up</option>
            </select>
          </section>

          <section className="pb-1">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.11em] text-[color:var(--ink)]">Availability</h3>
            <label className="sr-only" htmlFor="filter-availability">Availability</label>
            <select id="filter-availability" name="availability" defaultValue={availability ?? ""} className="filter-select">
              <option value="">All products</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]">
              <Check size={14} /> Apply filters
            </button>
            <button type="button" onClick={clearFilters} className="h-10 px-2 text-xs font-semibold text-[color:var(--muted)] underline underline-offset-4 hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">
              Clear
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}