import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProductSchema, productQuerySchema, updateProductSchema } from "@/lib/validations";

const validProduct = {
  name: "Studio Headphones",
  description: "Wireless over-ear headphones with active noise cancellation.",
  shortDescription: "Comfortable wireless headphones.",
  price: 129,
  comparePrice: 159,
  images: ["https://images.example.com/headphones.jpg"],
  category: "650000000000000000000001",
  sku: "AUD-STUDIO-01",
  stock: 8,
};

describe("createProductSchema", () => {
  it("accepts a valid product and applies safe defaults", () => {
    const parsed = createProductSchema.parse(validProduct);

    assert.equal(parsed.featured, false);
    assert.equal(parsed.rating, 0);
    assert.equal(parsed.numReviews, 0);
  });

  it("rejects invalid categories, stock, and non-discounted compare prices", () => {
    assert.equal(createProductSchema.safeParse({ ...validProduct, category: "electronics" }).success, false);
    assert.equal(createProductSchema.safeParse({ ...validProduct, stock: -1 }).success, false);
    assert.equal(createProductSchema.safeParse({ ...validProduct, comparePrice: 100 }).success, false);
  });

  it("requires at least one valid image and valid variant options", () => {
    assert.equal(createProductSchema.safeParse({ ...validProduct, images: [] }).success, false);
    assert.equal(
      createProductSchema.safeParse({
        ...validProduct,
        variants: [{ name: "Size", options: [] }],
      }).success,
      false,
    );
  });
});

describe("updateProductSchema", () => {
  it("rejects empty updates and accepts a valid partial update", () => {
    assert.equal(updateProductSchema.safeParse({}).success, false);
    assert.equal(updateProductSchema.safeParse({ stock: 0 }).success, true);
  });
});

describe("productQuerySchema", () => {
  it("applies listing defaults and treats a whitespace-only search as empty", () => {
    const parsed = productQuerySchema.parse({ search: "   " });

    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 12);
    assert.equal(parsed.sort, "featured");
    assert.equal(parsed.search, undefined);
  });

  it("rejects invalid pagination, sort values, and price ranges", () => {
    assert.equal(productQuerySchema.safeParse({ page: "0" }).success, false);
    assert.equal(productQuerySchema.safeParse({ limit: "101" }).success, false);
    assert.equal(productQuerySchema.safeParse({ sort: "random" }).success, false);
    assert.equal(productQuerySchema.safeParse({ availability: "available" }).success, false);
    assert.equal(productQuerySchema.safeParse({ minPrice: "500", maxPrice: "100" }).success, false);
  });
});