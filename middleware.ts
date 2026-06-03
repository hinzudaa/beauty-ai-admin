import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "beauty_admin_token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/login"] };
