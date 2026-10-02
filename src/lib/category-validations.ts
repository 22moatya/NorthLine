import { z } from "zod";

const slugSchema = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i);

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema,
  description: z.string().trim().max(500).default(""),
  image: z.url().max(2048).optional(),
  sortOrder: z.number().int().min(0).max(1000).default(0),
  active: z.boolean().default(true),
}).strict();

export const updateCategorySchema = createCategorySchema.partial().strict().refine((category) => Object.keys(category).length > 0, {
  message: "At least one category field must be provided",
});

export const categoryIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Category ID is invalid");