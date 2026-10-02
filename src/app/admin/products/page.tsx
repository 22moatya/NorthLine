import type { Metadata } from "next";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeCategory } from "@/lib/category-service";
import { serializeProduct } from "@/lib/product-service";
import type { StoredProduct } from "@/models/Product";
import type { CategoryRecord } from "@/models/Category";
import ProductManager from "@/components/admin/ProductManager";

export const metadata: Metadata = { title: "Manage products | Northline Market", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await connectToDatabase();
  const [storedProducts, storedCategories] = await Promise.all([
    Product.find().sort({ updatedAt: -1 }).limit(100).lean<StoredProduct[]>().exec(),
    Category.find().sort({ sortOrder: 1, name: 1 }).lean<CategoryRecord[]>().exec(),
  ]);

  return (
    <section>
      <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">Catalog</p><h2 className="mt-1 font-display text-3xl text-[color:var(--ink)]">Products</h2></div>
      <ProductManager products={storedProducts.map(serializeProduct)} categories={storedCategories.map(serializeCategory)} />
    </section>
  );
}