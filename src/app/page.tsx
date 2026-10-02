import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { findProducts } from "@/lib/product-service";
import ProductGrid from "@/components/products/ProductGrid";

export const metadata: Metadata = {
  title: "Northline Market | Thoughtful essentials for everyday life",
  description: "Shop the curated essentials and modern staples on Northline Market.",
};

export const dynamic = "force-dynamic";

async function getHomeCollections() {
  await connectToDatabase();

  const [featured, newest, bestSellers] = await Promise.all([
    findProducts({ page: 1, limit: 4, sort: "featured" }),
    findProducts({ page: 1, limit: 4, sort: "newest" }),
    findProducts({ page: 1, limit: 4, sort: "popular" }),
  ]);

  return {
    featured: featured.products,
    newest: newest.products,
    bestSellers: bestSellers.products,
  };
}

export default async function HomePage() {
  const { featured, newest, bestSellers } = await getHomeCollections();

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-6 sm:px-7 lg:px-10 lg:pt-8">
      <section className="overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)] shadow-[0_20px_50px_rgba(32,43,37,0.06)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                <Sparkles size={12} /> Thoughtful everyday living
              </p>
              <h1 className="font-display text-4xl leading-none text-[color:var(--ink)] sm:text-5xl lg:text-[4.2rem]">
                Elevate the things you use most.
              </h1>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              From clean desk essentials to refined essentials for home, work, and movement, Northline curates modern staples built for real routines.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-sm bg-[color:var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[color:var(--accent)]"
              >
                Shop collection <ArrowRight size={15} />
              </Link>
              <Link href="/products?sort=newest" className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--line)] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]">
                New arrivals
              </Link>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-sm border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">Products</dt>
                <dd className="mt-2 font-display text-2xl text-[color:var(--ink)]">31</dd>
              </div>
              <div className="rounded-sm border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">Categories</dt>
                <dd className="mt-2 font-display text-2xl text-[color:var(--ink)]">8</dd>
              </div>
              <div className="rounded-sm border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">Reviews</dt>
                <dd className="mt-2 font-display text-2xl text-[color:var(--ink)]">4.9</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[22px] bg-[color:var(--ink)] p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Editor pick</p>
              <h2 className="mt-3 font-display text-3xl leading-none">Workday essentials</h2>
              <p className="mt-3 text-sm text-white/75">Built for quiet focus, cleaner desks, and a calmer rhythm.</p>
              <Link href="/products?category=accessories" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Explore accessories <ArrowRight size={14} />
              </Link>
            </div>

            <div className="rounded-[22px] border border-[color:var(--line)] bg-[linear-gradient(135deg,#f7f2eb_0%,#edf1eb_100%)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">This week</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl leading-none text-[color:var(--ink)]">30% off</h2>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">smart finds under $120</p>
                </div>
                <div className="grid size-12 place-items-center rounded-full bg-white text-[color:var(--accent)] shadow-sm">
                  <TrendingUp size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">Shop by category</p>
            <h2 className="mt-2 font-display text-3xl text-[color:var(--ink)]">Curated openings</h2>
          </div>
          <Link href="/products" className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--accent)] hover:text-[color:var(--accent-deep)]">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PRODUCT_CATEGORIES.map((category, index) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition-colors hover:border-[color:var(--ink)] hover:bg-[color:var(--surface-soft)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm bg-[color:var(--surface-soft)] text-sm font-semibold text-[color:var(--ink)]">
                {index + 1}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">Collection</p>
              <h3 className="mt-2 font-display text-2xl text-[color:var(--ink)]">{category.label}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader title="Featured picks" eyebrow="Handpicked" href="/products?sort=featured" />
        {featured.length > 0 ? <ProductGrid products={featured} /> : <EmptyCollectionMessage />}
      </section>

      <section className="mt-14">
        <SectionHeader title="New arrivals" eyebrow="Fresh in" href="/products?sort=newest" />
        {newest.length > 0 ? <ProductGrid products={newest} /> : <EmptyCollectionMessage />}
      </section>

      <section className="mt-14">
        <SectionHeader title="Best sellers" eyebrow="Our most loved" href="/products?sort=popular" />
        {bestSellers.length > 0 ? <ProductGrid products={bestSellers} /> : <EmptyCollectionMessage />}
      </section>
    </main>
  );
}

function SectionHeader({ title, eyebrow, href }: { title: string; eyebrow: string; href: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl text-[color:var(--ink)]">{title}</h2>
      </div>
      <Link href={href} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--accent)] hover:text-[color:var(--accent-deep)]">
        View all <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function EmptyCollectionMessage() {
  return (
    <div className="rounded-[18px] border border-dashed border-[color:var(--line)] bg-[color:var(--surface-soft)] px-6 py-12 text-center text-sm text-[color:var(--muted)]">
      Collection coming soon.
    </div>
  );
}
