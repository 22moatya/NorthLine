import { createHash, timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";
import { errorResponse } from "@/lib/api-response";

export async function requireAdmin(): Promise<Response | null> {
  const session = await auth();
  if (!session?.user) return errorResponse("Authentication is required", 401);
  if (session.user.role !== "admin") return errorResponse("Administrator access is required", 403);
  return null;
}

export async function authorizeProductWrite(request: Request): Promise<Response | null> {
  const session = await auth();
  if (session?.user.role === "admin") return null;

  const configuredKey = process.env.PRODUCTS_ADMIN_API_KEY;

  if (!configuredKey || configuredKey.length < 32) {
    return errorResponse("Product management is not configured", 503);
  }

  const suppliedKey = request.headers.get("x-admin-api-key");

  if (!suppliedKey) {
    return errorResponse("Authentication is required", 401);
  }

  const expectedDigest = createHash("sha256").update(configuredKey).digest();
  const suppliedDigest = createHash("sha256").update(suppliedKey).digest();

  if (!timingSafeEqual(expectedDigest, suppliedDigest)) {
    return errorResponse("You are not authorized to manage products", 403);
  }

  return null;
}