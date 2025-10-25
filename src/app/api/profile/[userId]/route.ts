import { getKidProfileData } from "@/server/queries/kidsProfile";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const {
      userId: CurrentUser,
      userRoleId,
      organizationId,
    } = await getUserToken(req);

    if (!CurrentUser || !organizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized, Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    let kidId;

    if (userRoleId == 2) {
      kidId = CurrentUser;
    } else {
      // Await the params promise
      const { userId } = await params;

      kidId = userId;

      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }
    }

    const profileData = await getKidProfileData(kidId);

    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Profile Retrieved Successfully!",
        data: profileData,
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
