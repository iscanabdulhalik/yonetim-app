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

    // Check if user already exists in this site with same email
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

    // Aynı daire numarasına birden fazla sakin kaydolabilir - check kaldırıldı
    // Unit uniqueness check REMOVED to allow multiple residents per unit

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData: any = {
      siteId: site._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: "resident",
      unitNumber,
    };

    // Building bilgisini sadece site'nin buildingCount > 1 ise ekle
    if (site.buildingCount > 1 && building) {
      userData.building = building;
    }

    const user = new User(userData);
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
      // Duplicate key error
      if (error.keyPattern?.email) {
        return NextResponse.json(
          { message: "Bu email adresi zaten kullanımda" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Kayıt bilgileri zaten kullanımda" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Kayıt sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
