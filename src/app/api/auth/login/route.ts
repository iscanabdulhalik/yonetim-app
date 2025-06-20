import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User, IUser } from "@/models/User";
import { Site, ISite } from "@/models/Site";
import { verifyPassword, generateToken } from "@/lib/auth";

interface UserWithSite extends Omit<IUser, "siteId"> {
  siteId: ISite;
}

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

    const user = (await User.findOne(query).populate(
      "siteId"
    )) as UserWithSite | null;

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

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      siteId: user.siteId._id,
      siteCode: user.siteId.siteCode,
      building: user.building,
      unitNumber: user.unitNumber,
      phone: user.phone,
    };

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
