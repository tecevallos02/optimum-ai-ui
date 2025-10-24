import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get admin emails from environment
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) =>
    email.trim(),
  ) || ["goshawkai1@gmail.com"];

  // Always allow public routes
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signin" ||
    pathname === "/auth" ||
    pathname === "/verify" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/test-db") ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/static/")
  ) {
    return NextResponse.next();
  }

  // Get session from cookies (Edge Runtime compatible)
  const sessionToken = request.cookies.get("next-auth.session-token")?.value;
  const adminSessionToken = request.cookies.get("admin-next-auth.session-token")?.value;
  const simpleAdminSession = request.cookies.get("admin-session")?.value;

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    // Allow admin login pages and simple admin dashboard without redirect
    if (pathname === "/admin/login" || pathname === "/admin/simple-login" || pathname === "/admin/simple") {
      return NextResponse.next();
    }
    
    if (!adminSessionToken && !simpleAdminSession) {
      // Not authenticated, redirect to simple admin login
      const loginUrl = new URL("/admin/simple-login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // For admin routes, we'll let the page handle the admin check
    // since we can't decode JWT in Edge Runtime
    return NextResponse.next();
  }

  // Handle protected routes (app routes)
  if (pathname.startsWith("/app")) {
    if (!sessionToken) {
      // Not authenticated, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated user, allow access
    return NextResponse.next();
  }

  // Handle other protected routes
  const protectedRoutes = [
    "/dashboard",
    "/contacts",
    "/billing",
    "/config",
    "/calls",
    "/calendar",
    "/savings",
    "/team",
    "/audit",
  ];
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionToken) {
      // Not authenticated, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated user, allow access
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
