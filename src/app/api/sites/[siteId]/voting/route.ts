import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Vote } from "@/models/Vote";
import jwt from "jsonwebtoken";

// GET votes
async function getVotes(
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

    const query: any = { siteId };

    // Filter by status
    if (status === "active") {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (status === "ended") {
      query.endDate = { $lt: new Date() };
    } else if (status === "upcoming") {
      query.startDate = { $gt: new Date() };
    }

    const votes = await Vote.find(query)
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Vote.countDocuments(query);

    return NextResponse.json({
      votes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Votes fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create vote
async function createVote(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { title, description, options, startDate, endDate } =
      await request.json();

    // Get user from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const vote = new Vote({
      siteId,
      createdBy: decoded.userId,
      title,
      description,
      options,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    await vote.save();

    const populatedVote = await Vote.findById(vote._id).populate(
      "createdBy",
      "firstName lastName"
    );

    return NextResponse.json({
      message: "Vote created successfully",
      vote: populatedVote,
    });
  } catch (error) {
    console.error("Vote creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getVotes, [
  "super_admin",
  "site_admin",
  "resident",
]);
export const POST = withAuth(createVote, ["site_admin"]);
