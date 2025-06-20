import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  siteId: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "super_admin" | "site_admin" | "resident";
  building?: string;
  unitNumber?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "site_admin", "resident"],
      default: "resident",
    },
    building: { type: String },
    unitNumber: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1, siteId: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
