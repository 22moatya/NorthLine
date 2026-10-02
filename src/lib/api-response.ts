import mongoose from "mongoose";
import { z } from "zod";
import type { ApiFailure, ApiSuccess, ProductPagination } from "@/types/product";

export function successResponse<T>(
  data: T,
  message: string,
  options: { status?: number; pagination?: ProductPagination } = {},
): Response {
  const body: ApiSuccess<T> = {
    success: true,
    message,
    data,
    ...(options.pagination ? { pagination: options.pagination } : {}),
  };

  return Response.json(body, { status: options.status ?? 200 });
}

export function errorResponse(
  message: string,
  status: number,
  errors?: ApiFailure["errors"],
): Response {
  const body: ApiFailure = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };

  return Response.json(body, { status });
}

export function validationErrorResponse(error: z.ZodError): Response {
  return errorResponse(
    "Invalid request data",
    400,
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  );
}

export function handleApiError(error: unknown): Response {
  if (error instanceof SyntaxError) {
    return errorResponse("Request body must contain valid JSON", 400);
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return errorResponse("Product data is invalid", 400);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return errorResponse("A product with this SKU or slug already exists", 409);
  }

  console.error("Product API request failed", error);
  return errorResponse("An unexpected server error occurred", 500);
}