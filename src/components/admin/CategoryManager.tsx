"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { CategoryDto } from "@/types/category";

interface CategoryManagerProps {
  categories: CategoryDto[];
}

const fieldClass = "admin-input";

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const image = String(data.get("image") ?? "").trim();
    const body = {
      name: String(data.get("name") ?? ""),
      slug: String(data.get("slug") ?? ""),
      description: String(data.get("description") ?? ""),
      sortOrder: Number(data.get("sortOrder")),
      active: data.get("active") === "on",
      ...(image ? { image } : {}),
    };

    setSaving(true);
    setMessage("");
    setErrorMessage("");
    try {
      const response = await fetch(editing ? `/api/categories/${editing.id}` : "/api/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.message ?? "Category could not be saved.");
        return;
      }
      setMessage(editing ? "Category updated." : "Category created.");
      setEditing(null);
      formRef.current?.reset();
      router.refresh();
    } catch {
      setErrorMessage("Category could not be saved. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: CategoryDto) {
    if (!window.confirm(`Delete ${category.name}? Categories with products cannot be removed.`)) return;
    setErrorMessage("");
    setMessage("");
    const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setErrorMessage(result.message ?? "Category could not be deleted.");
      return;
    }
    setMessage(`${category.name} deleted.`);
    if (editing?.id === category.id) {
      setEditing(null);
      formRef.current?.reset();
    }
    router.refresh();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(300px,.7fr)_minmax(0,1.3fr)]">
      <section className="h-fit border border-[color:var(--line)] bg-white p-4 sm:p-6" aria-labelledby="category-form-heading">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--accent)]">Taxonomy</p><h3 id="category-form-heading" className="mt-1 font-display text-2xl text-[color:var(--ink)]">{editing ? "Edit category" : "Add category"}</h3></div>
          {editing ? <button type="button" onClick={() => { setEditing(null); formRef.current?.reset(); }} aria-label="Cancel editing" title="Cancel editing" className="grid size-9 place-items-center rounded-sm border border-[color:var(--line)]"><X size={16} /></button> : null}
        </div>
        <form ref={formRef} key={editing?.id ?? "new-category"} onSubmit={saveCategory} className="space-y-4">
          <label className="block text-xs font-semibold text-[color:var(--ink)]">Name<input required name="name" defaultValue={editing?.name} maxLength={80} className={fieldClass} /></label>
          <label className="block text-xs font-semibold text-[color:var(--ink)]">URL slug<input required name="slug" defaultValue={editing?.slug} maxLength={100} pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*" className={fieldClass} /></label>
          <label className="block text-xs font-semibold text-[color:var(--ink)]">Description<textarea name="description" defaultValue={editing?.description} rows={3} maxLength={500} className={`${fieldClass} min-h-20 py-2`} /></label>
          <label className="block text-xs font-semibold text-[color:var(--ink)]">Image URL<input name="image" type="url" defaultValue={editing?.image} className={fieldClass} /></label>
          <label className="block text-xs font-semibold text-[color:var(--ink)]">Sort order<input name="sortOrder" type="number" min="0" max="1000" defaultValue={editing?.sortOrder ?? categories.length * 10} className={fieldClass} /></label>
          <label className="flex min-h-9 items-center gap-2 text-xs font-semibold text-[color:var(--ink)]"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} className="size-4 accent-[color:var(--ink)]" /> Visible in storefront</label>
          {errorMessage ? <p role="alert" className="text-xs leading-5 text-[color:var(--accent)]">{errorMessage}</p> : null}
          {message ? <p role="status" className="text-xs text-[color:var(--stock)]">{message}</p> : null}
          <button disabled={saving} className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-xs font-semibold text-white hover:bg-[color:var(--accent)] disabled:opacity-50">{editing ? <Check size={14} /> : <Plus size={14} />}{saving ? "Saving..." : editing ? "Save category" : "Create category"}</button>
        </form>
      </section>

      <section aria-labelledby="category-list-heading">
        <div className="mb-4"><h3 id="category-list-heading" className="font-display text-2xl text-[color:var(--ink)]">Categories</h3><p className="mt-1 text-xs text-[color:var(--muted)]">Products in a category must be moved before it can be deleted.</p></div>
        <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)] bg-white">
          {categories.map((category) => (
            <article key={category.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0"><h4 className="text-sm font-semibold text-[color:var(--ink)]">{category.name}<span className={`ml-2 text-[10px] font-medium ${category.active ? "text-[color:var(--stock)]" : "text-[color:var(--muted)]"}`}>{category.active ? "Visible" : "Hidden"}</span></h4><p className="mt-1 text-[11px] text-[color:var(--muted)]">/{category.slug} · {category.productCount ?? 0} products · order {category.sortOrder}</p></div>
              <div className="flex gap-1"><button type="button" onClick={() => { setEditing(category); setMessage(""); setErrorMessage(""); }} aria-label={`Edit ${category.name}`} title="Edit category" className="grid size-8 place-items-center rounded-sm text-[color:var(--ink)] hover:bg-[color:var(--surface-soft)]"><Pencil size={14} /></button><button type="button" onClick={() => void deleteCategory(category)} aria-label={`Delete ${category.name}`} title="Delete category" className="grid size-8 place-items-center rounded-sm text-[color:var(--muted)] hover:bg-red-50 hover:text-[color:var(--accent)]"><Trash2 size={14} /></button></div>
            </article>
          ))}
          {categories.length === 0 ? <p className="px-5 py-10 text-center text-sm text-[color:var(--muted)]">No categories yet.</p> : null}
        </div>
      </section>
    </div>
  );
}