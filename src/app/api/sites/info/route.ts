import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Site } from "@/models/Site";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const siteCode = searchParams.get("siteCode");

    if (!siteCode) {
      return NextResponse.json(
        { message: "Site kodu gereklidir" },
        { status: 400 }
      );
    }

    const site = await Site.findOne({
      siteCode: siteCode.toUpperCase(),
      isActive: true,
    }).select("name siteCode buildingCount totalUnits");

    if (!site) {
      return NextResponse.json({ message: "Site bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error("Site info fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
