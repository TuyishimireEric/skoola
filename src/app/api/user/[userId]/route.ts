import { getUserProfile } from "@/server/queries";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { userId: currentId } = await params;

    if (currentId !== userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Error occured!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const userData = await getUserProfile(userId);

    if (!userData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Profile Retrieved Successfully!",
        data: userData,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error in kids-profile API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
