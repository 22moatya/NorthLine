import { Star } from "lucide-react";

interface ProductRatingProps {
  rating: number;
  numReviews: number;
}

export default function ProductRating({ rating, numReviews }: ProductRatingProps) {
  return (
    <div
      className="flex min-w-0 items-center gap-1.5 text-xs text-[color:var(--muted)]"
      aria-label={`${rating.toFixed(1)} out of 5 stars, ${numReviews} reviews`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={12}
            strokeWidth={1.5}
            className={index < Math.round(rating) ? "fill-[color:var(--sun)] text-[color:var(--sun)]" : "text-[color:var(--line-strong)]"}
          />
        ))}
      </span>
      <span className="font-semibold text-[color:var(--ink)]">{rating.toFixed(1)}</span>
      <span>({numReviews.toLocaleString("en-US")})</span>
    </div>
  );
}