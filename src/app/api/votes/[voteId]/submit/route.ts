import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Vote } from "@/models/Vote";
import jwt from "jsonwebtoken";

// POST submit vote
async function submitVote(
  request: NextRequest,
  { params }: { params: { voteId: string } }
) {
  try {
    await connectDB();

    const { voteId } = params;
    const { option } = await request.json();

    // Get user from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const vote = await Vote.findById(voteId);

    if (!vote) {
      return NextResponse.json({ message: "Vote not found" }, { status: 404 });
    }

    // Check if voting is active
    const now = new Date();
    if (now < vote.startDate || now > vote.endDate || !vote.isActive) {
      return NextResponse.json(
        { message: "Voting is not active" },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = vote.votes.find(
      (v) => v.userId.toString() === decoded.userId
    );

    if (existingVote) {
      return NextResponse.json(
        { message: "You have already voted" },
        { status: 400 }
      );
    }

    // Validate option
    if (option < 0 || option >= vote.options.length) {
      return NextResponse.json({ message: "Invalid option" }, { status: 400 });
    }

    // Add vote
    vote.votes.push({
      userId: decoded.userId,
      option,
      votedAt: new Date(),
    });

    await vote.save();

    return NextResponse.json({
      message: "Vote submitted successfully",
    });
  } catch (error) {
    console.error("Vote submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(submitVote, ["resident"]);
