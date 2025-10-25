import { NextRequest, NextResponse } from "next/server";
import {
  createQuestions,
  getQuestions,
  deleteQuestion,
  ReferenceNotFoundError,
} from "@/server/queries/questionBank";
import { z } from "zod";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";

// Validation schema for question data
const QuestionSchema = z.object({
  QuestionText: z.string().min(1, "Question text is required"),
  QuestionType: z.string().min(1, "Question type is required"),
  MediaType: z.enum(["text", "image", "audio", "video"]).default("text"),
  MediaUrl: z.string().optional(),
  Options: z.string().optional(),
  CorrectAnswer: z.union([z.string(), z.any()]), // Can be string or JSON
  Explanation: z.string().optional(),
  Difficulty: z.enum(["easy", "medium", "hard"]),
  Language: z.string().default("en"),
  GameId: z.string().uuid(),
  IsApproved: z.boolean().default(false),
});

const CreateQuestionsSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .min(1, "At least one question is required"),
});

export async function POST(request: NextRequest) {
  try {
    const { userId, userRoleId, organizationId } = await getUserToken(request);

    if (!userId || !organizationId || !userRoleId || userRoleId !== 1) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized.",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = CreateQuestionsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid question data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { questions } = validationResult.data;

    // Create questions using service
    const insertedQuestions = await createQuestions({
      questions,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Questions created Successfully`,
        data: {
          count: insertedQuestions.length,
          questions: insertedQuestions,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating questions:", error);

    if (error instanceof ReferenceNotFoundError) {
      return NextResponse.json(
        {
          error: "Reference Error",
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to create questions. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Handle QuestionIds - convert comma-separated string to array
    const questionIds = searchParams.getAll("questionIds[]");

    const filters = {
      GameId: searchParams.get("GameId") || undefined,
      organizationId: searchParams.get("organizationId") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit") as string, 10)
        : undefined,
      subject: searchParams.get("subject") || undefined,
      difficulty: searchParams.get("difficulty") as
        | "easy"
        | "medium"
        | "hard"
        | undefined,
      isApproved: searchParams.has("isApproved")
        ? searchParams.get("isApproved") === "true"
        : undefined,
      createdBy: searchParams.get("createdBy") || undefined,
      questionIds,
      // questionTypes: ["SelectChoice"],
    };

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof typeof filters] === undefined &&
        delete filters[key as keyof typeof filters]
    );

    // Get questions using service
    const questions = await getQuestions(filters);

    return NextResponse.json({
      success: true,
      data: questions,
      count: questions.length,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch questions",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, userRoleId, organizationId } = await getUserToken(request);

    if (!userId || !organizationId || !userRoleId || userRoleId !== 1) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized.",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "Bad Request", message: "Question ID is required" },
        { status: 400 }
      );
    }

    await deleteQuestion(questionId);

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to delete question",
      },
      { status: 500 }
    );
  }
}
