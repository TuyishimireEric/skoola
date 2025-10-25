import { db } from "@/server/db";
import { StudentMissedQuestion, Game, QuestionBank } from "@/server/db/schema";
import { GameMissedQuestionsI } from "@/types/MissedQuestions";
import { and, eq, gte, inArray, lte } from "drizzle-orm";

export const addStudentMissedQuestions = async (data: {
  studentId: string;
  questionIds: string[];
}) => {
  if (!data.questionIds.length) {
    return { inserted: 0, skipped: 0, insertedIds: [] };
  }

  // First, check which questions already exist for this student
  const existingQuestions = await db
    .select({
      QuestionId: StudentMissedQuestion.QuestionId,
    })
    .from(StudentMissedQuestion)
    .where(
      and(
        eq(StudentMissedQuestion.StudentId, data.studentId),
        inArray(StudentMissedQuestion.QuestionId, data.questionIds)
      )
    );

  const existingQuestionIds = new Set(
    existingQuestions.map((q) => q.QuestionId)
  );

  // Filter out questions that already exist
  const newQuestionIds = data.questionIds.filter(
    (questionId) => !existingQuestionIds.has(questionId)
  );

  let insertedIds: string[] = [];

  // Insert only new questions
  if (newQuestionIds.length > 0) {
    const insertData = newQuestionIds.map((questionId) => ({
      StudentId: data.studentId,
      QuestionId: questionId,
      Status: "Missed" as const,
    }));

    const result = await db
      .insert(StudentMissedQuestion)
      .values(insertData)
      .returning({
        Id: StudentMissedQuestion.Id,
        QuestionId: StudentMissedQuestion.QuestionId,
      });

    insertedIds = result.map((r) => r.Id);
  }

  return {
    inserted: newQuestionIds.length,
    skipped: existingQuestionIds.size,
    insertedIds,
    skippedQuestionIds: Array.from(existingQuestionIds),
  };
};

export const getMissedQuestionsGroupedByGame = async (data: {
  studentId: string;
  dateRange: string;
}): Promise<GameMissedQuestionsI[]> => {
  const now = new Date();
  let fromDate: Date;
  let toDate = new Date();

  // Calculate date range
  switch (data.dateRange) {
    case "7d":
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "last_month":
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      toDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    default:
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Query only missed questions with proper joins
  const results = await db
    .select({
      gameId: Game.Id,
      gameTitle: Game.Title,
      gameImage: Game.ImageUrl,
      questionId: StudentMissedQuestion.QuestionId,
    })
    .from(StudentMissedQuestion)
    .innerJoin(
      QuestionBank,
      eq(StudentMissedQuestion.QuestionId, QuestionBank.Id)
    )
    .innerJoin(Game, eq(QuestionBank.GameId, Game.Id))
    .where(
      and(
        eq(StudentMissedQuestion.StudentId, data.studentId),
        eq(StudentMissedQuestion.Status, "Missed"), // Only missed questions
        gte(StudentMissedQuestion.CreatedOn, fromDate.toISOString()),
        lte(StudentMissedQuestion.CreatedOn, toDate.toISOString())
      )
    )
    .orderBy(Game.Title);

  // Group by game
  const gameMap = results.reduce(
    (acc, row) => {
      const { gameId, gameTitle, gameImage, questionId } = row;

      if (!acc.has(gameId)) {
        acc.set(gameId, {
          gameId,
          gameTitle,
          gameImage,
          questionIds: [],
        });
      }

      acc.get(gameId)!.questionIds.push(questionId);
      return acc;
    },
    new Map<
      string,
      {
        gameId: string;
        gameTitle: string;
        gameImage: string;
        questionIds: string[];
      }
    >()
  );

  return Array.from(gameMap.values());
};

export const updatePassedQuestions = async (data: {
  studentId: string;
  questionIds: string[];
}) => {
  if (!data.questionIds.length) {
    return { updated: false };
  }

  try {
    // Update questions from "Missed" to "Passed" status
    await db
      .update(StudentMissedQuestion)
      .set({
        Status: "Passed",
        UpdatedOn: new Date().toISOString(),
      })
      .where(
        and(
          eq(StudentMissedQuestion.StudentId, data.studentId),
          inArray(StudentMissedQuestion.QuestionId, data.questionIds),
          eq(StudentMissedQuestion.Status, "Missed")
        )
      );

    return { updated: true };
  } catch (error) {
    console.error("Error updating passed questions:", error);
    return { updated: false };
  }
};
