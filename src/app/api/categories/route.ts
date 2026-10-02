import Category from "@/models/Category";
import { requireAdmin } from "@/lib/admin-auth";
import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeCategory } from "@/lib/category-service";
import { createCategorySchema } from "@/lib/category-validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    await connectToDatabase();
    const categories = await Category.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean().exec();
    return successResponse(categories.map(serializeCategory), "Categories retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  try {
    const body: unknown = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    await connectToDatabase();
    const category = await Category.create(parsed.data);
    return successResponse(serializeCategory(category.toObject()), "Category created successfully", { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return errorResponse("A category with this slug already exists", 409);
    }
    return handleApiError(error);
  }
}