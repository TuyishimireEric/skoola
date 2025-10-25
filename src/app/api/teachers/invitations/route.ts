import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import { v4 as uuidv4 } from "uuid";
import { registerTeacherSchema } from "@/utils/validations/userValidations";
import { getUserToken } from "@/utils/getToken";
import { sendTeacherInvitationEmailWithRetry } from "@/utils/jobs/events";
import {
  createTeacherInvitation,
  getInvitationByEmail,
  getInvitationByToken,
} from "@/server/queries/teacher";
import type { TeacherInvitation, ApiResponse } from "@/types/teacher";

export async function POST(req: NextRequest) {
  try {
    const { userId, userRoleId, organizationId, organizationName } =
      await getUserToken(req);

    if (!userId || userRoleId !== 1 || !organizationId || !organizationName) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const formData = await req.json();
    const validation = registerTeacherSchema.safeParse(formData);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: `Validation Error: ${validation.error.errors[0].message}`,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { FullName, Email } = formData;

    // Check if invitation already exists
    const existingInvitation = await getInvitationByEmail(
      Email,
      organizationId
    );

    if (existingInvitation && existingInvitation.Status === "Pending") {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Teacher invitation already sent and pending.",
        },
        { status: HttpStatusCode.Conflict }
      );
    }

    // Create invitation record
    const invitationToken = uuidv4();
    const invitation = await createTeacherInvitation({
      Email,
      FullName,
      OrganizationId: organizationId,
      InvitedBy: userId,
      Token: invitationToken,
      ExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await sendTeacherInvitationEmailWithRetry({
      Email,
      FullName,
      OrganizationName: organizationName,
      Token: invitationToken,
    });

    return NextResponse.json(
      {
        status: "Success",
        message: "Teacher invitation sent successfully!",
        data: {
          invitationId: invitation.Id,
          email: Email,
          fullName: FullName,
          expiresAt: invitation.ExpiresAt,
        },
      },
      { status: HttpStatusCode.Created }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: "Error",
          data: null,
          message: "Token parameter is required",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: "Error",
          data: null,
          message: "Invalid or expired invitation token",
        },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Check if organization data is missing
    if (!invitation.organization) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: "Error",
          data: null,
          message: "Organization data not found for this invitation",
        },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Check if invitation has expired
    const now = new Date();
    if (invitation.expiresAt < now) {
      return NextResponse.json<ApiResponse<null>>(
        {
          status: "Error",
          data: null,
          message: "Invitation token has expired",
        },
        { status: HttpStatusCode.Gone }
      );
    }

    return NextResponse.json<ApiResponse<TeacherInvitation>>(
      {
        status: "Success",
        data: invitation,
        message: "Invitation retrieved successfully",
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json<ApiResponse<null>>(
      {
        status: "Error", 
        data: null, 
        message: error.message
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}