import { z } from "zod";

export const adminOrderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const adminOrderIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Order ID is invalid");