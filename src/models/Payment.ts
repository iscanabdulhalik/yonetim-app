import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPayment extends Document {
  _id: string;
  siteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "overdue";
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentMethod: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index(
  { siteId: 1, userId: 1, month: 1, year: 1 },
  { unique: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
