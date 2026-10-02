export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[4/4.7] rounded-sm bg-[color:var(--line)]" />
      <div className="space-y-3 pt-4">
        <div className="h-3 w-1/3 rounded bg-[color:var(--line)]" />
        <div className="h-4 w-4/5 rounded bg-[color:var(--line)]" />
        <div className="h-3 w-2/3 rounded bg-[color:var(--line)]" />
        <div className="h-4 w-1/2 rounded bg-[color:var(--line)]" />
        <div className="h-10 w-full rounded-sm bg-[color:var(--line)]" />
      </div>
    </div>
  );
}