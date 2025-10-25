import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  addStudentMissedQuestions,
  getMissedQuestionsGroupedByGame,
  updatePassedQuestions,
} from "@/server/queries/missedQuestions";
import {
  addMissedQuestionsSchema,
  getMissedQuestionsSchema,
} from "@/types/MissedQuestions";
import { getUserToken } from "@/utils/getToken";

export async function POST(req: NextRequest) {
  try {
    const { userId, userRoleId } = await getUserToken(req);

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
    const { data } = formData;

    const validationResult = addMissedQuestionsSchema.safeParse(data);

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

    // Check if user can add missed questions for this student
    if (userRoleId !== 2 && userRoleId !== 5 && data.studentId !== userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "You can only add missed questions for yourself or you must be a student!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const result = await addStudentMissedQuestions(validationResult.data);

    return NextResponse.json(
      {
        status: "Success",
        message: `Successfully added ${result.inserted} missed questions. ${result.skipped} were skipped as duplicates.`,
        data: result,
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
    const { userId } = await getUserToken(req);

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
    const studentId = searchParams.get("studentId") || userId;
    const status = searchParams.get("status") || undefined;
    const dateRange = searchParams.get("dateRange") || "";

    // Validate query parameters
    const queryData = {
      studentId,
      status: status as "Missed" | "Passed" | "Reviewing" | undefined,
      dateRange: dateRange as "7d" | "30d" | "last_month" | undefined,
    };

    const validationResult = getMissedQuestionsSchema.safeParse(queryData);

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

    const result = await getMissedQuestionsGroupedByGame({
      studentId,
      dateRange,
    });
    const message = "Missed questions grouped by game fetched successfully!";

    return NextResponse.json(
      {
        status: "Success",
        message,
        data: result,
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
    const { userId, userRoleId } = await getUserToken(req);

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
    const { studentId, questionIds } = formData;

    // Validate input data
    if (!studentId || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "studentId and questionIds array are required!",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Check if user can update questions for this student
    if (userRoleId !== 2 && userRoleId !== 5 && studentId !== userId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "You can only update passed questions for yourself or you must be a student!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const result = await updatePassedQuestions({
      studentId,
      questionIds,
    });

    if (result.updated) {
      return NextResponse.json(
        {
          status: "Success",
          message: "Questions successfully marked as passed!",
          data: { updated: true },
        },
        { status: HttpStatusCode.Ok }
      );
    } else {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Failed to update questions to passed status!",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
