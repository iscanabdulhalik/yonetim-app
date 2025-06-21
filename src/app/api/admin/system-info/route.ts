import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";

async function handler(request: NextRequest) {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      uptime: {
        hours: Math.floor(process.uptime() / 3600),
        minutes: Math.floor((process.uptime() % 3600) / 60),
        formatted: `${Math.floor(process.uptime() / 3600)}h ${Math.floor(
          (process.uptime() % 3600) / 60
        )}m`,
      },
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ systemInfo });
  } catch (error) {
    console.error("System info fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, ["super_admin"]);
