import { getStudentIdsByParentId } from "@/server/queries";
import { getOrGenerateDailyRecommendations } from "@/server/queries/recomendations";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const {
      userId: currentUserId,
      userRoleId,
      organizationId,
      dateOfBirth,
    } = await getUserToken(req);

    if (!currentUserId || !organizationId || !userRoleId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized: Please log in.",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    if (![2, 6].includes(userRoleId)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "Forbidden: You do not have permission to access recommendations.",
        },
        { status: HttpStatusCode.Forbidden }
      );
    }

    let kidId: string;

    if (userRoleId === 6) {
      // Await the params promise
      const { userId } = await params;

      if (!userId) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message: "Student ID parameter is required.",
          },
          { status: HttpStatusCode.BadRequest }
        );
      }

      const studentIds = await getStudentIdsByParentId(currentUserId);
      if (!studentIds.includes(userId)) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message:
              "Access denied: This student is not assigned to your account.",
          },
          { status: HttpStatusCode.Forbidden }
        );
      }

      kidId = userId;
    } else {
      kidId = currentUserId;
    }

    const dailyRecommendations = await getOrGenerateDailyRecommendations({
      studentId: kidId,
      organizationId,
      dateOfBirth,
    });

    return NextResponse.json(
      {
        status: "Success",
        message: "Daily recommendations retrieved successfully.",
        data: dailyRecommendations,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: `Internal server error: ${err.message}`,
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
