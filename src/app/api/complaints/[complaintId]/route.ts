import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Complaint } from "@/models/Complaint";
import jwt from "jsonwebtoken";

// PUT update complaint (admin response)
async function updateComplaint(
  request: NextRequest,
  { params }: { params: { complaintId: string } }
) {
  try {
    await connectDB();

    const { complaintId } = params;
    const { status, adminResponse } = await request.json();

    // Get user from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.respondedBy = decoded.userId;
      updateData.respondedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true }
    )
      .populate("userId", "firstName lastName building unitNumber")
      .populate("respondedBy", "firstName lastName");

    if (!complaint) {
      return NextResponse.json(
        { message: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Complaint update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateComplaint, ["site_admin"]);
