import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { Expense } from "@/models/Expense";

async function handler(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get total residents
    const totalResidents = await User.countDocuments({
      siteId,
      role: "resident",
      isActive: true,
    });

    // Get current month payments
    const payments = await Payment.find({
      siteId,
      month: currentMonth,
      year: currentYear,
    });

    const totalExpected = payments.length;
    const paidPayments = payments.filter((p) => p.status === "paid");
    const overduePayments = payments.filter(
      (p) => p.status === "overdue"
    ).length;

    const monthlyIncome = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const paymentRate =
      totalExpected > 0 ? (paidPayments.length / totalExpected) * 100 : 0;

    // Get total expenses for current month
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          siteId: siteId,
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const stats = {
      totalResidents,
      monthlyIncome,
      totalExpenses: totalExpenses[0]?.total || 0,
      overduePayments,
      paymentRate,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, ["site_admin", "resident"]);
