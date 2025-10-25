import { getTodayCompletedCourseSections } from "@/server/queries/recomendations";
import { getStudentIdsByParentId } from "@/server/queries/user";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, userRoleId, organizationId } = await getUserToken(req);

    if (!userId || !organizationId || !userRoleId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized: Please log in.",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Allow only students (role 2) and parents (role 6)
    if (![2, 6].includes(userRoleId)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "Forbidden: You do not have permission to perform this action.",
        },
        { status: HttpStatusCode.Forbidden }
      );
    }

    // Parse request body
    const body = await req.json();
    const { recommendedGameIds, studentId } = body;

    // Validate recommendedGameIds
    if (
      !Array.isArray(recommendedGameIds) ||
      recommendedGameIds.length === 0
    ) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid 'recommendedGameIds': must be a non-empty array.",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    let kidId: string;

    if (userRoleId === 6) {
      // Parent
      if (!studentId) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message:
              "Student ID is required when parent is making this request.",
          },
          { status: HttpStatusCode.BadRequest }
        );
      }

      // Validate parent-student relationship
      const studentIds = await getStudentIdsByParentId(userId);
      if (!studentIds.includes(studentId)) {
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

      kidId = studentId;
    } else {
      // Student
      kidId = userId;
    }

    // Fetch completions
    const todayCompletions = await getTodayCompletedCourseSections(
      kidId,
      recommendedGameIds
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "Today's completed course sections retrieved successfully.",
        data: todayCompletions,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error in today's completions API:", err);
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
