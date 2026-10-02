import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkoutSchema, idempotencyKeySchema, registerSchema } from "@/lib/commerce-validations";
import { isAdminEmail } from "@/lib/admin-access";

const validAddress = {
  fullName: "Morgan Lee",
  email: "morgan@example.com",
  phone: "+1 415 555 0134",
  addressLine1: "25 Market Street",
  city: "San Francisco",
  region: "California",
  postalCode: "94105",
  country: "us",
};

describe("registerSchema", () => {
  it("normalizes email and accepts a sufficiently long password", () => {
    const parsed = registerSchema.parse({
      name: "Morgan Lee",
      email: "Morgan@Example.com",
      password: "a-long-passphrase-42",
    });

    assert.equal(parsed.email, "morgan@example.com");
  });

  it("rejects short passwords and passwords that exceed bcrypt's byte limit", () => {
    assert.equal(registerSchema.safeParse({ name: "Morgan Lee", email: "morgan@example.com", password: "short" }).success, false);
    assert.equal(registerSchema.safeParse({ name: "Morgan Lee", email: "morgan@example.com", password: "🙂".repeat(20) }).success, false);
  });
});

describe("checkoutSchema", () => {
  it("validates checkout lines and normalizes country codes", () => {
    const parsed = checkoutSchema.parse({
      shippingAddress: validAddress,
      items: [{ productId: "650000000000000000000001", quantity: 2 }],
    });

    assert.equal(parsed.shippingAddress.country, "US");
    assert.deepEqual(parsed.items[0].variants, {});
  });

  it("rejects invalid product IDs, excessive quantities, and malformed addresses", () => {
    assert.equal(checkoutSchema.safeParse({ shippingAddress: validAddress, items: [{ productId: "bad", quantity: 1 }] }).success, false);
    assert.equal(checkoutSchema.safeParse({ shippingAddress: validAddress, items: [{ productId: "650000000000000000000001", quantity: 21 }] }).success, false);
    assert.equal(checkoutSchema.safeParse({ shippingAddress: { ...validAddress, phone: "not a phone" }, items: [{ productId: "650000000000000000000001", quantity: 1 }] }).success, false);
  });
});

describe("idempotencyKeySchema", () => {
  it("accepts UUID keys and rejects arbitrary values", () => {
    assert.equal(idempotencyKeySchema.safeParse("ab1cdef0-1234-4abc-8abc-123456789abc").success, true);
    assert.equal(idempotencyKeySchema.safeParse("retry-key").success, false);
  });
});

describe("isAdminEmail", () => {
  it("grants the admin role only to case-insensitive allowlisted addresses", () => {
    const previousAllowlist = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "ops@example.com, admin@example.com ";

    try {
      assert.equal(isAdminEmail("ADMIN@example.com"), true);
      assert.equal(isAdminEmail("customer@example.com"), false);
    } finally {
      if (previousAllowlist === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = previousAllowlist;
    }
  });
});