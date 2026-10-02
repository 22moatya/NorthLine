import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { errorResponse, handleApiError, successResponse, validationErrorResponse } from "@/lib/api-response";
import { registerSchema } from "@/lib/commerce-validations";
import { isAdminEmail } from "@/lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    await connectToDatabase();
    const existingUser = await User.exists({ email: parsed.data.email });
    if (existingUser) return errorResponse("An account with this email already exists", 409);

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: isAdminEmail(parsed.data.email) ? "admin" : "customer",
    });

    return successResponse(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      "Account created successfully",
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return errorResponse("An account with this email already exists", 409);
    }

    return handleApiError(error);
  }
}