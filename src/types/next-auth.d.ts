import "next-auth";
import { UserOrgI } from "./Organization";

export interface AuthUserI {
  id: string;
  session_token?: string;
  isVerified: boolean;
  image?: string;
  email: string;
  name?: string;
  dateOfBirth?: string;
  organizations: UserOrgI[];
}

declare module "next-auth" {
  interface Session {
    user: AuthUserI;
  }

  interface User {
    id: string;
    session_token?: string;
    isVerified: boolean;
    image?: string;
    email: string;
    name?: string;
    dateOfBirth?: string;
    organizations: UserOrgI[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    session_token?: string;
    isVerified?: boolean;
    email?: string;
    name?: string;
    image?: string;
    dateOfBirth?: string;
    organizations?: UserOrgI[];
    // Standard JWT claims
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}
