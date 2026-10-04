import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, ClipboardList, Tags } from "lucide-react";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await connectToDatabase();
  const [products, categories, orders, openOrders] = await Promise.all([
    Product.countDocuments().exec(),
    Category.countDocuments().exec(),
    Order.countDocuments().exec(),
    Order.countDocuments({ status: { $in: ["pending", "processing"] } }).exec(),
  ]);

  const metrics = [
    { label: "Products", value: products, icon: Boxes, href: "/admin/products", detail: "Manage inventory and listings" },
    { label: "Categories", value: categories, icon: Tags, href: "/admin/categories", detail: "Organize the catalog" },
    { label: "Orders", value: orders, icon: ClipboardList, href: "/admin/orders", detail: `${openOrders} need attention` },
  ];

  return (
    <section aria-labelledby="overview-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">Today at Northline</p>
          <h2 id="overview-heading" className="mt-1 font-display text-3xl text-[color:var(--ink)]">Overview</h2>
        </div>
        <Link href="/products" className="text-xs font-semibold text-[color:var(--muted)] underline underline-offset-4 hover:text-[color:var(--accent)]">View storefront</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, href, detail }) => (
          <Link key={label} href={href} className="border border-[color:var(--line)] bg-white p-5 transition-colors hover:border-[color:var(--ink)]">
            <div className="flex items-center justify-between text-[color:var(--muted)]"><span className="text-xs font-semibold uppercase tracking-[0.08em]">{label}</span><Icon size={17} /></div>
            <p className="mt-5 font-display text-4xl tabular-nums text-[color:var(--ink)]">{value.toLocaleString("en-US")}</p>
            <p className="mt-2 text-xs text-[color:var(--muted)]">{detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}