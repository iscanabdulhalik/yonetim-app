import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComplaint extends Document {
  _id: string;
  siteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: "maintenance" | "noise" | "security" | "cleaning" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  visibility: "admin_only" | "all_residents"; // Yeni alan
  adminResponse?: string;
  respondedBy?: mongoose.Types.ObjectId;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["maintenance", "noise", "security", "cleaning", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    visibility: {
      type: String,
      enum: ["admin_only", "all_residents"],
      default: "admin_only",
    },
    adminResponse: { type: String },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    respondedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Complaint: Model<IComplaint> =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);
