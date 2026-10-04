import { z } from "zod";
import { CURRENCIES, type CurrencyCode } from "@/types/site-settings";

const currencyCodes = CURRENCIES.map(({ code }) => code) as [CurrencyCode, ...CurrencyCode[]];

export const siteSettingsSchema = z.object({
  storeName: z.string().trim().min(1).max(100),
  contactEmail: z.union([z.email(), z.literal("")]).transform((value) => value.toLowerCase()),
  contactPhone: z.string().trim().max(30),
  currency: z.enum(currencyCodes),
  logoUrl: z.union([
    z.literal(""),
    z.string().trim().max(2048).regex(/^\/(?!\/)|^https:\/\//i, "Logo must use a site path or HTTPS URL"),
  ]),
  primaryColor: z.string().regex(/^#[\da-f]{6}$/i),
  accentColor: z.string().regex(/^#[\da-f]{6}$/i),
  backgroundColor: z.string().regex(/^#[\da-f]{6}$/i),
  shippingFlatRate: z.number().finite().min(0).max(1_000_000),
  freeShippingThreshold: z.number().finite().min(0).max(1_000_000).nullable(),
  taxRatePercent: z.number().finite().min(0).max(100),
});

export const siteSettingsPatchSchema = siteSettingsSchema.partial().refine(
  (settings) => Object.keys(settings).length > 0,
  "At least one setting is required",
);

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
