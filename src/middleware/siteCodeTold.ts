import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Site } from "@/models/Site";

export async function getSiteIdFromCode(
  siteCode: string
): Promise<string | null> {
  try {
    await connectDB();
    const site = await Site.findOne({
      siteCode: siteCode.toUpperCase(),
      isActive: true,
    }).select("_id");

    return site?._id.toString() || null;
  } catch (error) {
    console.error("Error getting site ID from code:", error);
    return null;
  }
}
