import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Site } from "@/models/Site";
import { User } from "@/models/User";
import { verifyToken, generateSiteCode, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const {
      name,
      address,
      phone,
      email,
      buildingCount,
      totalUnits,
      monthlyFee,
      currency,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
    } = await request.json();

    // Generate unique site code
    let siteCode;
    let isUnique = false;
    while (!isUnique) {
      siteCode = generateSiteCode();
      const existingSite = await Site.findOne({ siteCode });
      if (!existingSite) {
        isUnique = true;
      }
    }

    // Create site
    const site = new Site({
      siteCode,
      name,
      address,
      phone,
      email,
      buildingCount,
      totalUnits,
      monthlyFee,
      currency,
    });

    await site.save();

    // Create site admin
    const hashedPassword = await hashPassword(adminPassword);
    const admin = new User({
      siteId: site._id,
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "site_admin",
    });

    await admin.save();

    return NextResponse.json({
      message: "Site created successfully",
      site: {
        _id: site._id,
        siteCode: site.siteCode,
        name: site.name,
        address: site.address,
      },
    });
  } catch (error) {
    console.error("Site creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const sites = await Site.find({ isActive: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Sites fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
