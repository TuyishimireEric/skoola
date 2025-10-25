import { db } from "@/server/db";

import {
  Game,
  GameLike,
  GameReview,
  StudentGame,
  User,
} from "@/server/db/schema";
import { GameDataI } from "@/types/Course";
import { and, desc, sql, or, eq, countDistinct, count } from "drizzle-orm";

interface GameQueryParams {
  page: number;
  pageSize: number;
  searchText: string;
  subject?: string;
  grade?: string;
  organizationId: string;
}

export const getGames = async (
  data: GameQueryParams,
  trx: typeof db = db
): Promise<GameDataI[]> => {
  // Calculate pagination values
  const limit = data.pageSize;
  const offset = (data.page - 1) * data.pageSize;

  // Build base query filters
  const baseFilters = [];

  baseFilters.push(eq(Game.Status, "Published"));
  baseFilters.push(eq(Game.OrganizationId, data.organizationId));

  if (data.searchText) {
    const searchTerm = `%${data.searchText.toLowerCase()}%`;
    baseFilters.push(
      or(
        sql`LOWER(${Game.Title}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Description}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Topic}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Subject}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Tags}) LIKE ${searchTerm}`
      )
    );
  }

  if (data.subject) {
    baseFilters.push(eq(Game.Subject, data.subject));
  }

  if (data.grade) {
    const level = Number(data.grade);
    baseFilters.push(eq(Game.GameLevel, level));
  }

  // Get courses with pagination
  const courses = await trx
    .select({
      Id: Game.Id,
      Title: Game.Title,
      Description: Game.Description,
      Topic: Game.Topic,
      ImageUrl: Game.ImageUrl,
      TutorialVideo: Game.TutorialVideo,
      Subject: Game.Subject,
      Prompt: Game.Prompt,
      Status: Game.Status,
      Duration: Game.Duration,
      PassScore: Game.PassScore,
      Retakes: Game.Retakes,
      Tags: Game.Tags,
      NumberOfQuestions: Game.NumberOfQuestions,
      OrganizationId: Game.OrganizationId,
      Type: Game.Type,
      AgeGroup: Game.AgeGroup,
    })
    .from(Game)
    .where(and(...baseFilters))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(Game.CreatedOn));

  return courses as GameDataI[];
};

export const getAdminGames = async (
  data: GameQueryParams,
  trx: typeof db = db
): Promise<GameDataI[]> => {
  const limit = data.pageSize;
  const offset = (data.page - 1) * data.pageSize;

  // Build filters using Drizzle syntax
  const baseFilters = [];
  baseFilters.push(eq(Game.Status, "Published"));
  baseFilters.push(eq(Game.OrganizationId, data.organizationId));

  if (data.searchText) {
    const searchTerm = `%${data.searchText.toLowerCase()}%`;
    baseFilters.push(
      or(
        sql`LOWER(${Game.Title}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Description}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Topic}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Subject}) LIKE ${searchTerm}`,
        sql`LOWER(${Game.Tags}) LIKE ${searchTerm}`
      )
    );
  }

  if (data.subject) {
    baseFilters.push(eq(Game.Subject, data.subject));
  }

  if (data.grade) {
    const level = Number(data.grade);
    baseFilters.push(eq(Game.GameLevel, level));
  }

  // Create subqueries using Drizzle
  const gameStats = trx
    .select({
      GameId: StudentGame.GameId,
      studentsAttended: countDistinct(StudentGame.StudentId).as(
        "students_attended"
      ),
      completionRate: sql<number>`
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN ${StudentGame.Score} >= 50 THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
        END
      `.as("completion_rate"),
    })
    .from(StudentGame)
    .groupBy(StudentGame.GameId)
    .as("game_stats");

  const gameRatings = trx
    .select({
      GameId: GameReview.GameId,
      avgRating: sql<number>`ROUND(AVG(${GameReview.Rating})::numeric, 2)`.as(
        "avg_rating"
      ),
      totalReviews: count().as("total_reviews"),
    })
    .from(GameReview)
    .where(eq(GameReview.IsApproved, true))
    .groupBy(GameReview.GameId)
    .as("game_ratings");

  // No need for separate gameModerators subquery since we'll join User directly

  // Main query using Drizzle
  const results = await trx
    .select({
      // Game fields
      Id: Game.Id,
      Title: Game.Title,
      Description: Game.Description,
      Topic: Game.Topic,
      ImageUrl: Game.ImageUrl,
      TutorialVideo: Game.TutorialVideo,
      Subject: Game.Subject,
      Prompt: Game.Prompt,
      Status: Game.Status,
      Duration: Game.Duration,
      PassScore: Game.PassScore,
      Retakes: Game.Retakes,
      Tags: Game.Tags,
      NumberOfQuestions: Game.NumberOfQuestions,
      OrganizationId: Game.OrganizationId,
      Type: Game.Type,
      AgeGroup: Game.AgeGroup,
      CreatedOn: Game.CreatedOn,
      Grade: Game.GameLevel,
      // Stats fields
      moderatorName: User.FullName,
      moderatorImage: User.ImageUrl,
      studentsAttended: sql<number>`COALESCE(${gameStats.studentsAttended}, 0)`,
      completionRate: sql<number>`COALESCE(${gameStats.completionRate}, 0)`,
      averageRating: sql<number>`COALESCE(${gameRatings.avgRating}, 0)`,
    })
    .from(Game)
    .leftJoin(User, eq(User.Id, Game.CreatedBy))
    .leftJoin(gameStats, eq(gameStats.GameId, Game.Id))
    .leftJoin(gameRatings, eq(gameRatings.GameId, Game.Id))
    .where(and(...baseFilters))
    .orderBy(desc(Game.CreatedOn))
    .limit(limit)
    .offset(offset);

  // Transform results to match expected format
  const courses = results.map((row) => ({
    Id: row.Id,
    Title: row.Title,
    Description: row.Description,
    Topic: row.Topic,
    ImageUrl: row.ImageUrl,
    TutorialVideo: row.TutorialVideo,
    Subject: row.Subject,
    Prompt: row.Prompt,
    Status: row.Status,
    Duration: row.Duration,
    PassScore: row.PassScore,
    Retakes: row.Retakes,
    Tags: row.Tags,
    Grade: row.Grade,
    NumberOfQuestions: row.NumberOfQuestions,
    OrganizationId: row.OrganizationId,
    Type: row.Type,
    AgeGroup: row.AgeGroup,
    GameModerator: row.moderatorName
      ? {
          fullName: row.moderatorName,
          Image: row.moderatorImage || "",
        }
      : null,
    StudentsAttended: row.studentsAttended.toString(),
    CompletionRate: row.completionRate.toString(),
    AverageRating: row.averageRating.toString(),
  }));

  return courses as GameDataI[];
};

export const getGameById = async (
  id: string,
  organizationId: string
): Promise<GameDataI | null> => {
  // Create subqueries for stats
  const gameStats = db
    .select({
      GameId: StudentGame.GameId,
      studentsAttended: countDistinct(StudentGame.StudentId).as(
        "students_attended"
      ),
      completionRate: sql<number>`
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN ${StudentGame.Score} >= 50 THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
        END
      `.as("completion_rate"),
    })
    .from(StudentGame)
    .where(eq(StudentGame.GameId, id))
    .groupBy(StudentGame.GameId)
    .as("game_stats");

  const gameRatings = db
    .select({
      GameId: GameReview.GameId,
      avgRating: sql<number>`ROUND(AVG(${GameReview.Rating})::numeric, 2)`.as(
        "avg_rating"
      ),
      totalReviews: count().as("total_reviews"),
    })
    .from(GameReview)
    .where(and(eq(GameReview.GameId, id), eq(GameReview.IsApproved, true)))
    .groupBy(GameReview.GameId)
    .as("game_ratings");

  const gameLikes = db
    .select({
      GameId: GameLike.GameId,
      totalLikes: count().as("total_likes"),
    })
    .from(GameLike)
    .where(eq(GameLike.GameId, id))
    .groupBy(GameLike.GameId)
    .as("game_likes");

  // Main query with all joins
  const result = await db
    .select({
      // Game fields
      Id: Game.Id,
      Title: Game.Title,
      Description: Game.Description,
      Topic: Game.Topic,
      ImageUrl: Game.ImageUrl,
      TutorialVideo: Game.TutorialVideo,
      Subject: Game.Subject,
      Prompt: Game.Prompt,
      Status: Game.Status,
      Duration: Game.Duration,
      PassScore: Game.PassScore,
      Retakes: Game.Retakes,
      Tags: Game.Tags,
      NumberOfQuestions: Game.NumberOfQuestions,
      OrganizationId: Game.OrganizationId,
      Type: Game.Type,
      AgeGroup: Game.AgeGroup,
      CreatedOn: Game.CreatedOn,
      Grade: Game.GameLevel,
      // Stats fields
      moderatorName: User.FullName,
      moderatorImage: User.ImageUrl,
      studentsAttended: sql<number>`COALESCE(${gameStats.studentsAttended}, 0)`,
      completionRate: sql<number>`COALESCE(${gameStats.completionRate}, 0)`,
      averageRating: sql<number>`COALESCE(${gameRatings.avgRating}, 0)`,
      totalLikes: sql<number>`COALESCE(${gameLikes.totalLikes}, 0)`,
    })
    .from(Game)
    .leftJoin(User, eq(User.Id, Game.CreatedBy))
    .leftJoin(gameStats, eq(gameStats.GameId, Game.Id))
    .leftJoin(gameRatings, eq(gameRatings.GameId, Game.Id))
    .leftJoin(gameLikes, eq(gameLikes.GameId, Game.Id))
    .where(and(eq(Game.Id, id), eq(Game.OrganizationId, organizationId)))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  const row = result[0];

  // Transform result to match expected format
  const course = {
    Id: row.Id,
    Title: row.Title,
    Description: row.Description,
    Topic: row.Topic,
    ImageUrl: row.ImageUrl,
    TutorialVideo: row.TutorialVideo,
    Subject: row.Subject,
    Prompt: row.Prompt,
    Status: row.Status,
    Duration: row.Duration,
    PassScore: row.PassScore,
    Retakes: row.Retakes,
    Tags: row.Tags,
    Grade: row.Grade,
    NumberOfQuestions: row.NumberOfQuestions,
    OrganizationId: row.OrganizationId,
    Type: row.Type,
    AgeGroup: row.AgeGroup,
    GameModerator: row.moderatorName
      ? {
          fullName: row.moderatorName,
          Image: row.moderatorImage || "",
        }
      : null,
    StudentsAttended: row.studentsAttended.toString(),
    CompletionRate: row.completionRate.toString(),
    AverageRating: row.averageRating.toString(),
    TotalLikes: row.totalLikes.toString(),
  };

  return course as GameDataI;
};

export const creatGame = async (formData: GameDataI, userId: string) => {
  const result = await db
    .insert(Game)
    .values({ ...formData, CreatedBy: userId, UpdatedBy: userId })
    .returning({
      Id: Game.Id,
    });
  return result;
};

export const updateGame = async (formData: GameDataI, userId: string) => {
  const { Id, ...updateData } = formData;
  if (!Id) {
    throw new Error("Cannot update course without an Id");
  }

  const result = await db
    .update(Game)
    .set({
      ...updateData,
      UpdatedBy: userId,
      UpdatedOn: new Date(),
    })
    .where(eq(Game.Id, Id))
    .returning();

  return result[0];
};
