import {
  generateParentInviteCode,
  validateParentInviteCode,
} from "@/server/queries";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

// POST: Generate parent invite code (Student generates code)
export async function POST(req: NextRequest) {
  try {
    const { userId: CurrentUser, userRoleId } = await getUserToken(req);

    if (!CurrentUser || userRoleId !== 2) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Only students can generate parent codes!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const result = await generateParentInviteCode(CurrentUser);

    return NextResponse.json(
      {
        status: "Success",
        message: "Parent invite code generated successfully!",
        data: {
          inviteCode: result.InviteCode,
          expiresAt: result.ExpiresAt,
        },
      },
      { status: HttpStatusCode.Created }
    );
  } catch (error) {
    console.error("Error generating parent invite code:", error);
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: "Failed to generate invite code",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

// PATCH: Validate parent invite code (Parent uses code to connect)
export async function PATCH(req: NextRequest) {
  try {
    const { userId: CurrentUser, userRoleId } = await getUserToken(req);

    // Check if user is logged in and is a parent (assuming roleId 6 is parent)
    if (!CurrentUser || userRoleId !== 6) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Only parents can use invite codes!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invite code is required",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const result = await validateParentInviteCode(inviteCode, CurrentUser);

    if (!result) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid or expired invite code",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Successfully connected to student!",
        data: {
          studentId: result.StudentId,
          studentName: result.StudentName,
        },
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error validating parent invite code:", error);
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: "Failed to validate invite code",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
