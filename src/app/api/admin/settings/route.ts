import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import SiteSettingsModel from "@/models/SiteSettings";
import { getSiteSettings, toSiteSettings } from "@/lib/site-settings";
import { siteSettingsPatchSchema, siteSettingsSchema } from "@/lib/site-settings-validations";
import type { SiteSettings } from "@/types/site-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  try {
    const settings: SiteSettings = await getSiteSettings();
    return successResponse(toSiteSettings(settings), "Store settings retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must contain valid JSON", 400);
  }

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOneAndUpdate(
      { key: "store" },
      {
        $set: {
          ...parsed.data,
          logoUrl: parsed.data.logoUrl.trim(),
          primaryColor: parsed.data.primaryColor.toLowerCase(),
          accentColor: parsed.data.accentColor.toLowerCase(),
          backgroundColor: parsed.data.backgroundColor.toLowerCase(),
        },
        $setOnInsert: { key: "store" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
      .select("-_id storeName contactEmail contactPhone currency logoUrl primaryColor accentColor backgroundColor shippingFlatRate freeShippingThreshold taxRatePercent")
      .lean<SiteSettings | null>()
      .exec();

    if (!settings) throw new Error("Store settings could not be saved");
    return successResponse(toSiteSettings(settings), "Store settings saved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must contain valid JSON", 400);
  }

  const parsed = siteSettingsPatchSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    await connectToDatabase();
    const update = { ...parsed.data };
    if (update.logoUrl !== undefined) update.logoUrl = update.logoUrl.trim();
    if (update.primaryColor !== undefined) update.primaryColor = update.primaryColor.toLowerCase();
    if (update.accentColor !== undefined) update.accentColor = update.accentColor.toLowerCase();
    if (update.backgroundColor !== undefined) update.backgroundColor = update.backgroundColor.toLowerCase();

    const settings = await SiteSettingsModel.findOneAndUpdate(
      { key: "store" },
      { $set: update, $setOnInsert: { key: "store" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
      .select("-_id storeName contactEmail contactPhone currency logoUrl primaryColor accentColor backgroundColor shippingFlatRate freeShippingThreshold taxRatePercent")
      .lean<SiteSettings | null>()
      .exec();

    if (!settings) throw new Error("Store settings could not be saved");
    return successResponse(toSiteSettings(settings), "Store settings saved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
