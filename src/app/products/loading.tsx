import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pt-14" aria-label="Loading products">
      <div className="mb-9 border-b border-[color:var(--line)] pb-8">
        <div className="mb-4 h-3 w-36 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="h-14 w-48 animate-pulse rounded bg-[color:var(--line)]" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    </main>
  );
}