import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserToken } from "@/utils/getToken";
import {
  addGoalWithProgress,
  calculateGoalProgress,
  getGoalsWithProgress,
} from "@/server/queries/goals";
import { HttpStatusCode } from "axios";
import { getStudentIdsByParentId } from "@/server/queries";

// Validation schema
const createGoalSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["study_time", "course", "stars", "custom"]),
  targetValue: z.number().optional(),
  targetGameId: z.string().uuid().optional(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export interface NewGoalI {
  Name: string;
  Type: "study_time" | "course" | "stars" | "custom";
  TargetValue?: number;
  TargetGameId?: string;
  DateKey: string;
  CreatedBy: string;
  StudentId: string;
}

export async function GET(req: NextRequest) {
  try {
    const {
      userId: currentUserId,
      userRoleId,
      organizationId,
    } = await getUserToken(req);

    if (!currentUserId || !organizationId || !userRoleId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized: Please log in.",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    if (![2, 6].includes(userRoleId)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "Forbidden: You do not have permission to access recommendations.",
        },
        { status: HttpStatusCode.Forbidden }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "startDate and endDate are required",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    let kidId: string;

    if (userRoleId === 6) {
      if (!userId) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message: "Student ID parameter is required.",
          },
          { status: HttpStatusCode.BadRequest }
        );
      }

      const studentIds = await getStudentIdsByParentId(currentUserId);
      if (!studentIds.includes(userId)) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message:
              "Access denied: This student is not assigned to your account.",
          },
          { status: HttpStatusCode.Forbidden }
        );
      }

      kidId = userId;
    } else {
      kidId = currentUserId;
    }

    // Calculate progress for each goal
    const goalsWithProgress = await getGoalsWithProgress({
      userId: kidId,
      startDate,
      endDate,
    });

    // Return consistent response format
    return NextResponse.json({
      status: "Success",
      data: goalsWithProgress,
      message: "Goals fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: "Failed to fetch goals",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

// POST: Create a new goal
export async function POST(req: NextRequest) {
  try {
    const {
      userId: currentUserId,
      userRoleId,
      organizationId,
    } = await getUserToken(req);

    if (!currentUserId || !organizationId || !userRoleId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized: Please log in.",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    if (![2, 6].includes(userRoleId)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message:
            "Forbidden: You do not have permission to access recommendations.",
        },
        { status: HttpStatusCode.Forbidden }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    let kidId: string;

    if (userRoleId === 6) {
      if (!userId) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message: "Student ID parameter is required.",
          },
          { status: HttpStatusCode.BadRequest }
        );
      }

      const studentIds = await getStudentIdsByParentId(currentUserId);
      if (!studentIds.includes(userId)) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message:
              "Access denied: This student is not assigned to your account.",
          },
          { status: HttpStatusCode.Forbidden }
        );
      }

      kidId = userId;
    } else {
      kidId = currentUserId;
    }

    const body = await req.json();
    const validatedData = createGoalSchema.parse(body);

    const data = {
      ...validatedData,
      Name: validatedData.name,
      Type: validatedData.type,
      TargetValue: validatedData.targetValue,
      TargetGameId: validatedData.targetGameId,
      DateKey: validatedData.dateKey,
      CreatedBy: currentUserId,
      StudentId: kidId,
    };

    const newGoal = await addGoalWithProgress(data);

    // Calculate initial progress
    const progress = await calculateGoalProgress(
      newGoal[0],
      kidId,
      validatedData.dateKey
    );

    return NextResponse.json({
      ...newGoal[0],
      currentProgress: progress.currentProgress,
      calculatedCompleted: progress.completed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
