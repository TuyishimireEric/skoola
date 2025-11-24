import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Role IDs mapping
const ROLES = {
  ADMIN: 1,
  STUDENT: 2,
  TEACHER: 3,
  ORG_ADMIN: 4,
  USER: 5,
  PARENT: 6,
} as const;

// Define allowed routes for each role (routes they CAN access)
// Using a whitelist approach is more secure and explicit
const rolePermissions: Record<number, string[]> = {
  [ROLES.ADMIN]: ["*"], // Admin can access everything
  [ROLES.ORG_ADMIN]: ["*"], // Org Admin can access everything
  [ROLES.STUDENT]: [
    "/",
    "/student",
    "/games",
    "/kids",
    "/profile",
    "/about",
    "/contact",
    "/donate",
  ],
  [ROLES.TEACHER]: [
    "/",
    "/teacher",
    "/kids",
    "/games",
    "/profile",
    "/about",
    "/contact",
    "/donate",
  ],
  [ROLES.USER]: [
    "/",
  ],
  [ROLES.PARENT]: [
    "/",
    "/students",
  ],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login"
];

// Static assets and API routes that should always be accessible
const alwaysAllowedPatterns = [
  "/_next",
  "/api",
  "/static",
  "/favicon",
  "/images",
  "/fonts",
  "/.well-known",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * Check if a pathname matches a route pattern
 * Supports exact matches and wildcard patterns
 */
function matchesPattern(pathname: string, pattern: string): boolean {
  // Wildcard - matches everything
  if (pattern === "*") return true;

  // Normalize paths - remove trailing slashes
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const normalizedPattern = pattern.replace(/\/$/, "") || "/";

  // Exact match for root
  if (normalizedPattern === "/" && normalizedPathname === "/") return true;

  // For non-root patterns, check if pathname starts with pattern
  if (normalizedPattern !== "/") {
    return (
      normalizedPathname === normalizedPattern ||
      normalizedPathname.startsWith(normalizedPattern + "/")
    );
  }

  return false;
}

/**
 * Check if user has permission to access a route
 */
function hasPermission(pathname: string, userRole: number): boolean {
  const permissions = rolePermissions[userRole];

  if (!permissions) {
    console.warn(`No permissions defined for role ${userRole}`);
    return false;
  }

  // Check if any permission pattern matches the pathname
  return permissions.some((pattern) => matchesPattern(pathname, pattern));
}

/**
 * Check if a route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => matchesPattern(pathname, route));
}

/**
 * Check if the request is for always allowed resources
 */
function isAlwaysAllowed(pathname: string): boolean {
  return (
    alwaysAllowedPatterns.some((pattern) => pathname.startsWith(pattern)) ||
    pathname.includes(".")
  ); // Static files with extensions
}

/**
 * Get the session token from cookies (handles both dev and production)
 */
function getSessionToken(request: NextRequest): string | undefined {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  return request.cookies.get(cookieName)?.value;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Always allow static assets, API routes, and system files
  if (isAlwaysAllowed(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get the session token from cookies
    const sessionToken = getSessionToken(request);

    // Get the token from the request with proper cookie handling
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET!,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    const isAuthenticated = !!(token && token.sub);

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Middleware Debug:", {
        pathname,
        isAuthenticated,
        hasToken: !!token,
        hasSessionToken: !!sessionToken,
        userRole: token?.organizations?.[0]?.RoleId,
      });
    }

    // Handle login page - redirect authenticated users to home
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    // Allow public routes without authentication
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // From here, all routes require authentication
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user role from token
    const organizations = token.organizations as
      | Array<{ RoleId: number }>
      | undefined;
    const userRole = organizations?.[0]?.RoleId;

    // If user has no role, redirect to home with warning
    if (!userRole) {
      console.warn(`Authenticated user ${token.sub} has no role assigned`);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user has permission to access this route
    if (!hasPermission(pathname, userRole)) {
      console.log(
        `Access denied: User with role ${userRole} attempted to access: ${pathname}`
      );
      // Redirect to home page (user is authenticated but not authorized)
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow access - user is authenticated and authorized
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // On error, only redirect to login for protected routes
    if (!isPublicRoute(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Images, fonts, and other static assets
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
