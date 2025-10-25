import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getUserToken } from "@/utils/getToken";
import {
  getUserList,
  updateOrganizationUser,
  updateUser,
} from "@/server/queries";
import { User } from "@/server/db/schema";
import { UpdateUserInterface } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { userId, organizationId } = await getUserToken(req);

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

    if (!organizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "User not associated with any organization",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const searchText = searchParams.get("searchText") || "";
    const role = searchParams.get("role") || "";
    const sort = searchParams.get("sort") || "createdOn";
    const sortOrder = searchParams.get("order") || "desc";

    const sortableFields = {
      fullName: User.FullName,
      email: User.Email,
      createdOn: User.CreatedOn,
    };

    const sortColumn =
      sortableFields[sort as keyof typeof sortableFields] || User.CreatedOn;

    const payload = {
      page,
      pageSize,
      searchText,
      organizationId,
      role,
      sortColumn,
      sortOrder,
    };

    const articles = await getUserList(payload);
    return NextResponse.json(
      {
        status: "Success",
        message: "Courses fetched successfully!",
        data: articles,
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
    const { ImageUrl, DateOfBirth, RoleId } = body;

    const formData: UpdateUserInterface = {
      ImageUrl,
      DateOfBirth,
    };

    if(DateOfBirth){
      await  updateUser(formData, userId);
    }

    if(RoleId == 2 || RoleId== 6){
      updateOrganizationUser({
        Id: userOrganizationId,
        RoleId,
      });
    }
     

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
