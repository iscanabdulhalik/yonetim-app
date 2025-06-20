import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Expense } from "@/models/Expense";

// GET expenses
async function getExpenses(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const query: any = { siteId };

    if (category && category !== "all") {
      query.category = category;
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query)
      .populate("addedBy", "firstName lastName")
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    // Get total amount
    const totalAmount = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return NextResponse.json({
      expenses,
      totalAmount: totalAmount[0]?.total || 0,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create expense
async function createExpense(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { title, description, amount, category, date } = await request.json();

    // Get user from auth middleware
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const expense = new Expense({
      siteId,
      title,
      description,
      amount,
      category,
      date: new Date(date),
      addedBy: decoded.userId,
    });

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id).populate(
      "addedBy",
      "firstName lastName"
    );

    return NextResponse.json({
      message: "Expense created successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getExpenses, [
  "super_admin",
  "site_admin",
  "resident",
]);
export const POST = withAuth(createExpense, ["site_admin"]);
