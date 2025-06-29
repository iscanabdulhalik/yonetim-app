import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User, IUser } from "@/models/User";
import { Site, ISite } from "@/models/Site";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, siteCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find site if siteCode is provided
    let site: ISite | null = null;
    if (siteCode) {
      site = await Site.findOne({
        siteCode: siteCode.toUpperCase(),
        isActive: true,
      });
      if (!site) {
        return NextResponse.json(
          { message: "Invalid site code" },
          { status: 400 }
        );
      }
    }

    // Find user
    const query: any = { email: email.toLowerCase(), isActive: true };
    if (site) {
      query.siteId = site._id;
    }

    const user = await User.findOne(query).populate("siteId");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token - Handle super admin case
    const token = generateToken(user as any);

    // Handle user data based on role
    let userData: any = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      building: user.building,
      unitNumber: user.unitNumber,
      phone: user.phone,
    };

    // Add site info if user has a site
    if (
      user.siteId &&
      typeof user.siteId === "object" &&
      "siteCode" in user.siteId
    ) {
      // User has populated site
      const populatedSite = user.siteId as any;
      userData.siteId = populatedSite._id;
      userData.siteCode = populatedSite.siteCode;
    } else if (user.siteId) {
      // User has siteId but not populated
      userData.siteId = user.siteId;
      // Try to get site code separately for super admins
      if (user.role === "super_admin") {
        userData.siteCode = "ADMIN";
      }
    } else {
      // No site (shouldn't happen, but handle gracefully)
      userData.siteId = null;
      userData.siteCode = user.role === "super_admin" ? "ADMIN" : null;
    }

    return NextResponse.json({
      message: "Login successful",
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
