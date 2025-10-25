import { db } from "../db";
import { QuestionBank } from "../db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { QuestionDataI } from "@/types/Questions";

export interface CreateQuestionsInput {
  questions: QuestionDataI[];
  userId: string;
}

export interface QuestionFilters {
  GameId?: string;
  organizationId?: string;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
  isApproved?: boolean;
  createdBy?: string;
  limit?: number;
  questionTypes?: string[];
  questionIds?: string[];
}

/**
 * Create multiple questions in the database
 */
export async function createQuestions({
  questions,
  userId,
}: CreateQuestionsInput) {
  const questionsToInsert = questions.map((question) => ({
    QuestionText: question.QuestionText,
    QuestionType: question.QuestionType,
    MediaType: question.MediaType as "text" | "image" | "audio" | "video",
    MediaUrl: question.MediaUrl || null,
    Options: question.Options ? JSON.parse(question.Options) : null,
    CorrectAnswer:
      typeof question.CorrectAnswer === "string"
        ? question.CorrectAnswer
        : JSON.stringify(question.CorrectAnswer),
    Explanation: question.Explanation || null,
    Difficulty: question.Difficulty.toLowerCase() as "easy" | "medium" | "hard",
    Language: question.Language || "en",
    GameId: question.GameId || null,
    IsApproved: question.IsApproved || false,
    CreatedBy: userId,
    UpdatedBy: userId,
  }));

  const result = await db.transaction(async (tx) => {
    const insertedQuestions = await tx
      .insert(QuestionBank)
      .values(questionsToInsert)
      .returning({
        Id: QuestionBank.Id,
        QuestionText: QuestionBank.QuestionText,
        QuestionType: QuestionBank.QuestionType,
        IsApproved: QuestionBank.IsApproved,
      });

    return insertedQuestions;
  });

  return result;
}

export async function getQuestions(filters: QuestionFilters = {}) {
  const query = db.select().from(QuestionBank);

  // Apply filters
  const conditions = [];

  if (filters.GameId) {
    conditions.push(eq(QuestionBank.GameId, filters.GameId));
  }

  if (filters.difficulty) {
    conditions.push(eq(QuestionBank.Difficulty, filters.difficulty));
  }

  if (filters.isApproved !== undefined) {
    conditions.push(eq(QuestionBank.IsApproved, filters.isApproved));
  }

  if (filters.createdBy) {
    conditions.push(eq(QuestionBank.CreatedBy, filters.createdBy));
  }

  if (filters.questionIds && filters.questionIds.length > 0) {
    conditions.push(inArray(QuestionBank.Id, filters.questionIds));
  }

  // if (filters.excludeQuestionIds && filters.excludeQuestionIds.length > 0) {
  //   conditions.push(notInArray(QuestionBank.Id, filters.excludeQuestionIds));
  // }

  if (filters.questionTypes && filters.questionTypes.length > 0) {
    conditions.push(inArray(QuestionBank.QuestionType, filters.questionTypes));
  }

  let finalQuery;
  if (conditions.length > 0) {
    finalQuery = query.where(and(...conditions));
  } else {
    finalQuery = query;
  }

  // ALWAYS use random order to prevent repetition
  finalQuery = finalQuery.orderBy(sql`RANDOM()`);

  // Apply limit if provided
  if (filters.limit && filters.limit > 0) {
    finalQuery = finalQuery.limit(filters.limit);
  }

  const questions = await finalQuery;
  return questions;
}

export async function getQuestionsByIds(questionIds: string[]) {
  const questions = await db
    .select()
    .from(QuestionBank)
    .where(inArray(QuestionBank.Id, questionIds));

  return questions;
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string) {
  await db.delete(QuestionBank).where(eq(QuestionBank.Id, questionId));
}

/**
 * Approve/reject questions
 */
export async function approveQuestion(
  questionId: string,
  isApproved: boolean,
  approvedBy: string
) {
  const [updatedQuestion] = await db
    .update(QuestionBank)
    .set({
      IsApproved: isApproved,
      ApprovedBy: isApproved ? approvedBy : null,
      UpdatedBy: approvedBy,
      UpdatedOn: new Date(),
    })
    .where(eq(QuestionBank.Id, questionId))
    .returning();

  return updatedQuestion;
}

/**
 * Get questions count by filters
 */
export async function getQuestionsCount(filters: QuestionFilters = {}) {
  const questions = await getQuestions(filters);
  return questions.length;
}

/**
 * Get questions by course ID
 */
export async function getQuestionsByCourse(
  GameId: string,
  isApproved?: boolean
) {
  const filters: QuestionFilters = { GameId };
  if (isApproved !== undefined) {
    filters.isApproved = isApproved;
  }
  return getQuestions(filters);
}

/**
 * Get questions by organization ID
 */
export async function getQuestionsByOrganization(
  organizationId: string,
  isApproved?: boolean
) {
  const filters: QuestionFilters = { organizationId };
  if (isApproved !== undefined) {
    filters.isApproved = isApproved;
  }
  return getQuestions(filters);
}

/**
 * Get questions by difficulty level
 */
export async function getQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard",
  organizationId?: string
) {
  const filters: QuestionFilters = { difficulty };
  if (organizationId) {
    filters.organizationId = organizationId;
  }
  return getQuestions(filters);
}

/**
 * Get approved questions for a course
 */
export async function getApprovedQuestionsForCourse(GameId: string) {
  return getQuestions({
    GameId,
    isApproved: true,
  });
}

/**
 * Get pending questions for approval
 */
export async function getPendingQuestions(organizationId?: string) {
  const filters: QuestionFilters = { isApproved: false };
  if (organizationId) {
    filters.organizationId = organizationId;
  }
  return getQuestions(filters);
}

/**
 * Bulk approve questions
 */
export async function bulkApproveQuestions(
  questionIds: string[],
  approvedBy: string
) {
  const updatedQuestions = await db
    .update(QuestionBank)
    .set({
      IsApproved: true,
      ApprovedBy: approvedBy,
      UpdatedBy: approvedBy,
      UpdatedOn: new Date(),
    })
    .where(inArray(QuestionBank.Id, questionIds))
    .returning();

  return updatedQuestions;
}

/**
 * Bulk delete questions
 */
export async function bulkDeleteQuestions(questionIds: string[]) {
  await db.delete(QuestionBank).where(inArray(QuestionBank.Id, questionIds));
}

export class QuestionNotFoundError extends Error {
  constructor(questionId: string) {
    super(`Question with ID ${questionId} not found`);
    this.name = "QuestionNotFoundError";
  }
}

export class ReferenceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReferenceNotFoundError";
  }
}
