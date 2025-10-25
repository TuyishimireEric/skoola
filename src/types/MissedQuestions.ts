import { z } from "zod";

export const addMissedQuestionsSchema = z.object({
  studentId: z.string().uuid("Invalid student ID format"),
  questionIds: z
    .array(z.string().uuid("Invalid question ID format"))
    .min(1, "At least one question ID is required"),
});

export const getMissedQuestionsSchema = z.object({
  studentId: z.string().uuid("Invalid student ID format").optional(),
  status: z.enum(["Missed", "Passed", "Reviewing"]).optional(),
  dateRange: z.enum(["7d", "30d", "last_month"]).optional(),
});

export interface AddMissedQuestionsData {
  studentId: string;
  questionIds: string[];
}

export interface GetMissedQuestionsParams {
  studentId?: string;
  status?: "Missed" | "Passed" | "Reviewing";
  dateRange?: "7d" | "30d" | "last_month";
}

export interface MissedQuestionI {
  Id: string;
  QuestionId: string;
  Status: string;
  CreatedOn: string;
}

export interface GameMissedQuestionsI {
  gameId: string;
  gameTitle: string;
  gameImage: string;
  questionIds: string[];
}

export interface GameSummaryI {
  gameId: string;
  gameTitle: string;
  gameType: string;
  missedCount: number;
  passedCount: number;
  totalQuestions: number;
  missedQuestions: MissedQuestionI[];
}


export interface AddMissedQuestionsResponseI {
  inserted: number;
  skipped: number;
  insertedIds: string[];
  skippedQuestionIds?: string[];
}
