import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User, IUser } from "@/models/User";
import { ISite } from "@/models/Site";
import { verifyToken } from "@/lib/auth";

interface UserWithSite extends Omit<IUser, "siteId"> {
  siteId: ISite;
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
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Super admin için farklı logic
    if (decoded.role === "super_admin") {
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      const userData = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        siteId: null,
        siteCode: "ADMIN",
        building: user.building,
        unitNumber: user.unitNumber,
        phone: user.phone,
      };

      return NextResponse.json({ user: userData });
    }

    // Normal kullanıcılar için site bilgisi ile birlikte
    const user = (await User.findById(decoded.userId)
      .populate("siteId")
      .select("-password")) as UserWithSite | null;

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.siteId) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

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

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
