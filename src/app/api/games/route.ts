import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { creatGame, getGames } from "@/server/queries/games";
import { getUserToken } from "@/utils/getToken";
import { GameDataI, gameSchema } from "@/types/Course";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const searchText = searchParams.get("searchText") || "";
    const subject = searchParams.get("subject") || "";
    const grade = searchParams.get("grade") || "";

    const { organizationId } = await getUserToken(req);

    const gameOrganization =
      organizationId || (process.env.DEFAULT_ORG_ID as string);

    const formData = {
      page,
      pageSize,
      searchText,
      subject,
      grade,
      organizationId: gameOrganization,
    };

    const games = await getGames(formData);
    return NextResponse.json(
      {
        status: "Success",
        message: "games fetched successfully!",
        data: games,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const validationResult = gameSchema.safeParse(formData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: validationResult.error.errors
            .map((err) => err.message)
            .join(", "),
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    if (!validationResult.data) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid data provided",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    if (userRoleId !== 1) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "You are not authorized to create a game",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const validatedData: GameDataI = {
      ...validationResult.data,
      OrganizationId: organizationId,
    };

    const inserted = await creatGame(validatedData, userId);

    return NextResponse.json(
      {
        status: "Success",
        message: "Course Created Successfully!",
        data: inserted,
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
