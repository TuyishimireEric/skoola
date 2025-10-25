import { toggleGameLike } from "@/server/queries/reviews";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, organizationId } = await getUserToken(request);

    if (!userId || !organizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Await the params since it's now a Promise
    const resolvedParams = await params;
    const gameId = resolvedParams.id;

    if (!gameId) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Game Id is missing.",
          data: null,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const result = await toggleGameLike(gameId, userId);

    return NextResponse.json(
      {
        status: "Success",
        message: `Game ${result.action} successfully.`,
        data: result,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    const err = error as Error;
    console.error("API Error:", err);
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
