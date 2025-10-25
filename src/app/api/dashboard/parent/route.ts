import { getStudentIdsByParentId } from "@/server/queries";
import { getStudentAnalytics } from "@/server/queries/parent";
import { AnalyticsFilter, StudentAnalyticsData } from "@/types/dashboard";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: CurrentUser, userRoleId } = await getUserToken(req);

    // Check if user is authenticated and has parent role (roleId 6)
    if (!CurrentUser || userRoleId !== 6) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Get filter parameter from query string
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") as AnalyticsFilter) || "7d";

    // Validate filter parameter
    const validFilters: AnalyticsFilter[] = ["7d", "30d", "last_month"];
    if (!validFilters.includes(filter)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid filter parameter. Use '7d', '30d', or 'last_month'",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Get student IDs associated with the parent
    let studentIds: string[];
    try {
      studentIds = await getStudentIdsByParentId(CurrentUser);
    } catch (error) {
      console.error("Error fetching student IDs:", error);
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Failed to fetch student information",
        },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json(
        {
          status: "Success",
          message: "No students found for this parent",
          data: {
            dailyProgress: [],
            subjectPerformance: [],
          },
        },
        { status: HttpStatusCode.Ok }
      );
    }

    // Fetch analytics data for the students
    let analyticsData: StudentAnalyticsData;
    try {
      analyticsData = await getStudentAnalytics(studentIds, filter);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: `Failed to fetch analytics data: ${
            error instanceof Error ? error.message : "Unknown database error"
          }`,
        },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    // Additional validation
    if (!analyticsData) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Analytics data is null or undefined",
        },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Analytics data fetched successfully!",
        data: analyticsData,
        meta: {
          filter,
          studentCount: studentIds.length,
          dailyRecords: analyticsData.dailyProgress?.length || 0,
          subjectRecords: analyticsData.subjectPerformance?.length || 0,
        },
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error in student-analytics API route:", error);

    // Enhanced error handling with more specific error messages
    let errorMessage = "Internal server error";

    if (error instanceof Error) {
      if (error.message.includes("Database")) {
        errorMessage = "Database connection error";
      } else if (
        error.message.includes("authentication") ||
        error.message.includes("token")
      ) {
        errorMessage = "Authentication error";
      } else if (
        error.message.includes("permission") ||
        error.message.includes("authorized")
      ) {
        errorMessage = "Permission denied";
      } else {
        errorMessage = `Server error: ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        }),
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

// Optional: Add POST method for more complex analytics queries
export async function POST(req: NextRequest) {
  try {
    const { userId: CurrentUser, userRoleId } = await getUserToken(req);

    // Check if user is authenticated and has parent role (roleId 6)
    if (!CurrentUser || userRoleId !== 6) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid JSON body",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { filter, customStudentIds } = body;

    // Validate input
    if (filter && !["7d", "30d", "last_month"].includes(filter)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid filter parameter",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Get student IDs - either custom provided or parent's students
    let studentIds: string[];

    try {
      if (customStudentIds && Array.isArray(customStudentIds)) {
        // If custom student IDs provided, verify they belong to the parent
        const parentStudentIds = await getStudentIdsByParentId(CurrentUser);
        studentIds = customStudentIds.filter((id) =>
          parentStudentIds.includes(id)
        );

        if (studentIds.length === 0) {
          return NextResponse.json(
            {
              status: "Error",
              data: null,
              message: "None of the provided student IDs belong to this parent",
            },
            { status: HttpStatusCode.Forbidden }
          );
        }
      } else {
        studentIds = await getStudentIdsByParentId(CurrentUser);
      }
    } catch (error) {
      console.error("Error fetching student IDs:", error);
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Failed to fetch student information",
        },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json(
        {
          status: "Success",
          message: "No students found",
          data: {
            dailyProgress: [],
            subjectPerformance: [],
          },
        },
        { status: HttpStatusCode.Ok }
      );
    }

    // Fetch analytics data
    let analyticsData: StudentAnalyticsData;
    try {
      analyticsData = await getStudentAnalytics(studentIds, filter || "7d");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: `Failed to fetch analytics data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Analytics data fetched successfully!",
        data: analyticsData,
        meta: {
          filter: filter || "7d",
          requestedStudents: customStudentIds?.length || 0,
          authorizedStudents: studentIds.length,
          dailyRecords: analyticsData.dailyProgress?.length || 0,
          subjectRecords: analyticsData.subjectPerformance?.length || 0,
        },
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error in student-analytics POST route:", error);

    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        }),
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
