import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Site, ISite } from "@/models/Site";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      building,
      unitNumber,
      siteCode,
    } = await request.json();

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !unitNumber ||
      !siteCode
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find site
    const site: ISite | null = await Site.findOne({
      siteCode: siteCode.toUpperCase(),
      isActive: true,
    });

    if (!site) {
      return NextResponse.json(
        { message: "Invalid site code" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      siteId: site._id,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists in this site" },
        { status: 400 }
      );
    }

    // Check if unit is already taken
    const existingUnit = await User.findOne({
      siteId: site._id,
      building,
      unitNumber,
      isActive: true,
    });

    if (existingUnit) {
      return NextResponse.json(
        { message: "This unit is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      siteId: site._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      building,
      unitNumber,
      role: "resident",
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      siteId: user.siteId,
      siteCode: site.siteCode,
      building: user.building,
      unitNumber: user.unitNumber,
      phone: user.phone,
    };

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
