import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExpense extends Document {
  _id: string;
  siteId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: Date;
  receipt?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    receipt: { type: String },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
