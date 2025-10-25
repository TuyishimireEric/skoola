import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { recordStudentSection } from "@/server/queries/courses";
import { courseSectionSchema } from "@/types/Course";
import { getUserOrganizations, updateOrganizationUser } from "@/server/queries";
import { organizationUserSchema } from "@/types";
import { getUserToken } from "@/utils/getToken";

export async function POST(req: NextRequest) {
  try {
    const { userId } =
      await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Please you have to be a student!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const formData = await req.json();

    const validationResult = courseSectionSchema.safeParse(formData);

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

    const validatedData = validationResult.data;

    const inserted = await recordStudentSection(validatedData);

    return NextResponse.json(
      {
        status: "Success",
        message: "Course Section Recorded Successfully!",
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

export async function GET(req: NextRequest) {
  try {
    const { userId } =
      await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Please you have to be a Logged in!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const organizations = await getUserOrganizations(userId);
    return NextResponse.json(
      {
        status: "Success",
        message: "Organizations fetched successfully!",
        data: organizations,
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
    const { userId } =
      await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const formData = await req.json();

    const validationResult = organizationUserSchema.safeParse(formData);

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

    const validatedData = validationResult.data;

    const updated = await updateOrganizationUser(validatedData);

    return NextResponse.json(
      {
        status: "Success",
        message: "Course Section Updated Successfully!",
        data: updated,
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
