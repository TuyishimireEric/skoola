import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { Game, DailyRecommendation, StudentGame } from "../db/schema";
import { db } from "../db";
import { getAge } from "@/utils/functions";
import { RecommendedCourseI, RecommendedCourseResultI } from "@/types/Course";

/**
 * Build SQL condition for age group filtering with proper validation
 */
function buildAgeGroupCondition(age: number) {
  // Validate age input
  if (isNaN(age) || age < 0 || age > 150) {
    console.warn(`Invalid age provided: ${age}, defaulting to no age filter`);
    return sql`1=1`; // Return a condition that's always true
  }

  return sql`(
    ${Game.AgeGroup} IS NOT NULL AND (
      (${Game.AgeGroup} LIKE '%-%' AND 
       ${age} >= CASE 
         WHEN SPLIT_PART(${Game.AgeGroup}, '-', 1) ~ '^[0-9]+$' 
         THEN CAST(SPLIT_PART(${Game.AgeGroup}, '-', 1) AS INTEGER)
         ELSE 0
       END AND 
       ${age} <= CASE 
         WHEN SPLIT_PART(${Game.AgeGroup}, '-', 2) ~ '^[0-9]+$' 
         THEN CAST(SPLIT_PART(${Game.AgeGroup}, '-', 2) AS INTEGER)
         ELSE 999
       END)
    )
  )`;
}

/**
 * Sort recommendations by title only
 */
function sortRecommendations(recommendations: RecommendedCourseI[]): RecommendedCourseI[] {
  return recommendations.sort((a, b) => {
    // Sort by title (case-insensitive with numeric sorting)
    return a.title.localeCompare(b.title, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  });
}

/**
 * Get the start of the next day (when current recommendations should expire)
 */
function getNextDayStart(): Date {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0); // Start of next day (00:00:00)
  return nextDay;
}

export async function generateDailyRecommendations(
  studentId: string,
  organizationId: string,
  dateOfBirth: string
): Promise<RecommendedCourseI[]> {
  const age = getAge(dateOfBirth);
  
  // Validate age
  if (isNaN(age) || age < 0 || age > 150) {
    console.warn(`Invalid age calculated from dateOfBirth: ${dateOfBirth}, age: ${age}`);
    // Continue with a safe default or handle gracefully
  }

  const usedGameIds = new Set<string>();
  const recommendations: RecommendedCourseI[] = [];

  // Set expiration to start of next day (00:00:00)
  const nextDayStart = getNextDayStart();

  const finalRecommendations = await db.transaction(async (trx) => {
    // Step 1: Get up to 2 courses with low scores (below 70%) - sorted by difficulty
    const lowScoreCourses = await trx
      .select({
        GameId: Game.Id,
        title: Game.Title,
        estimatedTime:
          sql<string>`COALESCE(${Game.Duration}::text || ' min', '15 min')`.as(
            "estimatedTime"
          ),
        subject: Game.Subject,
        emoji: Game.Emoji,
        score: StudentGame.Score,
      })
      .from(StudentGame)
      .innerJoin(Game, eq(StudentGame.GameId, Game.Id))
      .where(
        and(
          eq(StudentGame.StudentId, studentId),
          eq(Game.OrganizationId, organizationId),
          buildAgeGroupCondition(age),
          eq(Game.Status, "Published"),
          lt(StudentGame.Score, "70")
        )
      )
      .orderBy(asc(StudentGame.Score))
      .limit(2);

    // Add low score courses to recommendations
    lowScoreCourses.forEach((course) => {
      if (!usedGameIds.has(course.GameId)) {
        usedGameIds.add(course.GameId);
        recommendations.push({
          id: recommendations.length + 1,
          GameId: course.GameId,
          title: course.title,
          difficulty: "Medium",
          estimatedTime: course.estimatedTime,
          subject: course.subject || "General",
          emoji: course.emoji || "📚",
        });
      }
    });

    console.log(`Found ${lowScoreCourses.length} low score courses`);

    // Step 2: Get up to 2 courses not studied recently (excluding already added courses)
    const notRecentlyStudiedCourses = await trx
      .select({
        GameId: Game.Id,
        title: Game.Title,
        estimatedTime:
          sql<string>`COALESCE(${Game.Duration}::text || ' min', '15 min')`.as(
            "estimatedTime"
          ),
        subject: Game.Subject,
        emoji: Game.Emoji,
        score: sql<string>`AVG(${StudentGame.Score}::numeric)`.as("avgScore"),
        lastCompleted: sql<Date>`MAX(${StudentGame.CompletedOn})`.as(
          "lastCompleted"
        ),
      })
      .from(StudentGame)
      .innerJoin(Game, eq(StudentGame.GameId, Game.Id))
      .where(
        and(
          eq(StudentGame.StudentId, studentId),
          eq(Game.OrganizationId, organizationId),
          buildAgeGroupCondition(age),
          eq(Game.Status, "Published"),
          // Exclude courses already in recommendations
          usedGameIds.size > 0
            ? sql`${Game.Id} NOT IN (${sql.join(
                Array.from(usedGameIds).map((id) => sql`${id}`),
                sql`, `
              )})`
            : sql`1=1`
        )
      )
      .groupBy(Game.Id, Game.Title, Game.Duration, Game.Subject, Game.Emoji)
      .orderBy(sql`MAX(${StudentGame.CompletedOn}) ASC NULLS FIRST`)
      .limit(2);

    // Add not recently studied courses to recommendations
    notRecentlyStudiedCourses.forEach((course) => {
      if (!usedGameIds.has(course.GameId) && recommendations.length < 6) {
        usedGameIds.add(course.GameId);
        recommendations.push({
          id: recommendations.length + 1,
          GameId: course.GameId,
          title: course.title,
          difficulty: "Medium",
          estimatedTime: course.estimatedTime,
          subject: course.subject || "General",
          emoji: course.emoji || "📚",
        });
      }
    });

    console.log(`Found ${notRecentlyStudiedCourses.length} not recently studied courses`);

    // Step 3: Fill remaining slots with new courses (never attempted)
    const currentCount = recommendations.length;
    const newCoursesNeeded = 6 - currentCount;

    console.log(`Need ${newCoursesNeeded} new courses to reach 6 total`);

    if (newCoursesNeeded > 0) {
      // Get all course IDs the student has attempted to exclude them
      const attemptedGameIds = await trx
        .selectDistinct({
          GameId: StudentGame.GameId,
        })
        .from(StudentGame)
        .where(eq(StudentGame.StudentId, studentId));

      const attemptedIds = attemptedGameIds.map((c) => c.GameId);
      const allExcludedIds = [...Array.from(usedGameIds), ...attemptedIds];

      // Get new courses (never attempted by student)
      const newCourses = await trx
        .select({
          GameId: Game.Id,
          title: Game.Title,
          estimatedTime:
            sql<string>`COALESCE(${Game.Duration}::text || ' min', '15 min')`.as(
              "estimatedTime"
            ),
          subject: Game.Subject,
          emoji: Game.Emoji,
        })
        .from(Game)
        .where(
          and(
            eq(Game.OrganizationId, organizationId),
            buildAgeGroupCondition(age),
            eq(Game.Status, "Published"),
            // Exclude courses already in recommendations and attempted courses
            allExcludedIds.length > 0
              ? sql`${Game.Id} NOT IN (${sql.join(
                  allExcludedIds.map((id) => sql`${id}`),
                  sql`, `
                )})`
              : sql`1=1`
          )
        )
        .orderBy(asc(Game.Title)) // Sort by title for consistent ordering
        .limit(newCoursesNeeded);

      // Add new courses to recommendations
      newCourses.forEach((course) => {
        if (!usedGameIds.has(course.GameId) && recommendations.length < 6) {
          usedGameIds.add(course.GameId);
          recommendations.push({
            id: recommendations.length + 1,
            GameId: course.GameId,
            title: course.title,
            difficulty: "Medium",
            estimatedTime: course.estimatedTime,
            subject: course.subject || "General",
            emoji: course.emoji || "📚",
          });
        }
      });

      console.log(`Found ${newCourses.length} new courses`);
    }

    // Step 4: If we still don't have 6 courses, fill with any available courses
    if (recommendations.length < 6) {
      const stillNeeded = 6 - recommendations.length;
      console.log(`Still need ${stillNeeded} more courses, filling with any available`);

      const anyCourses = await trx
        .select({
          GameId: Game.Id,
          title: Game.Title,
          estimatedTime:
            sql<string>`COALESCE(${Game.Duration}::text || ' min', '15 min')`.as(
              "estimatedTime"
            ),
          subject: Game.Subject,
          emoji: Game.Emoji,
        })
        .from(Game)
        .where(
          and(
            eq(Game.OrganizationId, organizationId),
            buildAgeGroupCondition(age),
            eq(Game.Status, "Published"),
            // Exclude only courses already in recommendations
            usedGameIds.size > 0
              ? sql`${Game.Id} NOT IN (${sql.join(
                  Array.from(usedGameIds).map((id) => sql`${id}`),
                  sql`, `
                )})`
              : sql`1=1`
          )
        )
        .orderBy(asc(Game.Title)) // Sort by title for consistent ordering
        .limit(stillNeeded);

      // Add any available courses to reach 6
      anyCourses.forEach((course) => {
        if (!usedGameIds.has(course.GameId) && recommendations.length < 6) {
          usedGameIds.add(course.GameId);
          recommendations.push({
            id: recommendations.length + 1,
            GameId: course.GameId,
            title: course.title,
            difficulty: "Medium",
            estimatedTime: course.estimatedTime,
            subject: course.subject || "General",
            emoji: course.emoji || "📚",
          });
        }
      });

      console.log(`Added ${anyCourses.length} additional courses`);
    }

    // Step 5: Sort recommendations by title only
    const sortedRecommendations = sortRecommendations(recommendations);

    // Ensure exactly 6 recommendations and update IDs
    const finalRecs = sortedRecommendations.slice(0, 6).map((rec, index) => ({
      ...rec,
      id: index + 1,
    }));

    // If we still don't have 6 recommendations, pad with empty slots or handle gracefully
    while (finalRecs.length < 6) {
      // This should rarely happen, but let's handle it gracefully
      finalRecs.push({
        id: finalRecs.length + 1,
        GameId: `placeholder-${finalRecs.length}`,
        title: "No Course Available",
        difficulty: "Medium",
        estimatedTime: "15 min",
        subject: "General",
        emoji: "📚",
      });
    }

    console.log(`Final recommendations count: ${finalRecs.length}`);
    console.log(`Recommendations will expire at: ${nextDayStart.toISOString()}`);

    // Store only valid course IDs in the database (exclude placeholders)
    const validGameIds = finalRecs
      .filter(rec => !rec.GameId.startsWith('placeholder-'))
      .map(rec => rec.GameId);

    await trx.insert(DailyRecommendation).values({
      StudentId: studentId,
      Recommendations: validGameIds,
      ExpiresOn: nextDayStart,
    });

    return finalRecs;
  });

  return finalRecommendations;
}

interface DailyRecommendationProps {
  studentId: string;
  organizationId: string;
  dateOfBirth: string;
}

export async function getOrGenerateDailyRecommendations({
  studentId,
  organizationId,
  dateOfBirth,
}: DailyRecommendationProps): Promise<RecommendedCourseI[]> {
  const now = new Date();

  // Check if we already have valid recommendations that haven't expired
  const existingRecs = await db
    .select({
      Id: DailyRecommendation.Id,
      recommendations: DailyRecommendation.Recommendations,
      createdOn: DailyRecommendation.CreatedOn,
      expiresOn: DailyRecommendation.ExpiresOn,
    })
    .from(DailyRecommendation)
    .where(
      and(
        eq(DailyRecommendation.StudentId, studentId),
        gt(DailyRecommendation.ExpiresOn, now) // Only get non-expired recommendations
      )
    )
    .orderBy(desc(DailyRecommendation.CreatedOn))
    .limit(1);

  // If we have valid non-expired recommendations, fetch the course details
  if (existingRecs.length > 0) {
    const GameIds = existingRecs[0].recommendations as string[];

    console.log(`Found existing recommendations, expires at: ${existingRecs[0].expiresOn}`);

    if (GameIds.length === 0) {
      // If no course IDs stored, generate new recommendations
      return generateDailyRecommendations(studentId, organizationId, dateOfBirth);
    }

    const courseDetails = await db
      .select({
        GameId: Game.Id,
        title: Game.Title,
        estimatedTime:
          sql<string>`COALESCE(${Game.Duration}::text || ' min', '15 min')`.as(
            "estimatedTime"
          ),
        subject: Game.Subject,
        emoji: Game.Emoji,
      })
      .from(Game)
      .where(
        and(
          sql`${Game.Id} IN (${sql.join(
            GameIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
          eq(Game.Status, "Published")
        )
      );

    // Create recommendations with consistent difficulty
    const recommendations = courseDetails.map((course) => ({
      id: 0, // Will be set later
      GameId: course.GameId,
      title: course.title,
      difficulty: "Medium" as const,
      estimatedTime: course.estimatedTime,
      subject: course.subject || "General",
      emoji: course.emoji || "📚",
    }));

    // Sort recommendations by title only
    const sortedRecommendations = sortRecommendations(recommendations);

    // Ensure exactly 6 recommendations and update IDs
    const finalRecs = sortedRecommendations.slice(0, 6).map((rec, index) => ({
      ...rec,
      id: index + 1,
    }));

    // Pad if needed (shouldn't happen with existing recommendations)
    while (finalRecs.length < 6) {
      finalRecs.push({
        id: finalRecs.length + 1,
        GameId: `placeholder-${finalRecs.length}`,
        title: "No Course Available",
        difficulty: "Medium",
        estimatedTime: "15 min",
        subject: "General",
        emoji: "📚",
      });
    }

    return finalRecs;
  }

  // Otherwise, generate new recommendations
  console.log("No valid recommendations found, generating new ones");
  return generateDailyRecommendations(studentId, organizationId, dateOfBirth);
}

export const updateStudentRecommendations = async (
  recommendationId: string,
  GameIds: string[]
): Promise<void> => {
  // Ensure no duplicates in the update
  const uniqueGameIds = [...new Set(GameIds)];

  console.log("Updating recommendations with course IDs:", uniqueGameIds);

  const result = await db
    .update(DailyRecommendation)
    .set({
      Recommendations: uniqueGameIds,
    })
    .where(eq(DailyRecommendation.Id, recommendationId));

  console.log("Update result:", result);
};

// Helper function to check if recommendations are expired
export const areRecommendationsExpired = (expiresOn: Date): boolean => {
  return new Date() >= expiresOn;
};

// Helper function to get time until expiration
export const getTimeUntilExpiration = (expiresOn: Date): string => {
  const now = new Date();
  const timeDiff = expiresOn.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return "Expired";
  }

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export async function getTodayCompletedCourseSections(
  userId: string,
  recommendedGameIds: string[]
): Promise<RecommendedCourseResultI[]> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid userId provided");
    }

    if (!Array.isArray(recommendedGameIds)) {
      console.log("Invalid recommended course IDs provided");
      return [];
    }

    // Filter out invalid course IDs
    const validGameIds = recommendedGameIds.filter(
      (id) => typeof id === "string" && !!id
    );

    if (validGameIds.length === 0) {
      console.log("No valid course IDs found");
      return [];
    }

    // Get start and end of today for filtering
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayISO = startOfToday.toISOString();

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const endOfTodayISO = endOfToday.toISOString();

    // First get all completions today
    const todayCompletions = await db
      .select({
        GameId: StudentGame.GameId,
        stars: StudentGame.Stars,
        completedOn: StudentGame.CompletedOn,
        startedOn: StudentGame.StartedOn,
      })
      .from(StudentGame)
      .where(
        and(
          eq(StudentGame.StudentId, userId),
          inArray(StudentGame.GameId, validGameIds),
          or(
            gte(StudentGame.Stars, 1),
            sql`${StudentGame.Score}::numeric >= 50`
          ),
          gte(StudentGame.CompletedOn, startOfTodayISO),
          lte(StudentGame.CompletedOn, endOfTodayISO)
        )
      );

    // Process in JavaScript to get most recent per course
    const latestCompletions = todayCompletions.reduce((acc, course) => {
      const existing = acc.get(course.GameId);
      if (
        !existing ||
        (course.completedOn &&
          existing?.completedOn &&
          new Date(course.completedOn) > new Date(existing.completedOn)) ||
        (course.completedOn === existing?.completedOn &&
          course.startedOn &&
          existing?.startedOn &&
          new Date(course.startedOn) > new Date(existing.startedOn))
      ) {
        acc.set(course.GameId, {
          ...course,
          stars: course.stars ?? 0,
          completedOn: course.completedOn ?? undefined,
          startedOn: course.startedOn ?? undefined,
        });
      }
      return acc;
    }, new Map<string, { GameId: string; stars: number; completedOn?: string; startedOn?: string }>());

    // Generate the result array with all recommended courses
    const result = validGameIds.map((GameId) => ({
      GameId,
      stars: latestCompletions.get(GameId)?.stars ?? 0,
    }));

    // Logging for debugging
    const completedCount = latestCompletions.size;
    if (completedCount > 0) {
      console.log(
        `Found ${completedCount} courses completed today:`,
        Array.from(latestCompletions.values())
          .map((c) => `${c.GameId} (${c.stars} stars)`)
          .join(", ")
      );
    } else {
      console.log("No courses completed today");
    }

    return result;
  } catch (error) {
    console.error("Error in getTodayCompletedCourseSections:", error);
    throw new Error(
      `Failed to fetch today's completed course sections: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}