import { eq, desc, and, gte, sql, countDistinct, inArray } from "drizzle-orm";
import { db } from "../db";
import { StudentGame, User } from "../db/schema";
import { getAge } from "@/utils/functions";
import { KidProfileDataI } from "@/types/Student";

export async function getKidProfileData(
  userId: string
): Promise<Omit<
  KidProfileDataI,
  "weeklyGoal" | "totalXP" | "favoriteSubject" | "badges"
> | null> {
  try {
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get Monday of current week
    const currentWeekStart = new Date(today);
    const dayOfWeek = currentWeekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Sunday of current week
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // 60 days ago for streak
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    sixtyDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all required data in parallel
    const [userInfo, allTimeStats, weeklyStats, todayMinutes, lastGame] =
      await Promise.all([
        // User info
        db
          .select({
            id: User.Id,
            fullName: User.FullName,
            dateOfBirth: User.DateOfBirth,
            imageUrl: User.ImageUrl,
            userNumber: User.UserNumber,
          })
          .from(User)
          .where(eq(User.Id, userId))
          .limit(1),

        // All-time stats
        db
          .select({
            totalStars: sql<number>`COALESCE(SUM(${StudentGame.Stars}), 0)`,
            coursesCompleted: sql<number>`COUNT(DISTINCT CASE WHEN ${StudentGame.Score} > 50 THEN ${StudentGame.GameId} END)`,
            totalCourseAttempts: countDistinct(StudentGame.GameId),
          })
          .from(StudentGame)
          .where(eq(StudentGame.StudentId, userId)),

        // Weekly stats
        db
          .select({
            weeklyCompleted: sql<number>`COUNT(DISTINCT CASE WHEN ${StudentGame.Score} > 50 THEN ${StudentGame.GameId} END)`,
          })
          .from(StudentGame)
          .where(
            and(
              eq(StudentGame.StudentId, userId),
              gte(StudentGame.StartedOn, currentWeekStart.toISOString()),
              sql`${StudentGame.StartedOn} <= ${currentWeekEnd.toISOString()}`
            )
          ),

        // Today's learning minutes
        db
          .select({
            todayMinutes: sql<number>`COALESCE(SUM(
            CASE 
              WHEN ${StudentGame.CompletedOn} IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (${StudentGame.CompletedOn} - ${StudentGame.StartedOn})) / 60
              ELSE 0
            END
          )::INTEGER, 0)`,
          })
          .from(StudentGame)
          .where(
            and(
              eq(StudentGame.StudentId, userId),
              sql`DATE(${StudentGame.StartedOn}) = CURRENT_DATE`
            )
          ),

        // Last game played
        db
          .select({
            startedOn: StudentGame.StartedOn,
            currentStreak: StudentGame.CurrentStreak,
          })
          .from(StudentGame)
          .where(eq(StudentGame.StudentId, userId))
          .orderBy(desc(StudentGame.StartedOn))
          .limit(1)
          .then((rows) => rows[0]),
      ]);

    if (!userInfo.length) return null;

    // Calculate currentStreak using today or yesterday check
    let currentStreak = 0;
    if (lastGame?.startedOn) {
      const lastStarted = new Date(lastGame.startedOn);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastStarted.toDateString() === today.toDateString() ||
        lastStarted.toDateString() === yesterday.toDateString()
      ) {
        currentStreak = lastGame.currentStreak ?? 0;
      }
    }

    // All-time rank
    const rankResult = await db.execute(sql`
      WITH user_total_stars AS (
        SELECT 
          "StudentId",
          COALESCE(SUM("Stars"), 0) AS total_stars
        FROM "StudentGame"
        GROUP BY "StudentId"
      ),
      ranked_users AS (
        SELECT 
          "StudentId",
          RANK() OVER (ORDER BY total_stars DESC) AS rank
        FROM user_total_stars
      )
      SELECT COALESCE(
        (SELECT rank FROM ranked_users WHERE "StudentId" = ${userId}),
        (SELECT COUNT(DISTINCT "StudentId") + 1 FROM user_total_stars)
      ) AS rank
    `);

    const user = userInfo[0];
    const allTimeData = allTimeStats[0] || {
      totalStars: 0,
      coursesCompleted: 0,
      totalCourseAttempts: 0,
    };
    const weeklyData = weeklyStats[0] || { weeklyCompleted: 0 };
    const todayData = todayMinutes[0] || { todayMinutes: 0 };

    const totalStars = Number(allTimeData.totalStars) || 0;
    const level = Math.floor(totalStars / 20) + 1;
    const progressToNextLevel = ((totalStars % 20) / 20) * 100;

    const hasCustomImage = !!user.imageUrl;
    const avatar = hasCustomImage ? "👦🏾" : "👦🏾";
    const avatarType: "emoji" | "custom" = hasCustomImage ? "custom" : "emoji";

    const rank = rankResult.rows[0]?.rank
      ? `#${rankResult.rows[0].rank}`
      : "#1";

    return {
      id: user.id,
      name: user.fullName || "Student",
      age: getAge(user.dateOfBirth ?? ""),
      level,
      totalStars,
      userNumber: user.userNumber || null,
      coursesCompleted: Number(allTimeData.coursesCompleted) || 0,
      currentStreak,
      avatar,
      avatarType,
      customAvatar: user.imageUrl,
      nextReward: level >= 10 ? "Diamond Badge" : "Golden Badge",
      progressToNextLevel: Math.round(progressToNextLevel),
      weeklyCompleted: Number(weeklyData.weeklyCompleted) || 0,
      rank,
      todayMinutes: Number(todayData.todayMinutes) || 0,
      imageUrl: user.imageUrl,
    };
  } catch (error) {
    console.error("Error fetching kid profile data:", error);
    return null;
  }
}

export async function getKidsProfilesData(
  userIds: string[]
): Promise<KidProfileDataI[]> {
  try {
    if (!userIds.length) return [];

    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get Monday of current week for weekly filtering
    const currentWeekStart = new Date(today);
    const dayOfWeek = currentWeekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Get Sunday of current week
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // Query to get all required data for multiple users
    const [usersInfo, allTimeStats, weeklyStats, todayMinutes] =
      await Promise.all([
        // Users basic info
        db
          .select({
            id: User.Id,
            fullName: User.FullName,
            dateOfBirth: User.DateOfBirth,
            imageUrl: User.ImageUrl,
            userNumber: User.UserNumber,
          })
          .from(User)
          .where(inArray(User.Id, userIds)),

        // All-time statistics for all users
        db
          .select({
            studentId: StudentGame.StudentId,
            totalStars: sql<number>`COALESCE(SUM(${StudentGame.Stars}), 0)`,
            coursesCompleted: sql<number>`
            COUNT(DISTINCT CASE WHEN ${StudentGame.Score} > 50 THEN ${StudentGame.GameId} END)
          `,
          })
          .from(StudentGame)
          .where(inArray(StudentGame.StudentId, userIds))
          .groupBy(StudentGame.StudentId),

        // Weekly statistics for all users (Monday to Sunday)
        db
          .select({
            studentId: StudentGame.StudentId,
            weeklyCompleted: sql<number>`
            COUNT(DISTINCT CASE WHEN ${StudentGame.Score} > 50 THEN ${StudentGame.GameId} END)
          `,
          })
          .from(StudentGame)
          .where(
            and(
              inArray(StudentGame.StudentId, userIds),
              gte(StudentGame.StartedOn, currentWeekStart.toISOString()),
              sql`${StudentGame.StartedOn} <= ${currentWeekEnd.toISOString()}`
            )
          )
          .groupBy(StudentGame.StudentId),

        // Today's learning minutes for all users
        db
          .select({
            studentId: StudentGame.StudentId,
            todayMinutes: sql<number>`
            COALESCE(
              SUM(
                CASE 
                  WHEN ${StudentGame.CompletedOn} IS NOT NULL 
                  THEN EXTRACT(EPOCH FROM (${StudentGame.CompletedOn} - ${StudentGame.StartedOn})) / 60
                  ELSE 0
                END
              )::INTEGER,
              0
            )
          `,
          })
          .from(StudentGame)
          .where(
            and(
              inArray(StudentGame.StudentId, userIds),
              sql`DATE(${StudentGame.StartedOn}) = CURRENT_DATE`
            )
          )
          .groupBy(StudentGame.StudentId),
      ]);

    // Create maps for efficient lookup
    const allTimeStatsMap = new Map(
      allTimeStats.map((stat) => [stat.studentId, stat])
    );
    const weeklyStatsMap = new Map(
      weeklyStats.map((stat) => [stat.studentId, stat])
    );
    const todayMinutesMap = new Map(
      todayMinutes.map((stat) => [stat.studentId, stat])
    );

    // Process each user's data
    const profiles: KidProfileDataI[] = usersInfo.map((user) => {
      const allTimeData = allTimeStatsMap.get(user.id) || {
        totalStars: 0,
        coursesCompleted: 0,
      };
      const weeklyData = weeklyStatsMap.get(user.id) || { weeklyCompleted: 0 };
      const todayData = todayMinutesMap.get(user.id) || { todayMinutes: 0 };

      // Calculate level and progress based on all-time total stars
      const totalStars = Number(allTimeData.totalStars) || 0;
      const level = Math.floor(totalStars / 20) + 1;
      const progressToNextLevel = ((totalStars % 20) / 20) * 100;

      // Avatar logic
      const hasCustomImage = !!user.imageUrl;
      const avatar = hasCustomImage ? "👦🏾" : "👦🏾";
      const avatarType: "emoji" | "custom" = hasCustomImage
        ? "custom"
        : "emoji";

      return {
        id: user.id,
        name: user.fullName || "Student",
        age: getAge(user.dateOfBirth ?? ""),
        level,
        totalStars,
        coursesCompleted: Number(allTimeData.coursesCompleted) || 0,
        avatar,
        avatarType,
        customAvatar: user.imageUrl,
        nextReward: level >= 10 ? "Diamond Badge" : "Golden Badge",
        progressToNextLevel: Math.round(progressToNextLevel),
        weeklyCompleted: Number(weeklyData.weeklyCompleted) || 0,
        todayMinutes: Number(todayData.todayMinutes) || 0,
        imageUrl: user.imageUrl,
        userNumber: user.userNumber,
        currentStreak: 0, // Default value, update if you have streak logic
        rank: "#1", // Default value, update if you have rank logic
      };
    });

    return profiles;
  } catch (error) {
    console.error("Error fetching kids profiles data:", error);
    return [];
  }
}
