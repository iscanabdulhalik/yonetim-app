import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Site } from "@/models/Site";

// GET site settings
async function getSettings(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const site = await Site.findById(siteId);

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update site settings
async function updateSettings(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.siteCode;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const site = await Site.findByIdAndUpdate(siteId, updateData, {
      new: true,
    });

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      site,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSettings, ["super_admin", "site_admin"]);
export const PUT = withAuth(updateSettings, ["super_admin", "site_admin"]);
