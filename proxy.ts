import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/test/:path*"],
};

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const { pathname } = req.nextUrl;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/test")) &&
    session.role !== "STUDENT"
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}
