import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

// POST reset user password (Site Admin only)
async function resetPassword(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Get user info from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find the user to reset password
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Check if admin has permission to reset this user's password
    if (decoded.role === "site_admin") {
      // Site admin can only reset passwords for users in their site
      if (targetUser.siteId?.toString() !== decoded.siteId.toString()) {
        return NextResponse.json(
          { message: "Bu kullanıcının şifresini sıfırlama yetkiniz yok" },
          { status: 403 }
        );
      }

      // Site admin cannot reset another site admin's password
      if (
        targetUser.role === "site_admin" &&
        targetUser._id.toString() !== decoded.userId
      ) {
        return NextResponse.json(
          { message: "Başka yöneticinin şifresini sıfırlayamazsınız" },
          { status: 403 }
        );
      }
    } else if (decoded.role !== "super_admin") {
      return NextResponse.json(
        { message: "Yetkiniz bulunmuyor" },
        { status: 403 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      // Optionally, you could add a flag to force password change on next login
      // mustChangePassword: true
    });

    return NextResponse.json({
      message: "Şifre başarıyla sıfırlandı",
      success: true,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Şifre sıfırlanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(resetPassword, ["super_admin", "site_admin"]);
