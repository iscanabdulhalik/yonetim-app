import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = "resident",
      siteId,
      building,
      unitNumber,
      isActive = true,
    } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, şifre, ad ve soyad zorunludur" },
        { status: 400 }
      );
    }

    // Super admin dışındaki roller için siteId zorunlu
    if (role !== "super_admin" && !siteId) {
      return NextResponse.json(
        { error: "Bu rol için siteId zorunludur" },
        { status: 400 }
      );
    }

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanımda" },
        { status: 400 }
      );
    }

    // Şifre hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const userData: any = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      building,
      unitNumber,
      isActive,
    };

    // Super admin değilse siteId ekle
    if (role !== "super_admin") {
      userData.siteId = siteId;
    }

    const newUser = new User(userData);
    await newUser.save();

    // Şifreyi response'dan çıkar
    const userResponse = {
      _id: newUser._id,
      siteId: newUser.siteId,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role,
      building: newUser.building,
      unitNumber: newUser.unitNumber,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "Kullanıcı başarıyla oluşturuldu",
      user: userResponse,
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanımda" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Kullanıcı oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
