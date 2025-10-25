import {
  addOrganizationUser,
  updateOrganizationUser,
  updateUser,
} from "@/server/queries";
import {
  acceptInvitation,
  getOrganizationTeachers,
} from "@/server/queries/teacher";
import { UpdateUserInterface } from "@/types";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

// GET method to fetch organization teachers (Only for Admin roles: 1 or 6)
export async function GET(req: NextRequest) {
  try {
    const { userId, organizationId, userOrganizationId, userRoleId } =
      await getUserToken(req);

    // Check if user is logged in
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

    if (!userRoleId || (userRoleId !== 1 && userRoleId !== 6)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "Access denied. Only administrators can view teachers list." +
            userRoleId,
        },
        { status: HttpStatusCode.Forbidden }
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

    // Fetch teachers for the organization
    const teachers = await getOrganizationTeachers(organizationId);

    return NextResponse.json(
      {
        status: "Success",
        message: "Teachers fetched successfully!",
        data: teachers,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: error.message || "Failed to fetch teachers",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, organizationId, userOrganizationId, userOrganizations } =
      await getUserToken(req);

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
    const { Id, OrganizationId, Token } = body;

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

    const InOrganization = userOrganizations?.find(
      (organization) => organization.OrganizationId === OrganizationId
    );

    if (Token) {
      await acceptInvitation(Token);
    }

    if (InOrganization) {
      await updateOrganizationUser({
        Id: InOrganization.Id,
        RoleId: 3,
        Status: "Active",
      });
    } else {
      await addOrganizationUser({
        UserId: userId,
        OrganizationId,
        RoleId: 3,
        Status: "Active",
      });
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Updated successfully!",
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
    const { ImageUrl, Id, Address, AboutMe, Subjects } = body;

    console.log("id", Id, "userId", userId);

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
      Address,
      AboutMe,
    };

    await updateUser(formData, Id);

    await updateOrganizationUser({
      Id: userOrganizationId,
      RoleId: 3,
      Status: "Pending",
      Subjects,
    });

    return NextResponse.json(
      {
        status: "Success",
        message: "Updated successfully!",
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
