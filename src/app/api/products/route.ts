import type { NextRequest } from "next/server";
import Product, { type StoredProduct } from "@/models/Product";
import { authorizeProductWrite } from "@/lib/admin-auth";
import { handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/mongodb";
import { findProducts, serializeProduct, slugifyProductName } from "@/lib/product-service";
import { createProductSchema, productQuerySchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const parameters = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsedQuery = productQuerySchema.safeParse(parameters);

  if (!parsedQuery.success) {
    return validationErrorResponse(parsedQuery.error);
  }

  try {
    await connectToDatabase();
    const result = await findProducts(parsedQuery.data);
    return successResponse(result.products, "Products retrieved successfully", {
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  const authorizationError = await authorizeProductWrite(request);
  if (authorizationError) return authorizationError;

  try {
    const body: unknown = await request.json();
    const parsedProduct = createProductSchema.safeParse(body);

    if (!parsedProduct.success) {
      return validationErrorResponse(parsedProduct.error);
    }

    await connectToDatabase();
    const input = parsedProduct.data;
    const product = await Product.create({
      ...input,
      slug: input.slug ?? slugifyProductName(input.name),
      sku: input.sku.toUpperCase(),
      discount:
        input.comparePrice && input.comparePrice > input.price
          ? Math.round(((input.comparePrice - input.price) / input.comparePrice) * 100)
          : 0,
    });

    return successResponse(
      serializeProduct(product.toObject() as unknown as StoredProduct),
      "Product created successfully",
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}