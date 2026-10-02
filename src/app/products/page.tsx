import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { findProducts } from "@/lib/product-service";
import { listActiveCategories } from "@/lib/category-service";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { productQuerySchema } from "@/lib/validations";
import ProductEmptyState from "@/components/products/ProductEmptyState";
import Pagination from "@/components/products/Pagination";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import ProductSearch from "@/components/products/ProductSearch";
import ProductSort from "@/components/products/ProductSort";

type PageSearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "Shop | Northline Market",
  description: "Browse considered essentials across clothing, technology, home, sport, and more.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const queryInput = Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      if (value === undefined) return [];
      return [[key, Array.isArray(value) ? value[0] : value]];
    }),
  );
  const parsedQuery = productQuerySchema.safeParse(queryInput);

  if (!parsedQuery.success) {
    return (
      <main className="mx-auto min-h-[70vh] w-full max-w-[1500px] px-4 py-14 sm:px-7 lg:px-10">
        <ProductEmptyState
          title="Those filters could not be applied"
          description="One or more values in the address are invalid. Clear the filters and try again."
        />
      </main>
    );
  }

  let result: Awaited<ReturnType<typeof findProducts>>;
  let categoryOptions: Array<{ slug: string; name: string }>;
  try {
    await connectToDatabase();
    const [productsResult, categories] = await Promise.all([
      findProducts(parsedQuery.data),
      listActiveCategories(),
    ]);
    result = productsResult;
    categoryOptions = categories.length > 0
      ? categories.map(({ slug, name }) => ({ slug, name }))
      : PRODUCT_CATEGORIES.map(({ slug, label }) => ({ slug, name: label }));
  } catch (error) {
    console.error("Product listing could not be loaded", error);
    return (
      <main className="mx-auto min-h-[70vh] w-full max-w-[1500px] px-4 py-14 sm:px-7 lg:px-10">
        <ProductEmptyState
          title="The shop is taking a short break"
          description="We could not load the catalog right now. Please try again in a moment."
        />
      </main>
    );
  }

  const paginationParams = new URLSearchParams();
  for (const [key, value] of Object.entries(parsedQuery.data)) {
    if (value !== undefined) paginationParams.set(key, String(value));
  }

  const { products, pagination } = result;
  const firstProduct = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastProduct = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pt-14">
      <header className="shop-heading mb-7 border-b border-[color:var(--line)] pb-7 sm:mb-9 sm:pb-9">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
              Northline Market <span className="px-1 text-[color:var(--muted)]">/</span> Everyday edit
            </p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-display text-5xl leading-none text-[color:var(--ink)] sm:text-6xl">Shop</h1>
              <p className="text-sm text-[color:var(--muted)]">
                {pagination.total.toLocaleString("en-US")} {pagination.total === 1 ? "piece" : "pieces"} to discover
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <ProductSearch initialValue={parsedQuery.data.search} />
            <ProductSort />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-9 lg:gap-y-5">
        <ProductFilters
          categories={categoryOptions}
          category={parsedQuery.data.category}
          minPrice={parsedQuery.data.minPrice}
          maxPrice={parsedQuery.data.maxPrice}
          rating={parsedQuery.data.rating}
          availability={parsedQuery.data.availability}
        />

        <section aria-label="Product results" className="min-w-0 lg:col-start-2">
          <div className="mb-5 flex min-h-8 items-center justify-between gap-4 border-b border-[color:var(--line)] pb-3">
            <p className="text-xs text-[color:var(--muted)]">
              Showing <span className="font-semibold text-[color:var(--ink)]">{firstProduct}-{lastProduct}</span> of {pagination.total}
            </p>
            {parsedQuery.data.search ? (
              <p className="max-w-[55%] truncate text-xs text-[color:var(--muted)]">
                Results for <span className="font-semibold text-[color:var(--ink)]">“{parsedQuery.data.search}”</span>
              </p>
            ) : null}
          </div>

          {products.length > 0 ? <ProductGrid products={products} /> : <ProductEmptyState />}
          <Pagination pagination={pagination} queryString={paginationParams.toString()} />
        </section>
      </div>
    </main>
  );
}