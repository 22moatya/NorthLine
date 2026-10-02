import { z } from "zod";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Product ID is invalid");
const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(72, "Password is too long")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "Password must be at most 72 bytes");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase().max(254),
  password: passwordSchema,
}).strict();

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(1).max(72),
}).strict();

const checkoutItemSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int().min(1).max(20),
  variants: z.record(z.string().trim().min(1).max(60), z.string().trim().min(1).max(80)).default({}),
}).strict();

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(30),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.email().trim().toLowerCase().max(254),
    phone: z.string().trim().regex(/^\+?[\d ()-]{7,24}$/),
    addressLine1: z.string().trim().min(3).max(160),
    addressLine2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2).max(80),
    region: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(2).max(20),
    country: z.string().trim().length(2).toUpperCase(),
  }).strict(),
}).strict();

export const idempotencyKeySchema = z.uuid();

export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;