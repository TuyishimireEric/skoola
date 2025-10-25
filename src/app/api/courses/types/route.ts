import { getGameTypes } from "@/server/queries/courses";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const coursesTypes = await getGameTypes();
    return NextResponse.json(
      {
        status: "Success",
        message: "Courses Types fetched successfully!",
        data: coursesTypes,
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
