import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";
import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeCategory } from "@/lib/category-service";
import { categoryIdSchema, updateCategorySchema } from "@/lib/category-validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CategoryRouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: CategoryRouteContext): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  const { id } = await params;
  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) return errorResponse("Category ID is invalid", 400);

  try {
    const body: unknown = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    await connectToDatabase();
    const category = await Category.findById(parsedId.data).exec();
    if (!category) return errorResponse("Category not found", 404);

    const previousSlug = category.slug;
    const previousName = category.name;
    Object.assign(category, parsed.data);
    await category.save();

    if (category.slug !== previousSlug || category.name !== previousName) {
      await Product.updateMany(
        { category: category._id },
        { $set: { categorySlug: category.slug, categoryName: category.name } },
      ).exec();
    }

    return successResponse(serializeCategory(category.toObject()), "Category updated successfully");
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return errorResponse("A category with this slug already exists", 409);
    }
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: CategoryRouteContext): Promise<Response> {
  const authorizationError = await requireAdmin();
  if (authorizationError) return authorizationError;

  const { id } = await params;
  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) return errorResponse("Category ID is invalid", 400);

  try {
    await connectToDatabase();
    const category = await Category.findById(parsedId.data).exec();
    if (!category) return errorResponse("Category not found", 404);

    const productCount = await Product.countDocuments({ category: category._id }).exec();
    if (productCount > 0) {
      return errorResponse("Move or remove products from this category before deleting it", 409);
    }

    await category.deleteOne();
    return successResponse({ id: parsedId.data }, "Category deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}