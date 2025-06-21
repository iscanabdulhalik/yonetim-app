import createMiddleware from "next-intl/middleware";
import { routing } from "@/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // API rotalarını exclude et
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Static dosyaları exclude et
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // Handle internationalization
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match only internationalized pathnames
    "/",
    "/(tr|en)/:path*",
    // Enable redirects that add missing locales
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
