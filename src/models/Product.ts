import { model, models, Schema, Types, type Model } from "mongoose";
import type { ProductVariant } from "@/types/product";

export interface ProductRecord {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  discount: number;
  images: string[];
  category: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export type StoredProduct = ProductRecord & { _id: Types.ObjectId };

const variantSchema = new Schema<ProductVariant>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    options: { type: [String], required: true },
  },
  { _id: false },
);

const productSchema = new Schema<ProductRecord>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true, maxlength: 10_000 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
    price: { type: Number, required: true, min: 0.01 },
    comparePrice: { type: Number, min: 0.01 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: { type: [String], required: true, validate: [(images: string[]) => images.length > 0, "At least one image is required"] },
    category: { type: Schema.Types.ObjectId, required: true, ref: "Category", index: true },
    categorySlug: { type: String, trim: true, lowercase: true, index: true },
    categoryName: { type: String, trim: true, maxlength: 80 },
    brand: { type: String, trim: true, maxlength: 100, index: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0, index: true },
    numReviews: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    variants: { type: [variantSchema], default: undefined },
    specifications: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

productSchema.index({ name: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({
  name: "text",
  brand: "text",
  categoryName: "text",
  description: "text",
  shortDescription: "text",
});

const Product = (models.Product as Model<ProductRecord> | undefined) ?? model<ProductRecord>("Product", productSchema);

export default Product;