import { model, models, Schema, type Model } from "mongoose";
import type { OrderRecord } from "@/types/order";

const orderLineSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true, maxlength: 160 },
    slug: { type: String, required: true, maxlength: 180 },
    image: { type: String, required: true, maxlength: 2048 },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    variants: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    addressLine1: { type: String, required: true, trim: true, maxlength: 160 },
    addressLine2: { type: String, trim: true, maxlength: 160 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    region: { type: String, required: true, trim: true, maxlength: 80 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    country: { type: String, required: true, uppercase: true, trim: true, minlength: 2, maxlength: 2 },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderRecord>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    idempotencyKey: { type: String, required: true, maxlength: 100 },
    items: { type: [orderLineSchema], required: true, validate: [(items: unknown[]) => items.length > 0, "An order must contain at least one item"] },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["USD"], default: "USD" },
    status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
  },
  { timestamps: true, versionKey: false },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });

const Order = (models.Order as Model<OrderRecord> | undefined) ?? model<OrderRecord>("Order", orderSchema);

export default Order;