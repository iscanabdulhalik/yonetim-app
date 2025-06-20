import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Site } from "@/models/Site";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";

async function handler(request: NextRequest) {
  try {
    await connectDB();

    const [totalSites, totalUsers, activeSites, totalRevenue] =
      await Promise.all([
        Site.countDocuments({}),
        User.countDocuments({ role: { $ne: "super_admin" } }),
        Site.countDocuments({ isActive: true }),
        Payment.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const stats = {
      totalSites,
      totalUsers,
      activeSites,
      totalRevenue: totalRevenue[0]?.total || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, ["super_admin"]);
