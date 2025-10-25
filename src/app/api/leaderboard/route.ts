import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { GetLeaderBoard } from "@/server/queries/courses";
import { getUserToken } from "@/utils/getToken";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUserToken(req);

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all";
    const GameId = searchParams.get("GameId") || "";

    const formData = {
      userId,
      GameId,
      range,
    };

    const leaderboard = await GetLeaderBoard(formData);
    return NextResponse.json(
      {
        status: "Success",
        message: "leaderboard fetched successfully!",
        data: leaderboard,
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
