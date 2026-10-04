import { cache } from "react";
import { Types, type QueryFilter, type SortOrder } from "mongoose";
import Product, { type ProductRecord, type StoredProduct } from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";
import { productIdSchema } from "@/lib/validations";
import type { ProductDto, ProductQuery, ProductSort } from "@/types/product";

const sortOptions: Record<ProductSort, Record<string, SortOrder>> = {
  featured: { featured: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  rating: { rating: -1, numReviews: -1 },
  popular: { numReviews: -1, rating: -1 },
};

export function serializeProduct(product: StoredProduct): ProductDto {
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    ...(product.comparePrice !== undefined ? { comparePrice: product.comparePrice } : {}),
    discount,
    images: product.images,
    category: product.category.toString(),
    ...(product.categorySlug ? { categorySlug: product.categorySlug } : {}),
    ...(product.categoryName ? { categoryName: product.categoryName } : {}),
    ...(product.brand ? { brand: product.brand } : {}),
    sku: product.sku,
    stock: product.stock,
    rating: product.rating,
    numReviews: product.numReviews,
    featured: product.featured,
    ...(product.variants ? { variants: product.variants } : {}),
    ...(product.specifications ? { specifications: product.specifications } : {}),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function slugifyProductName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createPartialSearchRegex(search: string): RegExp {
  return new RegExp(escapeRegExp(search), "i");
}

export async function findProducts(query: ProductQuery) {
  const filter: QueryFilter<ProductRecord> = {};

  if (query.search) {
    const partialMatch = createPartialSearchRegex(query.search);
    filter.$or = ["name", "brand", "sku", "categoryName"].map((field) => ({
      [field]: partialMatch,
    }));
  }

  if (query.category) {
    if (productIdSchema.safeParse(query.category).success) {
      filter.category = new Types.ObjectId(query.category);
    } else {
      filter.categorySlug = query.category.toLowerCase();
    }
  }

  if (query.brand) {
    filter.brand = new RegExp(`^${escapeRegExp(query.brand)}$`, "i");
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {
      ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
    };
  }

  if (query.rating !== undefined) {
    filter.rating = { $gte: query.rating };
  }

  if (query.availability === "in_stock") {
    filter.stock = { $gt: 0 };
  } else if (query.availability === "out_of_stock") {
    filter.stock = 0;
  }

  const mongoQuery = Product.find(filter);
  mongoQuery.sort(sortOptions[query.sort]);

  const [products, total] = await Promise.all([
    mongoQuery.skip((query.page - 1) * query.limit).limit(query.limit).lean<StoredProduct[]>(),
    Product.countDocuments(filter).exec(),
  ]);

  return {
    products: products.map(serializeProduct),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export const findProductById = cache(async (id: string): Promise<ProductDto | null> => {
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) return null;

  await connectToDatabase();
  const product = await Product.findById(parsedId.data).lean<StoredProduct | null>().exec();
  return product ? serializeProduct(product) : null;
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}