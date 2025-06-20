import { NextRequest, NextResponse } from "next/server";

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ message, success: false }, { status });
}

export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    ...data,
    success: true,
    ...(message && { message }),
  });
}

export async function validateRequest(
  request: NextRequest,
  requiredFields: string[]
) {
  try {
    const body = await request.json();

    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`${field} is required`);
      }
    }

    return body;
  } catch (error) {
    throw new Error("Invalid request body");
  }
}

export function handleApiError(error: any) {
  console.error("API Error:", error);

  if (error.name === "ValidationError") {
    return createErrorResponse("Validation failed", 400);
  }

  if (error.name === "MongoError" || error.name === "MongooseError") {
    return createErrorResponse("Database error", 500);
  }

  return createErrorResponse(
    error.message || "Internal server error",
    error.status || 500
  );
}
