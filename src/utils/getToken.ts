import { AuthUserI } from "@/types/next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { NextApiRequest } from "next";
import { UserOrgI } from "@/types/Organization";

// Extended JWT type that includes all AuthUserI properties
interface ExtendedJWT {
  id: string;
  session_token?: string;
  isVerified?: boolean;
  email?: string;
  name?: string;
  image?: string;
  dateOfBirth?: string;
  organizations?: UserOrgI[];
  // Include standard JWT properties
  sub?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

// Type guard to check if token has the required AuthUserI properties
function hasAuthUserProperties(token: unknown): token is ExtendedJWT {
  if (!token || typeof token !== "object") return false;

  const t = token as Record<string, unknown>;

  return (
    typeof t.id === "string" &&
    typeof t.email === "string" &&
    typeof t.isVerified === "boolean" &&
    Array.isArray(t.organizations)
  );
}

// Convert token to AuthUserI if it has the required properties
function tokenToAuthUser(token: unknown): AuthUserI | null {
  if (!token) return null;

  // Check if token has all required properties
  if (hasAuthUserProperties(token)) {
    return {
      id: token.id,
      email: token.email ?? "",
      name: token.name,
      image: token.image,
      isVerified: token.isVerified ?? false,
      dateOfBirth: token.dateOfBirth,
      organizations: token.organizations ?? [],
      session_token: token.session_token,
    };
  }

  // Fallback: try to construct from standard JWT properties
  const t = token as Record<string, unknown>;
  if (t.id && typeof t.id === "string") {
    return {
      id: t.id,
      email: typeof t.email === "string" ? t.email : "",
      name: typeof t.name === "string" ? t.name : undefined,
      image: typeof t.image === "string" ? t.image : undefined,
      isVerified: t.isVerified === true,
      dateOfBirth:
        typeof t.dateOfBirth === "string" ? t.dateOfBirth : undefined,
      organizations: Array.isArray(t.organizations) ? t.organizations : [],
      session_token:
        typeof t.session_token === "string" ? t.session_token : undefined,
    };
  }

  return null;
}

export const getUserToken = async (req: NextRequest) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      return createEmptyUserResponse(req);
    }

    // Enhanced token retrieval with deployment-specific configurations
    const token = await getToken({
      req,
      secret: secret,
      // Explicitly set secureCookie based on environment
      secureCookie: process.env.NODE_ENV === "production",
      // Try different cookie names that might be used
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    // Convert token to AuthUserI
    let user = tokenToAuthUser(token);

    if (!user && process.env.NODE_ENV === "production") {
      // Try with HTTP-only cookie name
      const altToken = await getToken({
        req,
        secret: secret,
        cookieName: "next-auth.session-token",
        secureCookie: false,
      });

      user = tokenToAuthUser(altToken);
    }

    if (!user) {
      return createEmptyUserResponse(req);
    }

    return createUserResponse(user, req);
  } catch (error) {
    console.error("Error in getUserToken:", error);
    return createEmptyUserResponse(req);
  }
};

// Alternative implementation for API routes with enhanced debugging
export const getUserTokenFromApiRoute = async (req: NextApiRequest) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      console.error("NEXTAUTH_SECRET is not defined");
      return null;
    }

    const token = await getToken({
      req,
      secret: secret,
      // Production-specific settings
      secureCookie: process.env.NODE_ENV === "production",
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    let user = tokenToAuthUser(token);

    // Fallback attempts for production
    if (!user && process.env.NODE_ENV === "production") {
      console.log("API Route - Trying alternative configurations...");

      const configs = [
        { cookieName: "next-auth.session-token", secureCookie: false },
        { cookieName: "__Host-next-auth.session-token", secureCookie: true },
        { cookieName: "authjs.session-token", secureCookie: true },
      ];

      for (const config of configs) {
        try {
          const altToken = await getToken({
            req,
            secret: secret,
            ...config,
          });
          if (altToken) {
            user = tokenToAuthUser(altToken);
            if (user) {
              console.log(`API Route - Success with config:`, config);
              break;
            }
          }
        } catch (configError) {
          console.log(`API Route - Config failed:`, config, configError);
        }
      }
    }

    if (!user) {
      return null;
    }

    return createUserResponseData(user);
  } catch (error) {
    console.error("Error in getUserTokenFromApiRoute:", error);
    return null;
  }
};

// Define return type for user response
interface UserResponse {
  userId: string | null;
  userRole: string | null;
  userRoleId: number | null;
  userOrganizationId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  currentClassId: string | null;
  userOrganizations: AuthUserI["organizations"] | undefined;
  dateOfBirth: string;
  userEmail: string;
  userName: string;
  body?: ReadableStream<Uint8Array> | null;
}

// Helper functions to reduce code duplication
const createEmptyUserResponse = (req: NextRequest): UserResponse => ({
  userId: null,
  userRole: null,
  userRoleId: null,
  userOrganizationId: null,
  organizationId: null,
  organizationName: null,
  currentClassId: null,
  userOrganizations: undefined,
  dateOfBirth: "",
  userEmail: "",
  userName: "",
  body: req.body,
});

const createUserResponse = (
  user: AuthUserI,
  req: NextRequest
): UserResponse => {
  const firstOrg =
    user.organizations && user.organizations.length > 0
      ? user.organizations[0]
      : null;

  return {
    userId: user.id ?? null,
    userRole: firstOrg?.Role ?? null,
    userRoleId: firstOrg?.RoleId ?? null,
    userOrganizationId: firstOrg?.Id ?? null,
    organizationId: firstOrg?.OrganizationId ?? null,
    organizationName: firstOrg?.Name ?? null,
    currentClassId: firstOrg?.CurrentClass?.toString() ?? null,
    userOrganizations: user.organizations,
    dateOfBirth: user.dateOfBirth ?? "",
    userEmail: user.email ?? "",
    userName: user.name ?? "",
    body: req.body,
  };
};

const createUserResponseData = (
  user: AuthUserI
): Omit<UserResponse, "body"> => {
  const firstOrg =
    user.organizations && user.organizations.length > 0
      ? user.organizations[0]
      : null;

  return {
    userId: user.id ?? null,
    userRole: firstOrg?.Role ?? null,
    userRoleId: firstOrg?.RoleId ?? null,
    userOrganizationId: firstOrg?.Id ?? null,
    organizationId: firstOrg?.OrganizationId ?? null,
    organizationName: firstOrg?.Name ?? null,
    currentClassId: firstOrg?.CurrentClass?.toString() ?? null,
    userOrganizations: user.organizations,
    dateOfBirth: user.dateOfBirth ?? "",
    userEmail: user.email ?? "",
    userName: user.name ?? "",
  };
};
