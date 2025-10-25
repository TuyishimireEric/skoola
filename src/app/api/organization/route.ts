import { NextRequest, NextResponse } from "next/server";
import {
  createOrganization,
  getOrganizations,
  CreateOrganizationSchema,
} from "@/server/queries/organization";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") as
      | "School"
      | "NGO"
      | "Public"
      | undefined;
    const status = searchParams.get("status") as
      | "Active"
      | "Inactive"
      | undefined;
    const sortBy =
      (searchParams.get("sortBy") as "Name" | "CreatedOn" | "UpdatedOn") ||
      "CreatedOn";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    // Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 }
      );
    }

    if (limit < 1) {
      return NextResponse.json(
        { error: "Limit must be greater than 0" },
        { status: 400 }
      );
    }

    if (type && !["School", "NGO", "Public"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid organization type" },
        { status: 400 }
      );
    }

    if (status && !["Active", "Inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await getOrganizations({
      page,
      limit,
      search,
      type,
      status,
      sortBy,
      sortOrder,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/organizations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CreateOrganizationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const result = await createOrganization(validationResult.data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Organization added successfully!",
    });
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
