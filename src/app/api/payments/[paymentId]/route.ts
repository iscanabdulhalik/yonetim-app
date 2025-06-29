import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { Payment } from "@/models/Payment";

// PUT update payment status
async function updatePayment(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    await connectDB();

    const { paymentId } = params;
    const { status, paymentMethod, notes } = await request.json();

    const updateData: any = { status };

    if (status === "paid") {
      updateData.paidDate = new Date();
    }

    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes) updateData.notes = notes;

    const payment = await Payment.findByIdAndUpdate(paymentId, updateData, {
      new: true,
    }).populate("userId", "firstName lastName building unitNumber");

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updatePayment, ["site_admin"]);
