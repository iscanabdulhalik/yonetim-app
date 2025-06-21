import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Complaint } from "@/models/Complaint";
import jwt from "jsonwebtoken";

// GET complaints
async function getComplaints(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const query: any = { siteId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const complaints = await Complaint.find(query)
      .populate("userId", "firstName lastName building unitNumber")
      .populate("respondedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    // Get complaint statistics
    const stats = await Complaint.aggregate([
      { $match: { siteId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      complaints,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Complaints fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create complaint
async function createComplaint(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { title, description, category, priority } = await request.json();

    // Get user from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const complaint = new Complaint({
      siteId,
      userId: decoded.userId,
      title,
      description,
      category: category || "other",
      priority: priority || "normal",
    });

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      "userId",
      "firstName lastName building unitNumber"
    );

    return NextResponse.json({
      message: "Complaint created successfully",
      complaint: populatedComplaint,
    });
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getComplaints, [
  "super_admin",
  "site_admin",
  "resident",
]);
export const POST = withAuth(createComplaint, ["resident"]);
