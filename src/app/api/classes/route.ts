
import { getClasses } from "@/server/queries/classes";
import { NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

export async function GET() {
  try {
    const allClasses = await getClasses();
    return NextResponse.json(
      {
        message: "Classes retrieved successfully",
        data: allClasses,
      },
      { status:HttpStatusCode.Ok }
    );
  } catch (error) {
    const Error = error as Error;
    return NextResponse.json({ message: Error.message }, { status: HttpStatusCode.InternalServerError });
  }
}
