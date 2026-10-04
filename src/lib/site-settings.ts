import { cache } from "react";
import SiteSettingsModel from "@/models/SiteSettings";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

export function toSiteSettings(value: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!value) return { ...DEFAULT_SITE_SETTINGS };

  return {
    storeName: value.storeName ?? DEFAULT_SITE_SETTINGS.storeName,
    contactEmail: value.contactEmail ?? DEFAULT_SITE_SETTINGS.contactEmail,
    contactPhone: value.contactPhone ?? DEFAULT_SITE_SETTINGS.contactPhone,
    currency: value.currency ?? DEFAULT_SITE_SETTINGS.currency,
    logoUrl: value.logoUrl ?? DEFAULT_SITE_SETTINGS.logoUrl,
    primaryColor: value.primaryColor ?? DEFAULT_SITE_SETTINGS.primaryColor,
    accentColor: value.accentColor ?? DEFAULT_SITE_SETTINGS.accentColor,
    backgroundColor: value.backgroundColor ?? DEFAULT_SITE_SETTINGS.backgroundColor,
    shippingFlatRate: value.shippingFlatRate ?? DEFAULT_SITE_SETTINGS.shippingFlatRate,
    freeShippingThreshold: value.freeShippingThreshold ?? DEFAULT_SITE_SETTINGS.freeShippingThreshold,
    taxRatePercent: value.taxRatePercent ?? DEFAULT_SITE_SETTINGS.taxRatePercent,
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  await connectToDatabase();
  const settings = await SiteSettingsModel.findOne({ key: "store" })
    .select("-_id storeName contactEmail contactPhone currency logoUrl primaryColor accentColor backgroundColor shippingFlatRate freeShippingThreshold taxRatePercent")
    .lean<SiteSettings | null>()
    .exec();

  return toSiteSettings(settings);
});
