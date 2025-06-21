import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export function withAuth(handler: Function, requiredRoles?: string[]) {
  return async (request: NextRequest, context?: any) => {
    try {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json(
          { message: "No token provided" },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
      }

      // Check roles if required
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return NextResponse.json(
          { message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Convert siteId to ObjectId if needed
      if (decoded.siteId && typeof decoded.siteId === "string") {
        try {
          decoded.siteId = new mongoose.Types.ObjectId(decoded.siteId);
        } catch (error) {
          // If conversion fails, keep as string (for compatibility)
        }
      }

      // Add user info to request
      const requestWithAuth = request as NextRequest & { user: any };
      requestWithAuth.user = decoded;

      return handler(requestWithAuth, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
