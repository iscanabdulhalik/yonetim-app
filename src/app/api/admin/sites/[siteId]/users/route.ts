import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { withAuth } from "@/middleware/auth";
import { User } from "@/models/User";
import { Site } from "@/models/Site";
import { hashPassword } from "@/lib/auth";

// GET site users
async function getUsers(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const query: any = { siteId, isActive: true };

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("siteId", "name siteCode")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new user
async function createUser(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();

    const { siteId } = params;
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      building,
      unitNumber,
    } = await request.json();

    // Check if site exists
    const site = await Site.findById(siteId);
    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      siteId,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Check if unit is already taken (for residents)
    if (role === "resident" && building && unitNumber) {
      const existingUnit = await User.findOne({
        siteId,
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
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      siteId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      building,
      unitNumber,
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("siteId", "name siteCode");

    return NextResponse.json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUsers, ["super_admin", "site_admin"]);
export const POST = withAuth(createUser, ["super_admin", "site_admin"]);
