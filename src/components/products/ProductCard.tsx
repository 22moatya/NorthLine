"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, ShoppingBag } from "lucide-react";
import type { ProductDto } from "@/types/product";
import ProductImage from "@/components/products/ProductImage";
import ProductPrice from "@/components/products/ProductPrice";
import ProductRating from "@/components/products/ProductRating";
import { useCart } from "@/components/commerce/CommerceShell";

interface ProductCardProps {
  product: ProductDto;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, setCartOpen } = useCart();
  const inStock = product.stock > 0;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/4.7] overflow-hidden rounded-sm bg-[color:var(--surface-soft)]">
        <ProductImage src={product.images[0]} alt={product.name} priority={priority} />
        {product.discount > 0 ? (
          <span className="absolute left-3 top-3 z-10 bg-[color:var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
            {product.discount}% off
          </span>
        ) : null}
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setWishlisted((value) => !value)}
          className={`absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-white/70 bg-white/90 transition-colors hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${wishlisted ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]"}`}
        >
          <Heart size={17} strokeWidth={1.8} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="space-y-2.5 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--muted)]">
            {product.categoryName ?? product.categorySlug ?? "Collection"}
          </span>
          <span className={`shrink-0 text-[10px] font-medium ${inStock ? "text-[color:var(--stock)]" : "text-[color:var(--accent)]"}`}>
            {inStock ? (product.stock <= 5 ? `Only ${product.stock} left` : "In stock") : "Sold out"}
          </span>
        </div>
        <div className="min-h-11">
          <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-[color:var(--ink)]">
            <Link href={`/products/${product.id}`} className="rounded-sm hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">
              {product.name}
            </Link>
          </h2>
          {product.brand ? <p className="mt-0.5 truncate text-xs text-[color:var(--muted)]">{product.brand}</p> : null}
        </div>
        <ProductRating rating={product.rating} numReviews={product.numReviews} />
        <ProductPrice price={product.price} comparePrice={product.comparePrice} discount={product.discount} />
        {product.variants?.length ? (
          <Link
            href={`/products/${product.id}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-[color:var(--ink)] bg-[color:var(--ink)] px-3 text-xs font-semibold text-white transition-colors hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]"
          >
            Choose options <ArrowRight size={15} />
          </Link>
        ) : (
          <button
            type="button"
            disabled={!inStock}
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                image: product.images[0] ?? "",
                unitPrice: product.price,
              }, 1);
              setAdded(true);
              setCartOpen(true);
            }}
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-sm border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 ${added ? "border-[color:var(--stock)] bg-[color:var(--stock)] text-white" : "border-[color:var(--ink)] bg-[color:var(--ink)] text-white hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]"}`}
          >
            {added ? <Check size={15} /> : <ShoppingBag size={15} />}
            {inStock ? (added ? "Added" : "Add to cart") : "Out of stock"}
          </button>
        )}
      </div>
    </article>
  );
}