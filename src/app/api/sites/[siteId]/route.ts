import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Site } from "@/models/Site";
import { verifyToken } from "@/lib/auth";
import { User } from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

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

    const { siteId } = params;
    const site = await Site.findById(siteId);

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Check permission
    if (decoded.role !== "super_admin" && decoded.siteId !== siteId) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error("Site fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { siteId } = params;

    // Önce siteyi pasif yap (hard delete yerine)
    const site = await Site.findByIdAndUpdate(
      siteId,
      { isActive: false },
      { new: true }
    );

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Site kullanıcılarını da pasif yap
    await User.updateMany({ siteId }, { isActive: false });

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (error) {
    console.error("Site delete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

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

    const { siteId } = params;
    const updateData = await request.json();

    // Check permission
    if (decoded.role !== "super_admin" && decoded.siteId !== siteId) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const site = await Site.findByIdAndUpdate(siteId, updateData, {
      new: true,
    });

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error("Site update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
