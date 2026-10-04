import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkoutSchema, idempotencyKeySchema, registerSchema } from "@/lib/commerce-validations";
import { hasAdminAccess, isAdminEmail } from "@/lib/admin-access";
import { siteSettingsPatchSchema, siteSettingsSchema } from "@/lib/site-settings-validations";
import { calculateOrderCharges, DEFAULT_SITE_SETTINGS, formatMoney, type SiteSettings } from "@/types/site-settings";
import { toSiteSettings } from "@/lib/site-settings";

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

  describe("hasAdminAccess", () => {
    it("uses the configured email allowlist instead of a potentially stale session role", () => {
      const previousAllowlist = process.env.ADMIN_EMAILS;
      process.env.ADMIN_EMAILS = "owner@example.com";

      try {
        assert.equal(hasAdminAccess({ email: "OWNER@example.com" }), true);
        assert.equal(hasAdminAccess({ email: "customer@example.com" }), false);
        assert.equal(hasAdminAccess(null), false);
      } finally {
        if (previousAllowlist === undefined) delete process.env.ADMIN_EMAILS;
        else process.env.ADMIN_EMAILS = previousAllowlist;
      }
    });
  });
});

describe("siteSettingsSchema", () => {
  it("normalizes contact email and accepts supported display currencies", () => {
    const parsed = siteSettingsSchema.parse({
      storeName: " Example Store ",
      contactEmail: "HELP@EXAMPLE.COM",
      contactPhone: "+1 415 555 0134",
      currency: "EGP",
      logoUrl: "/brand/logo.png",
      primaryColor: "#202b25",
      accentColor: "#d84e31",
      backgroundColor: "#f7f8f5",
      shippingFlatRate: 5,
      freeShippingThreshold: 50,
      taxRatePercent: 8.25,
    });

    assert.equal(parsed.storeName, "Example Store");
    assert.equal(parsed.contactEmail, "help@example.com");
    assert.equal(parsed.currency, "EGP");
  });

  it("rejects unsupported currencies and invalid contact email addresses", () => {
    const settings = {
      storeName: "Example Store",
      contactEmail: "not-an-email",
      contactPhone: "",
      currency: "USD",
      logoUrl: "",
      primaryColor: "#202b25",
      accentColor: "#d84e31",
      backgroundColor: "#f7f8f5",
      shippingFlatRate: 5,
      freeShippingThreshold: null,
      taxRatePercent: 0,
    };

    assert.equal(siteSettingsSchema.safeParse(settings).success, false);
    assert.equal(siteSettingsSchema.safeParse({ ...settings, contactEmail: "", currency: "XYZ" }).success, false);
    assert.equal(siteSettingsSchema.safeParse({ ...settings, contactEmail: "", accentColor: "red" }).success, false);
    assert.equal(siteSettingsSchema.safeParse({ ...settings, contactEmail: "", logoUrl: "javascript:alert(1)" }).success, false);
  });

  it("validates partial settings updates without requiring unrelated fields", () => {
    assert.deepEqual(siteSettingsPatchSchema.parse({ currency: "EUR" }), { currency: "EUR" });
    assert.equal(siteSettingsPatchSchema.safeParse({ taxRatePercent: 101 }).success, false);
    assert.equal(siteSettingsPatchSchema.safeParse({}).success, false);
  });
});

describe("calculateOrderCharges", () => {
  it("applies flat shipping, free-shipping thresholds, and rounded subtotal tax", () => {
    const settings = { shippingFlatRate: 5, freeShippingThreshold: 50, taxRatePercent: 8.25 };
    assert.deepEqual(calculateOrderCharges(20, settings), { shippingCost: 5, taxAmount: 1.65, total: 26.65 });
    assert.deepEqual(calculateOrderCharges(50, settings), { shippingCost: 0, taxAmount: 4.13, total: 54.13 });
  });

  it("supports free shipping without a threshold and no tax", () => {
    assert.deepEqual(
      calculateOrderCharges(10, { shippingFlatRate: 0, freeShippingThreshold: null, taxRatePercent: 0 }),
      { shippingCost: 0, taxAmount: 0, total: 10 },
    );
  });
});

describe("formatMoney", () => {
  it("changes the displayed symbol without converting the amount", () => {
    assert.equal(formatMoney(123.45, "USD"), "$123.45");
    assert.equal(formatMoney(123.45, "EGP"), "ج.م 123.45");
  });

  describe("toSiteSettings", () => {
    it("returns only plain setting values and excludes database fields", () => {
      const storedSettings: Partial<SiteSettings> & { _id: { toJSON(): string } } = {
        ...DEFAULT_SITE_SETTINGS,
        storeName: "Example Store",
        _id: { toJSON: () => "mongo-id" },
      };
      const settings = toSiteSettings(storedSettings);

      assert.equal(settings.storeName, "Example Store");
      assert.deepEqual(Object.keys(settings).sort(), Object.keys(DEFAULT_SITE_SETTINGS).sort());
      assert.equal(Object.getPrototypeOf(settings), Object.prototype);
    });
  });
});