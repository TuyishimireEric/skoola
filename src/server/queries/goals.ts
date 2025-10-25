import { and, eq, gte, lte, sql } from "drizzle-orm";
import { Goals, StudentGame } from "../db/schema";
import { db } from "../db";
import { NewGoalI } from "@/app/api/goals/route";

export const getGoalsWithProgress = async ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: string;
  endDate: string;
}) => {
  // Fetch goals within the date range (inclusive)
  const userGoals = await db
    .select()
    .from(Goals)
    .where(
      and(
        eq(Goals.StudentId, userId),
        gte(Goals.DateKey, startDate),
        lte(Goals.DateKey, endDate)
      )
    );

  return Promise.all(
    userGoals.map(async (goal) => {
      const progress = await calculateGoalProgress(goal, userId, goal.DateKey);
      return {
        ...goal,
        currentProgress: progress.currentProgress,
        calculatedCompleted: progress.completed,
      };
    })
  );
};

export const addGoalWithProgress = async (formData: NewGoalI) => {
  const newGoal = await db.insert(Goals).values(formData).returning();
  return newGoal;
};

// Helper function to calculate progress from StudentGame for a specific date
export async function calculateGoalProgress(
  goal: {
    Id: string;
    StudentId: string;
    CreatedBy: string;
    Name: string;
    Type: "study_time" | "course" | "stars" | "custom";
    TargetValue: number | null;
    TargetGameId: string | null;
    DateKey: string;
    Completed: boolean;
    CreatedAt: string;
    UpdatedAt: string;
  },
  userId: string,
  dateKey: string
) {
  const targetDate = new Date(dateKey);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  switch (goal.Type) {
    case "study_time":
      // Calculate total study time for the specific day
      const studyTimeResult = await db
        .select({
          totalMinutes: sql<number>`
            EXTRACT(EPOCH FROM (
              COALESCE(SUM("CompletedOn" - "StartedOn"), INTERVAL '0')
            )) / 60
          `.as("totalMinutes"),
        })
        .from(StudentGame)
        .where(
          and(
            eq(StudentGame.StudentId, userId),
            gte(StudentGame.StartedOn, targetDate.toISOString()),
            lte(StudentGame.StartedOn, nextDay.toISOString())
          )
        );

      const totalMinutes = Math.floor(studyTimeResult[0]?.totalMinutes || 0);
      return {
        currentProgress: totalMinutes,
        completed: goal.TargetValue ? totalMinutes >= goal.TargetValue : false,
      };

    case "stars":
      // Calculate total stars earned for the specific day
      const starsResult = await db
        .select({
          totalStars: sql<number>`COALESCE(SUM("Stars"), 0)`.as("totalStars"),
        })
        .from(StudentGame)
        .where(
          and(
            eq(StudentGame.StudentId, userId),
            gte(StudentGame.StartedOn, targetDate.toISOString()),
            lte(StudentGame.StartedOn, nextDay.toISOString())
          )
        );

      const totalStars = Number(starsResult[0]?.totalStars || 0);
      return {
        currentProgress: totalStars,
        completed: goal.TargetValue ? totalStars >= goal.TargetValue : false,
      };

    case "course":
      // Check if specific course is completed on that day
      if (!goal.TargetGameId) return { currentProgress: 0, completed: false };

      const courseResult = await db
        .select({
          completed: StudentGame.CompletedOn,
        })
        .from(StudentGame)
        .where(
          and(
            eq(StudentGame.StudentId, userId),
            eq(StudentGame.GameId, goal.TargetGameId),
            gte(StudentGame.StartedOn, targetDate.toISOString()),
            lte(StudentGame.StartedOn, nextDay.toISOString())
          )
        )
        .limit(1);

      return {
        currentProgress: courseResult[0]?.completed ? 1 : 0,
        completed: !!courseResult[0]?.completed,
      };

    case "custom":
      // Custom goals are manually marked
      return {
        currentProgress: goal.Completed ? 1 : 0,
        completed: goal.Completed,
      };

    default:
      return { currentProgress: 0, completed: false };
  }
}
