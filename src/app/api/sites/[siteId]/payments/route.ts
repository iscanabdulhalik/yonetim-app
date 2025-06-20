import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Site } from "@/models/Site";

// GET payments
async function getPayments(
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
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const query: any = { siteId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    const payments = await Payment.find(query)
      .populate("userId", "firstName lastName building unitNumber")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
      { $match: { siteId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    return NextResponse.json({
      payments,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create payments for all residents
async function createPayments(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { month, year, amount, dueDate } = await request.json();

    // Get site info
    const site = await Site.findById(siteId);
    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Get all residents
    const residents = await User.find({
      siteId,
      role: "resident",
      isActive: true,
    });

    // Check if payments already exist for this month/year
    const existingPayment = await Payment.findOne({
      siteId,
      month,
      year,
    });

    if (existingPayment) {
      return NextResponse.json(
        { message: "Payments already exist for this month" },
        { status: 400 }
      );
    }

    // Create payments for all residents
    const payments = residents.map((resident) => ({
      siteId,
      userId: resident._id,
      amount: amount || site.monthlyFee,
      month,
      year,
      dueDate: new Date(dueDate),
      status: "pending",
    }));

    const createdPayments = await Payment.insertMany(payments);

    return NextResponse.json({
      message: `${createdPayments.length} payment created successfully`,
      count: createdPayments.length,
    });
  } catch (error) {
    console.error("Payments creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getPayments, [
  "super_admin",
  "site_admin",
  "resident",
]);
export const POST = withAuth(createPayments, ["site_admin"]);
