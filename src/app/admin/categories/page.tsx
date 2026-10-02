import type { Metadata } from "next";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeCategory } from "@/lib/category-service";
import type { CategoryRecord } from "@/models/Category";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Manage categories | Northline Market", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await connectToDatabase();
  const storedCategories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean<CategoryRecord[]>().exec();
  const productCounts = await Product.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]).exec();
  const countsByCategory = new Map(productCounts.map((item) => [item._id.toString(), item.count]));
  const categories = storedCategories.map((category) => ({
    ...serializeCategory(category),
    productCount: countsByCategory.get(category._id.toString()) ?? 0,
  }));

  return (
    <section>
      <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">Taxonomy</p><h2 className="mt-1 font-display text-3xl text-[color:var(--ink)]">Categories</h2></div>
      <CategoryManager categories={categories} />
    </section>
  );
}