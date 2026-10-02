import Category, { type CategoryRecord } from "@/models/Category";
import type { CategoryDto } from "@/types/category";

type StoredCategory = CategoryRecord;

export function serializeCategory(category: StoredCategory): CategoryDto {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    ...(category.image ? { image: category.image } : {}),
    sortOrder: category.sortOrder,
    active: category.active,
  };
}

export async function listActiveCategories(): Promise<CategoryDto[]> {
  const categories = await Category.find({ active: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean<StoredCategory[]>()
    .exec();

  return categories.map(serializeCategory);
}