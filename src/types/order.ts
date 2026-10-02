import type { Types } from "mongoose";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface OrderLine {
  productId: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variants: Record<string, string>;
}

export interface OrderRecord {
  orderNumber: string;
  user: Types.ObjectId;
  idempotencyKey: string;
  items: OrderLine[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: "USD";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    image: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    variants: Record<string, string>;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: "USD";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}