"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { ProductVariant } from "@/types/product";
import { useCart } from "@/components/commerce/CommerceShell";

interface ProductPurchasePanelProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  variants?: ProductVariant[];
}

export default function ProductPurchasePanel({ productId, name, price, image, stock, variants = [] }: ProductPurchasePanelProps) {
  const router = useRouter();
  const { addItem, setCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [wishlisted, setWishlisted] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const inStock = stock > 0;
  const needsSelection = variants.some((variant) => !selections[variant.name]);
  const canPurchase = inStock && !needsSelection;

  function chooseOption(variantName: string, option: string) {
    setSelections((current) => ({ ...current, [variantName]: option }));
    setConfirmation("");
  }

  function announceAction(action: "cart" | "buy") {
    if (!canPurchase) return;

    const selectedOptions = Object.entries(selections)
      .map(([variant, option]) => `${variant}: ${option}`)
      .join(", ");
    const optionDescription = selectedOptions ? ` (${selectedOptions})` : "";
    setConfirmation(
      action === "cart"
        ? `${quantity} × ${name}${optionDescription} added to your bag.`
        : `${quantity} × ${name}${optionDescription} selected for purchase.`,
    );
    addItem({ productId, name, image, unitPrice: price }, quantity, selections);
    if (action === "cart") setCartOpen(true);
    else router.push("/checkout");
  }

  return (
    <div className="space-y-6 border-y border-[color:var(--line)] py-6">
      {variants.map((variant) => (
        <fieldset key={variant.name}>
          <legend className="mb-2.5 text-xs font-semibold text-[color:var(--ink)]">
            {variant.name}
            {selections[variant.name] ? <span className="ml-2 font-normal text-[color:var(--muted)]">{selections[variant.name]}</span> : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={selections[variant.name] === option}
                onClick={() => chooseOption(variant.name, option)}
                className={`min-h-10 min-w-10 rounded-sm border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${selections[variant.name] === option ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white" : "border-[color:var(--line-strong)] bg-white text-[color:var(--ink)] hover:border-[color:var(--ink)]"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-2 block text-xs font-semibold text-[color:var(--ink)]">Quantity</span>
          <div className="flex h-11 items-center border border-[color:var(--line-strong)] bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              title="Decrease quantity"
              disabled={quantity <= 1 || !inStock}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="grid size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <output aria-live="polite" className="min-w-8 text-center text-sm font-semibold tabular-nums text-[color:var(--ink)]">{quantity}</output>
            <button
              type="button"
              aria-label="Increase quantity"
              title="Increase quantity"
              disabled={quantity >= stock || !inStock}
              onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
              className="grid size-10 place-items-center text-[color:var(--ink)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
        <p className={`pb-1 text-xs font-medium ${inStock ? "text-[color:var(--stock)]" : "text-[color:var(--accent)]"}`}>
          {inStock ? `${stock} available` : "Currently out of stock"}
        </p>
      </div>

      {needsSelection ? <p className="-mt-3 text-xs text-[color:var(--muted)]">Choose an option for each variant to continue.</p> : null}

      <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => announceAction("cart")}
          className="flex h-12 items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ShoppingBag size={17} /> Add to cart
        </button>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setWishlisted((value) => !value)}
          className={`grid size-12 place-items-center rounded-sm border border-[color:var(--line-strong)] bg-white transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] ${wishlisted ? "text-[color:var(--accent)]" : "text-[color:var(--ink)]"}`}
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <button
        type="button"
        disabled={!canPurchase}
        onClick={() => announceAction("buy")}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-[color:var(--ink)] px-5 text-sm font-semibold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Zap size={16} /> Buy now
      </button>
      {confirmation ? <p role="status" className="text-xs leading-5 text-[color:var(--stock)]"><Check className="mr-1 inline" size={14} />{confirmation}</p> : null}
    </div>
  );
}