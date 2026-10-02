import { z } from "zod";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Must be a valid MongoDB ObjectId");
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Must contain only letters, numbers, and hyphens");

const variantSchema = z.object({
  name: z.string().trim().min(1).max(60),
  options: z.array(z.string().trim().min(1).max(80)).min(1).max(50),
});

const specificationsSchema = z
  .record(z.string().trim().min(1).max(100), z.string().trim().min(1).max(300))
  .refine((specifications) => Object.keys(specifications).length <= 50, {
    message: "A product can have at most 50 specifications",
  });

const productFieldsSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug: slugSchema.optional(),
    description: z.string().trim().min(10).max(10_000),
    shortDescription: z.string().trim().min(5).max(300),
    price: z.number().finite().positive().max(10_000_000),
    comparePrice: z.number().finite().positive().max(10_000_000).optional(),
    discount: z.number().int().min(0).max(100).optional(),
    images: z.array(z.url().max(2048)).min(1).max(12),
    category: objectIdSchema,
    categorySlug: slugSchema.optional(),
    categoryName: z.string().trim().min(1).max(80).optional(),
    brand: z.string().trim().min(1).max(100).optional(),
    sku: z
      .string()
      .trim()
      .min(2)
      .max(64)
      .regex(/^[a-z\d][a-z\d_-]*$/i, "SKU contains unsupported characters"),
    stock: z.number().int().min(0).max(10_000_000),
    rating: z.number().finite().min(0).max(5).optional(),
    numReviews: z.number().int().min(0).max(10_000_000).optional(),
    featured: z.boolean().optional(),
    variants: z.array(variantSchema).max(20).optional(),
    specifications: specificationsSchema.optional(),
  })
  .strict();

export const createProductSchema = productFieldsSchema
  .superRefine((product, context) => {
    if (product.comparePrice !== undefined && product.comparePrice <= product.price) {
      context.addIssue({
        code: "custom",
        path: ["comparePrice"],
        message: "Compare price must be greater than the current price",
      });
    }
  })
  .transform((product) => ({
    ...product,
    rating: product.rating ?? 0,
    numReviews: product.numReviews ?? 0,
    featured: product.featured ?? false,
  }));

export const updateProductSchema = productFieldsSchema
  .omit({ rating: true, numReviews: true })
  .partial()
  .strict()
  .superRefine((product, context) => {
    if (
      product.price !== undefined &&
      product.comparePrice !== undefined &&
      product.comparePrice <= product.price
    ) {
      context.addIssue({
        code: "custom",
        path: ["comparePrice"],
        message: "Compare price must be greater than the current price",
      });
    }

    if (Object.keys(product).length === 0) {
      context.addIssue({
        code: "custom",
        message: "At least one product field must be provided",
      });
    }
  });

const optionalQueryNumber = (minimum: number, maximum?: number) =>
  z.preprocess(
    (value: unknown) => (value === undefined ? undefined : Number(value)),
    z
      .number()
      .finite()
      .min(minimum)
      .max(maximum ?? Number.MAX_SAFE_INTEGER)
      .optional(),
  );

export const productQuerySchema = z
  .object({
    page: z.preprocess(
      (value: unknown) => (value === undefined ? 1 : Number(value)),
      z.number().int().min(1).max(1_000_000),
    ),
    limit: z.preprocess(
      (value: unknown) => (value === undefined ? 12 : Number(value)),
      z.number().int().min(1).max(100),
    ),
    search: z.string().max(120).optional().transform((value) => value?.trim() || undefined),
    category: z.string().trim().min(1).max(100).optional(),
    brand: z.string().trim().min(1).max(100).optional(),
    minPrice: optionalQueryNumber(0),
    maxPrice: optionalQueryNumber(0),
    rating: optionalQueryNumber(0, 5),
    availability: z.enum(["in_stock", "out_of_stock"]).optional(),
    sort: z.enum(["featured", "newest", "price_asc", "price_desc", "rating", "popular"]).default("featured"),
  })
  .strict()
  .superRefine((query, context) => {
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      context.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message: "Maximum price must be greater than or equal to minimum price",
      });
    }
  });

export const productIdSchema = objectIdSchema;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;