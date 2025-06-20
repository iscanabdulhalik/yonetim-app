import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Announcement } from "@/models/Announcement";

// GET announcements
async function getAnnouncements(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const priority = searchParams.get("priority");

    const query: any = { siteId, isActive: true };

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    const announcements = await Announcement.find(query)
      .populate("authorId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    return NextResponse.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Announcements fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create announcement
async function createAnnouncement(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { title, content, priority } = await request.json();

    // Get user from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const announcement = new Announcement({
      siteId,
      authorId: decoded.userId,
      title,
      content,
      priority: priority || "normal",
    });

    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(
      announcement._id
    ).populate("authorId", "firstName lastName");

    return NextResponse.json({
      message: "Announcement created successfully",
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    console.error("Announcement creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAnnouncements, [
  "super_admin",
  "site_admin",
  "resident",
]);
export const POST = withAuth(createAnnouncement, ["site_admin"]);
