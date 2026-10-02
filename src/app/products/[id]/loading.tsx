export default function ProductDetailsLoading() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1360px] gap-8 px-4 py-10 sm:px-7 lg:grid-cols-2 lg:px-10" aria-label="Loading product details">
      <div className="aspect-square animate-pulse rounded-sm bg-[color:var(--line)]" />
      <div className="space-y-5 pt-4">
        <div className="h-3 w-24 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="h-12 w-4/5 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="h-7 w-1/4 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="h-24 w-full animate-pulse rounded bg-[color:var(--line)]" />
        <div className="h-12 w-full animate-pulse rounded-sm bg-[color:var(--line)]" />
      </div>
    </main>
  );
}