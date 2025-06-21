import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { Expense } from "@/models/Expense";
import { Complaint } from "@/models/Complaint";

async function handler(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;

    const [
      totalUsers,
      adminUsers,
      residentUsers,
      totalPayments,
      totalExpenses,
      activeComplaints,
      monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments({ siteId, isActive: true }),
      User.countDocuments({ siteId, role: "site_admin", isActive: true }),
      User.countDocuments({ siteId, role: "resident", isActive: true }),
      Payment.aggregate([
        { $match: { siteId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { siteId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Complaint.countDocuments({
        siteId,
        status: { $in: ["open", "in_progress"] },
      }),
      Payment.aggregate([
        {
          $match: {
            siteId,
            status: "paid",
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const stats = {
      totalUsers,
      adminUsers,
      residentUsers,
      totalPayments: totalPayments[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      activeComplaints,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Site stats fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, ["super_admin"]);
