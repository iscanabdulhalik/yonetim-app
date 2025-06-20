import createIntlMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(tr|en)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
