import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Site } from "@/models/Site";
import { User } from "@/models/User";

// GET all sites with stats
async function getSites(request: NextRequest) {
  try {
    await connectDB();

    const sites = await Site.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "siteId",
          as: "users",
        },
      },
      {
        $addFields: {
          totalUsers: { $size: "$users" },
          adminUsers: {
            $size: {
              $filter: {
                input: "$users",
                cond: { $eq: ["$$this.role", "site_admin"] },
              },
            },
          },
          residentUsers: {
            $size: {
              $filter: {
                input: "$users",
                cond: { $eq: ["$$this.role", "resident"] },
              },
            },
          },
        },
      },
      {
        $project: {
          users: 0, // Remove users array from response
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Sites fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSites, ["super_admin"]);
