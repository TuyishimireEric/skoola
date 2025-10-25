import { getGameById, updateGame } from "@/server/queries/games";
import { GameDataI } from "@/types/Course";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await getUserToken(req);

    const gameOrganization =
      organizationId || (process.env.DEFAULT_ORG_ID as string);
    const { id } = await params;

    const game = await getGameById(id, gameOrganization);

    return NextResponse.json(
      {
        status: "Success",
        message: "Game retrieved successfully.",
        data: game,
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

export async function PUT(req: NextRequest) {
  try {
    const { userId, userRoleId, organizationId } = await getUserToken(req);

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

    const formData = await req.json();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || formData.Id;

    if (!courseId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "CourseId is required! Please provide a valid CourseId",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    if (userRoleId !== 1) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "You are not authorized to update a course",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const validatedData: GameDataI = {
      ...formData,
      OrganizationId: organizationId,
    };

    const updated = await updateGame(validatedData, userId);

    return NextResponse.json(
      {
        status: "Success",
        message: "Game Updated Successfully!",
        data: updated,
      },
      { status: HttpStatusCode.Accepted }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
