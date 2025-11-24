import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  addNewUser,
  addOrganizationUser,
  addVerificationToken,
  getUserByEmail,
  getUserByUserName,
  getUserOrganizations,
  updateLastLogin,
} from "@/server/queries";
import { randomBytes } from "crypto";
import { Session } from "@/server/db/schema";
import bcrypt from "bcryptjs";
import { generateUserCode } from "@/utils/functions";
import { sendUserVerificationEmailWithRetry } from "@/utils/jobs/events";
import { UserOrgI } from "@/types/Organization";

// Extend your existing JWT interface to include the missing properties
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    session_token?: string;
    isVerified?: boolean;
    dateOfBirth?: string;
    organizations?: UserOrgI[];
    email?: string;
    name?: string;
    image?: string;
  }
}

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password or Login Code", type: "password" },
        authType: { label: "Authentication Type", type: "text" },
      },

      async authorize(credentials) {
        if (
          !credentials?.identifier ||
          !credentials?.password ||
          !credentials?.authType
        ) {
          throw new Error("Missing required credentials");
        }

        try {
          let existingUser = null;

          const isEmail = credentials.identifier.includes("@");

          if (isEmail) {
            existingUser = await getUserByEmail(credentials.identifier);
          } else {
            existingUser = await getUserByUserName(credentials.identifier);
          }

          if (!existingUser) {
            throw new Error("No user found with this email or username");
          }

          // Ensure password exists before verification
          if (!existingUser.Password) {
            throw new Error(
              "Account has no password set. Please use Google login or reset your password."
            );
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            existingUser.Password
          );

          if (!isPasswordMatch) {
            throw new Error("Incorrect password. Please try again.");
          }

          if (!existingUser.IsVerified) {
            if (existingUser.Email) {
              const Token = generateUserCode(existingUser.FullName);
              await addVerificationToken(existingUser.Id, Token);
              await sendUserVerificationEmailWithRetry({
                Email: existingUser.Email,
                FullName: existingUser.FullName,
                Token: Token,
              });
            }
            throw new Error(`Not verified. Please verify:${existingUser.Id}`);
          }

          const organizations = await getUserOrganizations(existingUser.Id);

          const userResponse = {
            id: existingUser.Id,
            email: existingUser.Email ?? "",
            name: existingUser.FullName ?? undefined,
            image: existingUser.ImageUrl ?? undefined,
            dateOfBirth: existingUser.DateOfBirth ?? "",
            isVerified: existingUser.IsVerified,
            organizations: organizations,
          };

          return userResponse;
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await getUserByEmail(user.email as string);

          if (!existingUser) {
            const newUser = await addNewUser({
              FullName: user.name as string,
              Email: user.email as string,
              Password: process.env.DEFAULT_PASS as string,
              ImageUrl: user.image as string,
              GoogleId: user.id as string,
              IsVerified: true,
            });

            user.id = newUser[0].Id;
            const newOrganizationUser = await addOrganizationUser({
              UserId: newUser[0].Id,
              OrganizationId: process.env.DEFAULT_ORG_ID as string,
              RoleId: 5,
            });

            const userOrganization: UserOrgI = {
              Id: newOrganizationUser[0].Id,
              Status: "Active",
              Type: "Public",
              Name: "Default Organization",
              Logo: null,
              Address: "",
              CurrentClass: null,
              RoleId: 5,
              Role: "User",
              OrganizationId: process.env.DEFAULT_ORG_ID as string,
            };

            user.organizations = [userOrganization];
          } else {
            console.log("👤 Existing Google user found");
            user.id = existingUser.Id;
            user.isVerified = existingUser.IsVerified;
            user.email = existingUser.Email ?? "";

            const organizations = await getUserOrganizations(existingUser.Id);
            user.organizations = organizations;
          }
        } catch (err) {
          console.error("💥 Google sign-in error:", err);
          return false;
        }
      }

      // Create session for both Google and credentials login
      const Expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const SessionToken = uuidv4();

      try {
        console.log("📝 Creating session for user:", user.id);
        await db.insert(Session).values({
          SessionToken,
          UserId: user.id,
          Expires,
        });

        await updateLastLogin(user.id);
        user.session_token = SessionToken;
        console.log("✅ Session created successfully");
      } catch (err) {
        console.error("💥 Session creation error:", err);
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.session_token = user.session_token;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        token.isVerified = user.isVerified;
        token.dateOfBirth = user.dateOfBirth;
        token.organizations = user.organizations;
      }

      // Only fetch organizations if explicitly triggered by update
      if (trigger === "update") {
        try {
          const organizations = await getUserOrganizations(token.id as string);
          token.organizations = organizations;
        } catch (error) {
          console.error("Error updating organizations in JWT:", error);
          // Keep existing organizations if update fails
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.session_token = token.session_token;
        session.user.email = token.email || "";
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.isVerified = token.isVerified || false;
        session.user.dateOfBirth = token.dateOfBirth || "";
        // Use organizations from token instead of fetching from DB every time
        session.user.organizations = token.organizations || [];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}`;
      }
      return baseUrl;
    },
  },
  pages: {
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("🚨 NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.debug("🐛 NextAuth Debug:", code, metadata);
    },
  },
};
