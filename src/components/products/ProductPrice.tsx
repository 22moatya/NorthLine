import type { ProductDto } from "@/types/product";
import Money from "@/components/commerce/Money";

export default function ProductPrice({ price, comparePrice, discount }: Pick<ProductDto, "price" | "comparePrice" | "discount">) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-base font-bold tabular-nums text-[color:var(--ink)]">
        <Money amount={price} />
      </span>
      {comparePrice !== undefined && comparePrice > price ? (
        <>
          <span className="text-xs tabular-nums text-[color:var(--muted)] line-through">
            <Money amount={comparePrice} />
          </span>
          <span className="text-[11px] font-semibold text-[color:var(--accent)]">
            Save {discount}%
          </span>
        </>
      ) : null}
    </div>
  );
}