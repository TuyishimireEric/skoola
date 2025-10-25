import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  getStudentGame,
  recordStudentSection,
} from "@/server/queries/courses";
import { courseSectionSchema } from "@/types/Course";
import { getUserToken } from "@/utils/getToken";

export async function POST(req: NextRequest) {
  try {
    const { userId, userRoleId } =
      await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Please Login!",
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

    if (userRoleId !== 2 && userRoleId !== 5) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Please you have to be a student!",
        },
        { status: HttpStatusCode.Unauthorized }
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
          message: "Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { searchParams } = new URL(req.url);
    const GameId = searchParams.get("GameId") || "";
    const studentId = searchParams.get("studentId") || "";

    const articles = await getStudentGame({
      GameId,
      studentId,
    });
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
