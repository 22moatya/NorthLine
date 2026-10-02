import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";
import { findProductById } from "@/lib/product-service";
import ProductGallery from "@/components/products/ProductGallery";
import ProductPrice from "@/components/products/ProductPrice";
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel";
import ProductRating from "@/components/products/ProductRating";
import type { ProductDto } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

const getProduct = cache(findProductById);

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  let product: ProductDto | null;

  try {
    product = await getProduct(id);
  } catch (error) {
    console.error("Product metadata could not be loaded", error);
    return { title: "Product | Northline Market" };
  }

  if (!product) notFound();

  const description = product.shortDescription || product.description.slice(0, 160);
  return {
    title: `${product.name} | Northline Market`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images.map((url) => ({ url, alt: product.name })),
    },
  };
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1360px] px-4 pb-20 pt-7 sm:px-7 sm:pt-10 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <Link href="/products" className="transition-colors hover:text-[color:var(--accent)]">Shop</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="max-w-[65vw] truncate text-[color:var(--ink)]">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(390px,.94fr)] lg:gap-14 xl:gap-20">
        <ProductGallery name={product.name} images={product.images} />

        <section className="min-w-0 lg:py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {product.categoryName ?? product.categorySlug ?? "Collection"}
          </p>
          {product.brand ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{product.brand}</p> : null}
          <h1 className="mt-2 font-display text-4xl leading-[1.08] text-[color:var(--ink)] sm:text-5xl">{product.name}</h1>
          <a href="#reviews" className="mt-4 inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]">
            <ProductRating rating={product.rating} numReviews={product.numReviews} />
          </a>

          <div className="mt-6">
            <ProductPrice price={product.price} comparePrice={product.comparePrice} discount={product.discount} />
            {product.comparePrice !== undefined && product.comparePrice > product.price ? (
              <p className="mt-1 text-xs text-[color:var(--muted)]">You save {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.comparePrice - product.price)}</p>
            ) : null}
          </div>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[color:var(--muted)]">{product.shortDescription}</p>
          <ProductPurchasePanel
            productId={product.id}
            name={product.name}
            price={product.price}
            image={product.images[0] ?? ""}
            stock={product.stock}
            variants={product.variants}
          />

          <div className="grid grid-cols-2 gap-4 border-b border-[color:var(--line)] py-5 text-xs">
            <div>
              <span className="block text-[color:var(--muted)]">Availability</span>
              <span className={`mt-1 block font-semibold ${product.stock > 0 ? "text-[color:var(--stock)]" : "text-[color:var(--accent)]"}`}>
                {product.stock > 0 ? "In stock" : "Out of stock"}
              </span>
            </div>
            <div>
              <span className="block text-[color:var(--muted)]">SKU</span>
              <span className="mt-1 block font-semibold tabular-nums text-[color:var(--ink)]">{product.sku}</span>
            </div>
          </div>

          <section className="pt-6" aria-labelledby="description-heading">
            <h2 id="description-heading" className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--ink)]">Description</h2>
            <p className="text-sm leading-7 text-[color:var(--muted)]">{product.description}</p>
          </section>
        </section>
      </div>

      {product.specifications && Object.keys(product.specifications).length > 0 ? (
        <section className="mt-16 border-t border-[color:var(--line)] pt-8" aria-labelledby="specifications-heading">
          <div className="mb-5 flex items-center gap-2 text-[color:var(--ink)]">
            <ClipboardList size={17} aria-hidden="true" />
            <h2 id="specifications-heading" className="font-display text-2xl">Specifications</h2>
          </div>
          <dl className="grid gap-x-10 sm:grid-cols-2">
            {Object.entries(product.specifications).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[color:var(--line)] py-3 text-sm">
                <dt className="text-[color:var(--muted)]">{label}</dt>
                <dd className="text-right font-medium text-[color:var(--ink)]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section id="reviews" className="mt-16 border-t border-[color:var(--line)] py-8" aria-labelledby="reviews-heading">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--accent)]">Reviews</p>
            <h2 id="reviews-heading" className="mt-2 font-display text-3xl text-[color:var(--ink)]">Customer rating</h2>
          </div>
          <div className="flex flex-col gap-2">
            <ProductRating rating={product.rating} numReviews={product.numReviews} />
            <p className="text-xs text-[color:var(--muted)]">Based on {product.numReviews.toLocaleString("en-US")} reviews</p>
          </div>
        </div>
      </section>
    </main>
  );
}