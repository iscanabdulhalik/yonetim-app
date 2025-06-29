// src/models/Site.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISite extends Document {
  _id: string;
  siteCode: string;
  name: string;
  address: string;
  logo?: string;
  phone?: string;
  email?: string;
  buildingCount: number;
  totalUnits: number;
  monthlyFee: number;
  currency: "TRY" | "USD" | "EUR";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSchema = new Schema<ISite>(
  {
    siteCode: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String, default: null },
    phone: { type: String },
    email: { type: String },
    buildingCount: { type: Number, required: true, min: 1 },
    totalUnits: { type: Number, required: true, min: 1 },
    monthlyFee: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["TRY", "USD", "EUR"], default: "TRY" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Site: Model<ISite> =
  mongoose.models.Site || mongoose.model<ISite>("Site", SiteSchema);
