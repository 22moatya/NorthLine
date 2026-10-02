export type ProductSort =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular";

export type ProductAvailability = "in_stock" | "out_of_stock";

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  discount: number;
  images: string[];
  category: string;
  categorySlug?: string;
  categoryName?: string;
  brand?: string;
  sku: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  pagination?: ProductPagination;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ProductQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: ProductAvailability;
  sort: ProductSort;
}