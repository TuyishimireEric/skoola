import { getStudentIdsByParentId, updateUser } from "@/server/queries";
import { getKidsProfilesData } from "@/server/queries/kidsProfile";
import { UpdateUserInterface } from "@/types";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: CurrentUser, userRoleId } = await getUserToken(req);

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

    const studentIds = await getStudentIdsByParentId(CurrentUser);

    const profileData = await getKidsProfilesData(studentIds);

    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Course Created Successfully!",
        data: profileData,
      },
      { status: HttpStatusCode.Created }
    );
  } catch (error) {
    console.error("Error in kids-profile API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, organizationId, userOrganizationId } = await getUserToken(
      req
    );

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

    if (!organizationId || !userOrganizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "User not associated with any organization",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const body = await req.json();
    const { ImageUrl, DateOfBirth, Id, Phone, FullName, Address, Gender } =
      body;

    if (Id !== userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const formData: UpdateUserInterface = {
      ImageUrl,
      DateOfBirth,
      Phone,
      Address,
      FullName,
      Gender,
    };

    await updateUser(formData, Id);

    return NextResponse.json(
      {
        status: "Success",
        message: "User updated successfully!",
        data: null,
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
