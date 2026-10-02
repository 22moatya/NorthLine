"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { CategoryDto } from "@/types/category";
import type { ProductDto } from "@/types/product";

interface ProductManagerProps {
  products: ProductDto[];
  categories: CategoryDto[];
}

const fieldClass = "admin-input";

export default function ProductManager({ products, categories }: ProductManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku} ${product.brand ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const imageValues = String(formData.get("images") ?? "").split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean);
    const variantsValue = String(formData.get("variants") ?? "").trim();
    const specificationsValue = String(formData.get("specifications") ?? "").trim();

    let variants: unknown;
    let specifications: unknown;
    try {
      variants = variantsValue ? JSON.parse(variantsValue) : undefined;
      specifications = specificationsValue ? JSON.parse(specificationsValue) : undefined;
    } catch {
      setErrorMessage("Variants and specifications must contain valid JSON.");
      return;
    }

    const comparePriceValue = String(formData.get("comparePrice") ?? "").trim();
    const body = {
      name: String(formData.get("name") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
      ...(comparePriceValue ? { comparePrice: Number(comparePriceValue) } : {}),
      images: imageValues,
      category: String(formData.get("category") ?? ""),
      categorySlug: categories.find((category) => category.id === formData.get("category"))?.slug,
      categoryName: categories.find((category) => category.id === formData.get("category"))?.name,
      brand: String(formData.get("brand") ?? ""),
      sku: String(formData.get("sku") ?? ""),
      stock: Number(formData.get("stock")),
      featured: formData.get("featured") === "on",
      ...(variants ? { variants } : {}),
      ...(specifications ? { specifications } : {}),
    };

    setSaving(true);
    setMessage("");
    setErrorMessage("");
    try {
      const response = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.message ?? "Product could not be saved.");
        return;
      }

      setMessage(editing ? "Product updated." : "Product created.");
      setEditing(null);
      formRef.current?.reset();
      router.refresh();
    } catch {
      setErrorMessage("Product could not be saved. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: ProductDto) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setMessage("");
    setErrorMessage("");
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setErrorMessage(result.message ?? "Product could not be deleted.");
      return;
    }
    setMessage(`${product.name} deleted.`);
    if (editing?.id === product.id) {
      setEditing(null);
      formRef.current?.reset();
    }
    router.refresh();
  }

  function editProduct(product: ProductDto) {
    setEditing(product);
    setMessage("");
    setErrorMessage("");
  }

  function cancelEdit() {
    setEditing(null);
    formRef.current?.reset();
  }

  return (
    <div className="space-y-8">
      <section className="border border-[color:var(--line)] bg-white p-4 sm:p-6" aria-labelledby="product-form-heading">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">Catalog</p>
            <h3 id="product-form-heading" className="mt-1 font-display text-2xl text-[color:var(--ink)]">{editing ? "Edit product" : "Add product"}</h3>
          </div>
          {editing ? <button type="button" onClick={cancelEdit} aria-label="Cancel editing" title="Cancel editing" className="grid size-9 place-items-center rounded-sm border border-[color:var(--line)]"><X size={16} /></button> : null}
        </div>
        <form ref={formRef} key={editing?.id ?? "new-product"} onSubmit={saveProduct} className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Product name<input required name="name" defaultValue={editing?.name} maxLength={160} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Short description<input required name="shortDescription" defaultValue={editing?.shortDescription} maxLength={300} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Description<textarea required name="description" defaultValue={editing?.description} rows={3} className={`${fieldClass} min-h-24 py-2`} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)]">Price (USD)<input required name="price" type="number" min="0.01" step="0.01" defaultValue={editing?.price} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)]">Compare price<input name="comparePrice" type="number" min="0.01" step="0.01" defaultValue={editing?.comparePrice} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)]">SKU<input required name="sku" defaultValue={editing?.sku} maxLength={64} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)]">Stock<input required name="stock" type="number" min="0" step="1" defaultValue={editing?.stock ?? 0} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)]">Category<select required name="category" defaultValue={editing?.category ?? ""} className={fieldClass}><option value="" disabled>Select category</option>{categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="text-xs font-semibold text-[color:var(--ink)]">Brand<input name="brand" defaultValue={editing?.brand} maxLength={100} className={fieldClass} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Image URLs <span className="font-normal text-[color:var(--muted)]">One per line</span><textarea required name="images" defaultValue={editing?.images.join("\n")} rows={2} className={`${fieldClass} min-h-16 py-2`} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Variants JSON <span className="font-normal text-[color:var(--muted)]">Optional</span><textarea name="variants" defaultValue={editing?.variants ? JSON.stringify(editing.variants, null, 2) : ""} rows={3} placeholder={'[{"name":"Size","options":["S","M","L"]}]'} className={`${fieldClass} min-h-20 py-2 font-mono text-[11px]`} /></label>
          <label className="text-xs font-semibold text-[color:var(--ink)] sm:col-span-2">Specifications JSON <span className="font-normal text-[color:var(--muted)]">Optional</span><textarea name="specifications" defaultValue={editing?.specifications ? JSON.stringify(editing.specifications, null, 2) : ""} rows={3} placeholder={'{"Material":"Cotton"}'} className={`${fieldClass} min-h-20 py-2 font-mono text-[11px]`} /></label>
          <label className="flex min-h-10 items-center gap-2 text-xs font-semibold text-[color:var(--ink)] sm:col-span-2"><input name="featured" type="checkbox" defaultChecked={editing?.featured} className="size-4 accent-[color:var(--ink)]" /> Featured product</label>
          {errorMessage ? <p role="alert" className="text-xs text-[color:var(--accent)] sm:col-span-2">{errorMessage}</p> : null}
          {message ? <p role="status" className="text-xs text-[color:var(--stock)] sm:col-span-2">{message}</p> : null}
          <button disabled={saving || categories.length === 0} className="flex h-10 items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-xs font-semibold text-white hover:bg-[color:var(--accent)] disabled:opacity-50 sm:col-span-2">
            {editing ? <Check size={14} /> : <Plus size={14} />}{saving ? "Saving..." : editing ? "Save changes" : "Create product"}
          </button>
        </form>
      </section>

      <section aria-labelledby="products-list-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h3 id="products-list-heading" className="font-display text-2xl text-[color:var(--ink)]">Products</h3><p className="mt-1 text-xs text-[color:var(--muted)]">Showing up to 100 most recently updated items.</p></div>
          <label className="text-xs text-[color:var(--muted)]">Search<input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, SKU, brand" className="admin-input mt-1 h-9 w-full sm:w-56" /></label>
        </div>
        <div className="overflow-x-auto border-y border-[color:var(--line)] bg-white">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b border-[color:var(--line)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]"><tr><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">SKU</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[color:var(--canvas)]">
                  <td className="max-w-xs px-4 py-3"><p className="truncate font-semibold text-[color:var(--ink)]">{product.name}</p><p className="mt-0.5 truncate text-[10px] text-[color:var(--muted)]">{product.brand ?? "No brand"} · {product.categoryName ?? product.categorySlug}</p></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[color:var(--muted)]">{product.sku}</td>
                  <td className="px-4 py-3 tabular-nums text-[color:var(--ink)]">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 tabular-nums text-[color:var(--ink)]">{product.stock}</td>
                  <td className="px-4 py-3">{product.featured ? <span className="text-[color:var(--accent)]">Featured</span> : <span className="text-[color:var(--muted)]">Standard</span>}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" onClick={() => editProduct(product)} aria-label={`Edit ${product.name}`} title="Edit product" className="grid size-8 place-items-center rounded-sm text-[color:var(--ink)] hover:bg-[color:var(--surface-soft)]"><Pencil size={14} /></button><button type="button" onClick={() => void deleteProduct(product)} aria-label={`Delete ${product.name}`} title="Delete product" className="grid size-8 place-items-center rounded-sm text-[color:var(--muted)] hover:bg-red-50 hover:text-[color:var(--accent)]"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
              {filteredProducts.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[color:var(--muted)]">No products match this search.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}