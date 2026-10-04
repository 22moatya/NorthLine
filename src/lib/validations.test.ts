import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProductSchema, productQuerySchema, updateProductSchema } from "@/lib/validations";
import { createPartialSearchRegex } from "@/lib/product-service";
import { createWhatsAppOrderLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";

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

  describe("createPartialSearchRegex", () => {
    it("matches incomplete text anywhere in searchable product fields", () => {
      const regex = createPartialSearchRegex("acb");
      assert.equal(regex.test("MacBook Air"), true);
      assert.equal(regex.test("macbook air"), true);
      assert.equal(regex.test("iPhone 15"), false);
    });

    describe("WhatsApp order links", () => {
      it("normalizes international phone numbers and creates an encoded order message", () => {
        assert.equal(normalizeWhatsAppNumber("+20 (100) 123-4567"), "201001234567");
        assert.equal(normalizeWhatsAppNumber("0044 20 1234 5678"), "442012345678");
        assert.equal(
          createWhatsAppOrderLink("+20 (100) 123-4567", "Sam Lee", "NL-123"),
          "https://wa.me/201001234567?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%20Sam%20Lee%D8%8C%20%D9%86%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%D9%83%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%B7%D9%84%D8%A8%D9%83%20%D8%B1%D9%82%D9%85%20NL-123."
        );
      });

      it("rejects numbers that are not valid international WhatsApp numbers", () => {
        assert.equal(normalizeWhatsAppNumber("555-1234"), null);
        assert.equal(createWhatsAppOrderLink("not a phone", "Sam Lee", "NL-123"), null);
      });
    });

    it("treats typed punctuation as literal search text", () => {
      const regex = createPartialSearchRegex("C++");
      assert.equal(regex.test("Headphones C++ Edition"), true);
      assert.equal(regex.test("Cxx Edition"), false);
    });
  });

  it("rejects invalid pagination, sort values, and price ranges", () => {
    assert.equal(productQuerySchema.safeParse({ page: "0" }).success, false);
    assert.equal(productQuerySchema.safeParse({ limit: "101" }).success, false);
    assert.equal(productQuerySchema.safeParse({ sort: "random" }).success, false);
    assert.equal(productQuerySchema.safeParse({ availability: "available" }).success, false);
    assert.equal(productQuerySchema.safeParse({ minPrice: "500", maxPrice: "100" }).success, false);
  });
});