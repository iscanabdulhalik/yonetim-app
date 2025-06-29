import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

// GET single user
async function getUser(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;
    const user = await User.findById(userId)
      .select("-password")
      .populate("siteId", "name siteCode");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update user
async function updateUser(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;
    const updateData = await request.json();

    // Remove sensitive fields that shouldn't be updated this way
    delete updateData._id;
    delete updateData.role; // Role changes should be separate endpoint
    delete updateData.siteId;

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password")
      .populate("siteId", "name siteCode");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE user (soft delete)
async function deleteUser(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUser, ["super_admin", "site_admin"]);
export const PUT = withAuth(updateUser, ["super_admin", "site_admin"]);
export const DELETE = withAuth(deleteUser, ["super_admin", "site_admin"]);
