import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes
  const publicRoutes = ["/", "/home", "/login", "/register", "/api/auth/login", "/api/auth/signup", "/api/upload"]
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/upload") || pathname.startsWith("/api/services")) {
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const token = request.cookies.get("auth-token")?.value
  console.log("Middleware - Path:", pathname)
  console.log("Middleware - Token exists:", !!token)

  if (!token) {
    console.log("No token found, redirecting to login")
    // Only redirect to login for protected routes, not API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }
    // Only redirect if not already on login page
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // For now, just check if token exists and let API routes handle verification
  // This avoids the Edge Runtime crypto module issue
  console.log("Token found, allowing request to proceed")
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/services/create",
    "/digital-products/create",
    "/api/profile/:path*",
    "/api/digital-products/:path*",
    "/api/sellers/:path*",
    "/api/service-images/:path*",
    "/api/service-packages/:path*",
    "/api/service-faq/:path*",
    "/api/service-reviews/:path*",
  ],
}
