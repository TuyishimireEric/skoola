import { NextRequest, NextResponse } from "next/server";
import { DashboardFiltersI } from "@/types/dashboard";
import { getDashboardLists } from "@/server/queries/dashboard";
import { HttpStatusCode } from "axios";
import { getUserToken } from "@/utils/getToken";

export async function GET(request: NextRequest) {
  try {
    const { userId, userRoleId, organizationId } = await getUserToken(request);

    if (!userId || !organizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    if (userRoleId !== 1) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "You are not authorized ",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId") || "all";
    const subject = searchParams.get("subject") || "all";
    const dateRange = searchParams.get("dateRange") || "7d";

    // Build filters object
    const filters: DashboardFiltersI = {
      organizationId,
      gradeId,
      subject,
      dateRange,
    };

    // Execute query
    const lists = await getDashboardLists(filters);

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard lists retrieved successfully",
        data: lists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard lists error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard lists",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
