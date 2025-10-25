import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getAdminGames } from "@/server/queries/games";
import { getUserToken } from "@/utils/getToken";

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

    const games = await getAdminGames(formData);
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
