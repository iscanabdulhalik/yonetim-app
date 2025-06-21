import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Site } from "@/models/Site";
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

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !siteCode ||
      !unitNumber
    ) {
      return NextResponse.json(
        {
          message:
            "Ad, soyad, email, şifre, site kodu ve daire numarası zorunludur",
        },
        { status: 400 }
      );
    }

    // Find site by siteCode
    const site = await Site.findOne({
      siteCode: siteCode.toUpperCase(),
      isActive: true,
    });

    if (!site) {
      return NextResponse.json(
        { message: "Geçersiz site kodu" },
        { status: 400 }
      );
    }

    // Check if user already exists in this site
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      siteId: site._id,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu email adresi zaten kullanımda" },
        { status: 400 }
      );
    }

    // Check if unit is already taken
    if (building && unitNumber) {
      const existingUnit = await User.findOne({
        siteId: site._id,
        building,
        unitNumber,
        isActive: true,
      });

      if (existingUnit) {
        return NextResponse.json(
          { message: "Bu daire numarası zaten kayıtlı" },
          { status: 400 }
        );
      }
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
      role: "resident",
      building,
      unitNumber,
    });

    await user.save();

    // Generate token
    const token = generateToken(user as any);

    // Prepare user response (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      siteId: site._id,
      siteCode: site.siteCode,
      building: user.building,
      unitNumber: user.unitNumber,
      phone: user.phone,
    };

    return NextResponse.json({
      success: true,
      message: "Kayıt başarılı",
      token,
      user: userResponse,
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Bu email adresi zaten kullanımda" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Kayıt sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
