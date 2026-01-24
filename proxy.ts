import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "./lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Auth Protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const authCookie = request.cookies.get("admin_session");
    const isAuthenticated = authCookie?.value === process.env.ADMIN_PASSWORD;

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Admin routes don't need i18n redirect usually, so we return here?
    // Or do we want /en/admin? Usually admin is global.
    return NextResponse.next();
  }

  // 2. Skip public files / API / internal
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 3. i18n Routing (Original Logic)
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  if (locale && isLocale(locale)) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
    return response;
  }

  const redirectURL = new URL(
    `/${defaultLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
    request.url,
  );
  const response = NextResponse.redirect(redirectURL);
  response.cookies.set("NEXT_LOCALE", defaultLocale, { path: "/" });
  return response;
}

export const config = {
  // Combined matcher: Admin OR existing i18n matcher
  matcher: ["/admin/:path*", "/((?!_next|api|.+\\..+).*)"],
};
