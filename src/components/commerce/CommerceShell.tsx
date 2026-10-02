"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ArrowRight,
  Grid2x2,
  Heart,
  Home,
  LogOut,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

const CART_STORAGE_KEY = "northline-market-cart-v1";

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  variants: Record<string, string>;
}

interface CartItemInput extends Omit<CartLine, "key" | "quantity" | "variants"> {
  variants?: Record<string, string>;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItemInput, quantity: number, variants?: Record<string, string>) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_CHANGED_EVENT = "northline:cart-changed";

function readCartSnapshot(): string {
  try {
    return localStorage.getItem(CART_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerCartSnapshot(): string {
  return "[]";
}

function subscribeToCart(onChange: () => void): () => void {
  window.addEventListener(CART_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parseCartSnapshot(snapshot: string): CartLine[] {
  try {
    const storedCart: unknown = JSON.parse(snapshot);
    if (!Array.isArray(storedCart)) return [];
    return storedCart.filter((line): line is CartLine =>
      typeof line?.key === "string" &&
      typeof line?.productId === "string" &&
      typeof line?.name === "string" &&
      typeof line?.image === "string" &&
      typeof line?.unitPrice === "number" &&
      Number.isFinite(line.unitPrice) &&
      typeof line?.quantity === "number" &&
      Number.isInteger(line.quantity) &&
      line.quantity > 0 &&
      typeof line?.variants === "object" &&
      line.variants !== null,
    );
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    window.dispatchEvent(new Event(CART_CHANGED_EVENT));
  } catch {
    return;
  }
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CommerceShell");
  return context;
}

interface CommerceShellProps {
  children: ReactNode;
  user: { name: string | null; email: string | null; role: "customer" | "admin" } | null;
}

export default function CommerceShell({ children, user }: CommerceShellProps) {
  const cartSnapshot = useSyncExternalStore(subscribeToCart, readCartSnapshot, getServerCartSnapshot);
  const lines = parseCartSnapshot(cartSnapshot);
  const [cartOpen, setCartOpen] = useState(false);

  function addItem(item: CartItemInput, quantity: number, variants = item.variants ?? {}) {
    const sortedVariants = Object.fromEntries(Object.entries(variants).sort(([left], [right]) => left.localeCompare(right)));
    const key = `${item.productId}:${JSON.stringify(sortedVariants)}`;

    const existing = lines.find((line) => line.key === key);
    if (existing) {
      writeCart(lines.map((line) => line.key === key ? { ...line, quantity: line.quantity + quantity } : line));
    } else {
      writeCart([...lines, { ...item, key, quantity, variants: sortedVariants }]);
    }
  }

  function setQuantity(key: string, quantity: number) {
    if (quantity < 1) {
      writeCart(lines.filter((line) => line.key !== key));
      return;
    }
    writeCart(lines.map((line) => line.key === key ? { ...line, quantity: Math.min(quantity, 20) } : line));
  }

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = Math.round(lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0) * 100) / 100;
  const cartValue: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    addItem,
    setQuantity,
    removeItem: (key) => writeCart(lines.filter((line) => line.key !== key)),
    clearCart: () => writeCart([]),
    setCartOpen,
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Grid2x2 },
    { href: "/products?sort=featured", label: "Categories", icon: Grid2x2 },
    { href: "/products", label: "Search", icon: Search },
    { href: "/products", label: "Wishlist", icon: Heart },
  ];

  const categoryLinks = PRODUCT_CATEGORIES.slice(0, 5);

  return (
    <CartContext.Provider value={cartValue}>
      <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--canvas)]/95 backdrop-blur">
        <nav aria-label="Main navigation" className="mx-auto w-full max-w-[1500px] px-4 sm:px-7 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2 rounded-sm text-[color:var(--ink)] focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">
              <span className="grid size-8 place-items-center bg-[color:var(--ink)] text-xs font-bold text-white">N</span>
              <span className="font-display text-lg">Northline</span>
            </Link>

            <div className="hidden items-center gap-6 xl:flex">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)] transition-colors hover:text-[color:var(--accent)]">
                  <Icon size={14} />
                  <span>{label}</span>
                </Link>
              ))}
              {user ? <Link href="/orders" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)] hover:text-[color:var(--accent)]">Orders</Link> : null}
              {user?.role === "admin" ? <Link href="/admin" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent)] hover:text-[color:var(--accent-deep)]">Admin</Link> : null}
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href={user ? "/account" : "/account/login"}
                aria-label={user ? "My account" : "Sign in"}
                title={user ? "My account" : "Sign in"}
                className="flex h-10 items-center gap-2 rounded-sm px-2 text-xs font-semibold text-[color:var(--ink)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] sm:px-3"
              >
                <UserRound size={17} />
                <span className="hidden sm:inline">{user?.name ?? "Account"}</span>
              </Link>
              {user ? (
                <button type="button" onClick={() => signOut({ redirectTo: "/products" })} aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-sm text-[color:var(--muted)] hover:bg-white hover:text-[color:var(--accent)]">
                  <LogOut size={16} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Open bag, ${itemCount} items`}
                title="Open bag"
                className="relative flex h-10 items-center gap-2 rounded-sm px-2 text-xs font-semibold text-[color:var(--ink)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] sm:px-3"
              >
                <ShoppingBag size={17} />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 ? <span className="grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] leading-5 text-white">{itemCount}</span> : null}
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 xl:hidden">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className="flex shrink-0 items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                <Icon size={12} />
                <span>{label}</span>
              </Link>
            ))}
            {categoryLinks.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`} className="shrink-0 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                {category.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {children}

      {cartOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
          <button type="button" aria-label="Close bag" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/35" />
          <aside role="dialog" aria-modal="true" aria-labelledby="cart-heading" className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-[color:var(--line)] px-5">
              <h2 id="cart-heading" className="font-display text-2xl text-[color:var(--ink)]">Your bag <span className="font-sans text-sm text-[color:var(--muted)]">({itemCount})</span></h2>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag" title="Close bag" className="grid size-9 place-items-center rounded-full hover:bg-[color:var(--surface-soft)]">
                <X size={18} />
              </button>
            </div>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag size={28} strokeWidth={1.4} className="text-[color:var(--muted)]" />
                <p className="mt-4 font-display text-xl text-[color:var(--ink)]">Your bag is empty</p>
                <button type="button" onClick={() => setCartOpen(false)} className="mt-4 text-xs font-semibold text-[color:var(--accent)] underline underline-offset-4">Continue shopping</button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-[color:var(--line)] overflow-y-auto px-5">
                  {lines.map((line) => (
                    <li key={line.key} className="flex gap-4 py-5">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-[color:var(--surface-soft)]">
                        {line.image ? <Image src={line.image} alt="" width={80} height={96} sizes="80px" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/products/${line.productId}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-semibold text-[color:var(--ink)] hover:text-[color:var(--accent)]">{line.name}</Link>
                        {Object.keys(line.variants).length > 0 ? <p className="mt-1 text-[11px] text-[color:var(--muted)]">{Object.entries(line.variants).map(([name, value]) => `${name}: ${value}`).join(" · ")}</p> : null}
                        <p className="mt-1 text-xs font-semibold text-[color:var(--ink)]">${line.unitPrice.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-8 items-center border border-[color:var(--line)]">
                            <button type="button" aria-label={`Decrease ${line.name} quantity`} onClick={() => setQuantity(line.key, line.quantity - 1)} className="grid size-8 place-items-center"><Minus size={12} /></button>
                            <span className="min-w-6 text-center text-xs tabular-nums">{line.quantity}</span>
                            <button type="button" aria-label={`Increase ${line.name} quantity`} onClick={() => setQuantity(line.key, line.quantity + 1)} className="grid size-8 place-items-center"><Plus size={12} /></button>
                          </div>
                          <button type="button" aria-label={`Remove ${line.name}`} onClick={() => cartValue.removeItem(line.key)} className="grid size-8 place-items-center text-[color:var(--muted)] hover:text-[color:var(--accent)]"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[color:var(--line)] px-5 py-5">
                  <div className="mb-4 flex justify-between text-sm">
                    <span className="text-[color:var(--muted)]">Subtotal</span>
                    <span className="font-semibold tabular-nums text-[color:var(--ink)]">${subtotal.toFixed(2)}</span>
                  </div>
                  <Link href="/checkout" onClick={() => setCartOpen(false)} className="flex h-12 items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent)]">
                    Continue to checkout <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}