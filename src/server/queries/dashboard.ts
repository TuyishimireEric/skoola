import { db } from "@/server/db";
import { Game, StudentGame, User } from "@/server/db/schema";
import {
  EnhancedDashboardStatsI,
  DashboardListsI,
  DashboardFiltersI,
} from "@/types/dashboard";
import {
  and,
  desc,
  sql,
  eq,
  countDistinct,
  count,
  gte,
  isNotNull,
} from "drizzle-orm";

// Helper function to get date range filter
const getDateRangeFilter = (dateRange: string) => {
  const now = new Date();
  const startDate = new Date();

  switch (dateRange) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 30);
      break;
    case "3m":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  return startDate;
};

// Helper function to build base filters
const buildBaseFilters = (filters: DashboardFiltersI) => {
  const baseFilters = [eq(Game.OrganizationId, filters.organizationId)];

  if (filters.gradeId && filters.gradeId !== "all") {
    const gradeNumber = parseInt(filters.gradeId.replace("grade-", ""));
    if (!isNaN(gradeNumber)) {
      baseFilters.push(eq(Game.GameLevel, gradeNumber));
    }
  }

  if (filters.subject && filters.subject !== "all") {
    baseFilters.push(eq(Game.Subject, filters.subject));
  }

  return baseFilters;
};

/**
 * Query 1: Enhanced Dashboard Stats
 * Returns: Core stats, trends, daily time spent data
 */
export const getDashboardStats = async (
  filters: DashboardFiltersI,
  trx: typeof db = db
): Promise<EnhancedDashboardStatsI> => {
  const baseFilters = buildBaseFilters(filters);
  const startDate = getDateRangeFilter(filters.dateRange);

  // Use hardcoded role IDs
  const STUDENT_ROLE_ID = 2;
  const TEACHER_ROLE_ID = 3;

  // Build main stats query
  const statsQuery = trx
    .select({
      // Core counts
      totalCourses: countDistinct(Game.Id).as("total_courses"),
      totalStudents: sql<number>`(
        SELECT COUNT(DISTINCT "OrganizationUser"."UserId") 
        FROM "OrganizationUser" 
        WHERE "OrganizationUser"."OrganizationId" = ${filters.organizationId} 
        AND "OrganizationUser"."RoleId" = ${STUDENT_ROLE_ID}
        AND "OrganizationUser"."Status" = 'Active'
      )`.as("total_students"),
      totalTeachers: sql<number>`(
        SELECT COUNT(DISTINCT "OrganizationUser"."UserId") 
        FROM "OrganizationUser" 
        WHERE "OrganizationUser"."OrganizationId" = ${filters.organizationId} 
        AND "OrganizationUser"."RoleId" = ${TEACHER_ROLE_ID}
        AND "OrganizationUser"."Status" = 'Active'
      )`.as("total_teachers"),

      // Score and engagement stats
      averageScore: sql<number>`
        COALESCE(
          (SELECT ROUND(AVG(CAST("StudentGame"."Score" AS NUMERIC)), 2)
           FROM "StudentGame"
           JOIN "Game" ON "Game"."Id" = "StudentGame"."GameId"
           WHERE "Game"."OrganizationId" = ${filters.organizationId}
           AND "StudentGame"."CompletedOn" IS NOT NULL
           AND "StudentGame"."StartedOn" >= ${startDate.toISOString()}
           ${
             filters.gradeId && filters.gradeId !== "all"
               ? sql`AND "Game"."GameLevel" = ${parseInt(
                   filters.gradeId.replace("grade-", "")
                 )}`
               : sql``
           }
           ${
             filters.subject && filters.subject !== "all"
               ? sql`AND "Game"."Subject" = ${filters.subject}`
               : sql``
           }
          ), 0
        )
      `.as("average_score"),

      attendanceRate: sql<number>`
        COALESCE(
          (SELECT ROUND(
            (COUNT(CASE WHEN "StudentGame"."StartedOn" >= ${startDate.toISOString()} THEN 1 END)::numeric / 
             NULLIF(COUNT(*)::numeric, 0)) * 100, 2
          )
           FROM "StudentGame"
           JOIN "Game" ON "Game"."Id" = "StudentGame"."GameId"
           WHERE "Game"."OrganizationId" = ${filters.organizationId}
          ), 0
        )
      `.as("attendance_rate"),

      completionRate: sql<number>`
        COALESCE(
          (SELECT ROUND(
            (COUNT(CASE WHEN "StudentGame"."CompletedOn" IS NOT NULL THEN 1 END)::numeric / 
             NULLIF(COUNT(*)::numeric, 0)) * 100, 2
          )
           FROM "StudentGame"
           JOIN "Game" ON "Game"."Id" = "StudentGame"."GameId"
           WHERE "Game"."OrganizationId" = ${filters.organizationId}
           AND "StudentGame"."StartedOn" >= ${startDate.toISOString()}
          ), 0
        )
      `.as("completion_rate"),

      engagementScore: sql<number>`
        COALESCE(
          (SELECT ROUND(AVG(CAST("StudentGame"."CurrentStreak" AS NUMERIC)), 2)
           FROM "StudentGame"
           JOIN "Game" ON "Game"."Id" = "StudentGame"."GameId"
           WHERE "Game"."OrganizationId" = ${filters.organizationId}
           AND "StudentGame"."StartedOn" >= ${startDate.toISOString()}
          ), 0
        )
      `.as("engagement_score"),

      activeToday: sql<number>`
        (SELECT COUNT(DISTINCT "StudentGame"."StudentId")
         FROM "StudentGame"
         JOIN "Game" ON "Game"."Id" = "StudentGame"."GameId"
         WHERE "Game"."OrganizationId" = ${filters.organizationId}
         AND DATE("StudentGame"."StartedOn") = CURRENT_DATE
        )
      `.as("active_today"),
    })
    .from(Game)
    .where(and(...baseFilters));

  // Get daily time spent data (last 7 days)
  const dailyTimeQuery = trx
    .select({
      date: sql<string>`DATE("StudentGame"."StartedOn")`.as("date"),
      totalMinutes: sql<number>`
        COALESCE(SUM(
          CASE 
            WHEN "StudentGame"."CompletedOn" IS NOT NULL 
            THEN EXTRACT(EPOCH FROM ("StudentGame"."CompletedOn"::timestamp - "StudentGame"."StartedOn"::timestamp))/60
            ELSE 0 
          END
        ), 0)
      `.as("total_minutes"),
    })
    .from(StudentGame)
    .innerJoin(Game, eq(Game.Id, StudentGame.GameId))
    .where(
      and(
        eq(Game.OrganizationId, filters.organizationId),
        gte(
          StudentGame.StartedOn,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
      )
    )
    .groupBy(sql`DATE("StudentGame"."StartedOn")`)
    .orderBy(sql`DATE("StudentGame"."StartedOn")`);

  // Execute queries
  const [statsResult, dailyTimeResult] = await Promise.all([
    statsQuery,
    dailyTimeQuery,
  ]);

  const stats = statsResult[0] || {
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    averageScore: 0,
    attendanceRate: 0,
    completionRate: 0,
    engagementScore: 0,
    activeToday: 0,
  };

  // Format daily time spent
  const dailyTimeSpent = dailyTimeResult.map(
    (row) => `${row.date}:${Math.round(row.totalMinutes)}`
  );

  // Calculate trends (mock for now - you can implement actual trend calculation)
  const trends: EnhancedDashboardStatsI["trends"] = {
    courses: { direction: "up", value: 12 },
    teachers: { direction: "up", value: 8 },
    students: { direction: "up", value: 15 },
    scores: { direction: "up", value: 5 },
  };

  return {
    totalCourses: Number(stats.totalCourses),
    totalTeachers: Number(stats.totalTeachers),
    totalStudents: Number(stats.totalStudents),
    averageScore: stats.averageScore.toString(),
    attendanceRate: Number(stats.attendanceRate),
    completionRate: Number(stats.completionRate),
    engagementScore: Number(stats.engagementScore),
    activeToday: Number(stats.activeToday),
    dailyTimeSpent,
    trends,
  };
};

/**
 * Query 2: Dashboard Lists
 * Returns: All dynamic lists, charts, rankings, activities
 */
export const getDashboardLists = async (
  filters: DashboardFiltersI,
  trx: typeof db = db
): Promise<DashboardListsI> => {
  const startDate = getDateRangeFilter(filters.dateRange);

  // Student Rankings Query - Enhanced to properly calculate total stars
  const studentRankingsQuery = trx
    .select({
      studentId: User.Id,
      name: User.FullName,
      avatar: User.ImageUrl,
      points: sql<number>`
        COALESCE(SUM(CAST("StudentGame"."Stars" AS NUMERIC)), 0)
      `.as("points"),
      gamesPlayed: count(StudentGame.Id).as("games_played"),
      averageScore: sql<number>`
        ROUND(AVG(CAST("StudentGame"."Score" AS NUMERIC)), 2)
      `.as("average_score"),
    })
    .from(User)
    .innerJoin(StudentGame, eq(StudentGame.StudentId, User.Id))
    .innerJoin(Game, eq(Game.Id, StudentGame.GameId))
    .where(
      and(
        eq(Game.OrganizationId, filters.organizationId),
        isNotNull(StudentGame.CompletedOn),
        gte(StudentGame.StartedOn, startDate.toISOString()),
        ...(filters.gradeId && filters.gradeId !== "all"
          ? [
              eq(
                Game.GameLevel,
                parseInt(filters.gradeId.replace("grade-", ""))
              ),
            ]
          : []),
        ...(filters.subject && filters.subject !== "all"
          ? [eq(Game.Subject, filters.subject)]
          : [])
      )
    )
    .groupBy(User.Id, User.FullName, User.ImageUrl)
    .orderBy(desc(sql`points`))
    .limit(10);

  // Performance Alerts Query - Enhanced to calculate students with <30% average after 3+ games
  const performanceAlertsQuery = trx
    .select({
      type: sql<string>`'warning'`.as("type"),
      message: sql<string>`'Students need attention'`.as("message"),
      count: sql<number>`
        (SELECT COUNT(*)
         FROM (
           SELECT "StudentGame"."StudentId"
           FROM "StudentGame"
           JOIN "Game" ON "Game"."Id" = "StudentGame"."GameId"
           WHERE "Game"."OrganizationId" = ${filters.organizationId}
           AND "StudentGame"."CompletedOn" IS NOT NULL
           AND "StudentGame"."StartedOn" >= ${startDate.toISOString()}
           ${
             filters.gradeId && filters.gradeId !== "all"
               ? sql`AND "Game"."GameLevel" = ${parseInt(
                   filters.gradeId.replace("grade-", "")
                 )}`
               : sql``
           }
           ${
             filters.subject && filters.subject !== "all"
               ? sql`AND "Game"."Subject" = ${filters.subject}`
               : sql``
           }
           GROUP BY "StudentGame"."StudentId"
           HAVING COUNT(*) >= 3
           AND AVG(CAST("StudentGame"."Score" AS NUMERIC)) < 30
         ) AS struggling_students)
      `.as("count"),
      iconType: sql<string>`'AlertTriangle'`.as("icon_type"),
    })
    .from(sql`(SELECT 1) AS dummy`);

  // Best Performance Query
  const bestPerformanceQuery = trx
    .select({
      subjectName: Game.Subject,
      averageScore:
        sql<number>`ROUND(AVG(CAST("StudentGame"."Score" AS NUMERIC)), 2)`.as(
          "average_score"
        ),
      totalStudents: countDistinct(StudentGame.StudentId).as("total_students"),
      icon: sql<string>`
        CASE 
          WHEN "Game"."Subject" = 'Mathematics' THEN '🧮'
          WHEN "Game"."Subject" = 'Science' THEN '🔬'
          WHEN "Game"."Subject" = 'English' THEN '📚'
          ELSE '📖'
        END
      `.as("icon"),
    })
    .from(Game)
    .innerJoin(StudentGame, eq(StudentGame.GameId, Game.Id))
    .where(
      and(
        eq(Game.OrganizationId, filters.organizationId),
        isNotNull(StudentGame.CompletedOn),
        gte(StudentGame.StartedOn, startDate.toISOString())
      )
    )
    .groupBy(Game.Subject)
    .having(sql`COUNT(*) > 0`)
    .orderBy(desc(sql`average_score`))
    .limit(5);

  // Grade Performance Query (for pie chart)
  const gradePerformanceQuery = trx
    .select({
      gradeName: sql<string>`CONCAT('Grade ', "Game"."GameLevel")`.as(
        "grade_name"
      ),
      gradeNumber: Game.GameLevel,
      studentCount: countDistinct(StudentGame.StudentId).as("student_count"),
    })
    .from(Game)
    .innerJoin(StudentGame, eq(StudentGame.GameId, Game.Id))
    .where(
      and(
        eq(Game.OrganizationId, filters.organizationId),
        gte(StudentGame.StartedOn, startDate.toISOString())
      )
    )
    .groupBy(Game.GameLevel)
    .orderBy(Game.GameLevel);

  // Improvement Areas Query - Find subjects/skills with low performance
  const improvementAreasQuery = trx
    .select({
      skillName: Game.Subject,
      accuracy:
        sql<number>`ROUND(AVG(CAST("StudentGame"."Score" AS NUMERIC)), 2)`.as(
          "accuracy"
        ),
      exerciseCount: count(StudentGame.Id).as("exercise_count"),
      studentCount: countDistinct(StudentGame.StudentId).as("student_count"),
    })
    .from(Game)
    .innerJoin(StudentGame, eq(StudentGame.GameId, Game.Id))
    .where(
      and(
        eq(Game.OrganizationId, filters.organizationId),
        isNotNull(StudentGame.CompletedOn),
        gte(StudentGame.StartedOn, startDate.toISOString()),
        sql`CAST("StudentGame"."Score" AS NUMERIC) < 75` // Low performance threshold
      )
    )
    .groupBy(Game.Subject)
    .having(sql`COUNT(*) >= 3`) // At least 3 attempts to be significant
    .orderBy(sql`accuracy`)
    .limit(5);

  // Execute all queries in parallel
  const [
    studentRankings,
    performanceAlerts,
    bestPerformance,
    gradePerformance,
    improvementAreas,
  ] = await Promise.all([
    studentRankingsQuery,
    performanceAlertsQuery,
    bestPerformanceQuery,
    gradePerformanceQuery,
    improvementAreasQuery,
  ]);

  // Process grade performance for pie chart
  const totalStudentsInGrades = gradePerformance.reduce(
    (sum, grade) => sum + Number(grade.studentCount),
    0
  );
  const gradePerformanceData = gradePerformance.map((grade, index) => ({
    gradeName: grade.gradeName || `Grade ${grade.gradeNumber}`,
    gradeNumber: Number(grade.gradeNumber),
    studentCount: Number(grade.studentCount),
    percentage:
      totalStudentsInGrades > 0
        ? Math.round((Number(grade.studentCount) / totalStudentsInGrades) * 100)
        : 0,
    color: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"][
      index % 6
    ],
  }));

  // Transform and return data
  return {
    performanceAlerts: performanceAlerts.map((alert) => ({
      type: alert.type as "warning" | "success" | "info" | "danger",
      message: alert.message,
      count: Number(alert.count),
      iconType: alert.iconType,
    })),

    gradePerformance: gradePerformanceData,

    studentRanking: studentRankings.slice(0, 10).map((student, index) => ({
      studentId: student.studentId,
      name: student.name || "Unknown",
      points: Number(student.points),
      avatar: student.avatar ?? "",
      rank: index + 1,
    })),

    bestPerformance: bestPerformance.slice(0, 10).map((perf) => ({
      subjectName: perf.subjectName || "Unknown",
      averageScore: Number(perf.averageScore),
      icon: perf.icon,
      totalStudents: Number(perf.totalStudents),
    })),

    improvementAreas: improvementAreas.map((area) => ({
      skillName: area.skillName || "Unknown",
      accuracy: Number(area.accuracy),
      exerciseCount: Number(area.exerciseCount),
      studentCount: Number(area.studentCount),
    })),
  };
};
