import { model, models, Schema, type Model } from "mongoose";
import type { SiteSettings } from "@/types/site-settings";
import { CURRENCIES, DEFAULT_SITE_SETTINGS } from "@/types/site-settings";

export interface SiteSettingsRecord extends SiteSettings {
  key: string;
}

const siteSettingsSchema = new Schema<SiteSettingsRecord>(
  {
    key: { type: String, required: true, unique: true, default: "store" },
    storeName: { type: String, required: true, trim: true, maxlength: 100, default: DEFAULT_SITE_SETTINGS.storeName },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    contactPhone: { type: String, trim: true, maxlength: 30, default: "" },
    logoUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    primaryColor: { type: String, required: true, default: DEFAULT_SITE_SETTINGS.primaryColor },
    accentColor: { type: String, required: true, default: DEFAULT_SITE_SETTINGS.accentColor },
    backgroundColor: { type: String, required: true, default: DEFAULT_SITE_SETTINGS.backgroundColor },
    shippingFlatRate: { type: Number, required: true, min: 0, default: DEFAULT_SITE_SETTINGS.shippingFlatRate },
    freeShippingThreshold: { type: Number, min: 0, default: null },
    taxRatePercent: { type: Number, required: true, min: 0, max: 100, default: DEFAULT_SITE_SETTINGS.taxRatePercent },
    currency: {
      type: String,
      enum: CURRENCIES.map(({ code }) => code),
      required: true,
      default: DEFAULT_SITE_SETTINGS.currency,
    },
  },
  { timestamps: true, versionKey: false },
);

const SiteSettingsModel =
  (models.SiteSettings as Model<SiteSettingsRecord> | undefined) ??
  model<SiteSettingsRecord>("SiteSettings", siteSettingsSchema);

export default SiteSettingsModel;
