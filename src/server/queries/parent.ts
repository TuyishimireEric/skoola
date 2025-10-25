import { sql, eq, and, gte, lte, inArray } from "drizzle-orm";
import { db } from "../db";
import { Game, StudentGame, User } from "../db/schema";
import {
  AnalyticsFilter,
} from "@/types/dashboard";

// Updated type for simplified daily progress
type DailyProgressData = {
  [date: string]: {
    [studentName: string]: number; // totalStars
  };
};

// Simplified SubjectPerformance type
type SimplifiedSubjectPerformance = {
  english: number;
  mathematics: number;
  sciences: number;
  studentId: string;
  studentName: string;
};

function getDateRange(filter: AnalyticsFilter): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (filter) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;

    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;

    case "last_month": {
      const year = now.getFullYear();
      const month = now.getMonth(); // current month: 0 (Jan) to 11 (Dec)

      const lastDayOfPrevMonth = new Date(year, month, 0); // e.g., July 31 if now = Aug
      const firstDayOfPrevMonth = new Date(
        lastDayOfPrevMonth.getFullYear(),
        lastDayOfPrevMonth.getMonth(),
        1
      );

      startDate = new Date(
        firstDayOfPrevMonth.getFullYear(),
        firstDayOfPrevMonth.getMonth(),
        1,
        0,
        0,
        0
      );

      endDate = new Date(
        lastDayOfPrevMonth.getFullYear(),
        lastDayOfPrevMonth.getMonth(),
        lastDayOfPrevMonth.getDate(),
        23,
        59,
        59
      );
      return { startDate, endDate };
    }

    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Set start date to beginning of day if not last_month
  startDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0,
    0,
    0
  );
  endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  return { startDate, endDate };
}

/**
 * Helper function to generate all dates in a range
 */
function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]); // YYYY-MM-DD format
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Simplified daily star progress query
 */
export async function getStudentDailyStarProgress(
  studentIds: string[],
  filter: AnalyticsFilter = "7d"
): Promise<DailyProgressData> {
  try {
    if (studentIds.length === 0) return {};

    const { startDate, endDate } = getDateRange(filter);

    // Get all students' information
    const students = await db
      .select({
        studentId: User.Id,
        studentName: User.FullName,
      })
      .from(User)
      .where(inArray(User.Id, studentIds));

    // Generate all dates in range
    const allDates = generateDateRange(startDate, endDate);

    // Get actual data
    const results = await db
      .select({
        date: sql<string>`DATE(${StudentGame.CompletedOn}) as date`,
        studentId: StudentGame.StudentId,
        studentName: User.FullName,
        totalStars: sql<number>`COALESCE(SUM(${StudentGame.Stars}), 0) as total_stars`,
      })
      .from(StudentGame)
      .innerJoin(User, eq(StudentGame.StudentId, User.Id))
      .where(
        and(
          inArray(StudentGame.StudentId, studentIds),
          gte(StudentGame.CompletedOn, startDate.toISOString()),
          lte(StudentGame.CompletedOn, endDate.toISOString()),
          sql`${StudentGame.CompletedOn} IS NOT NULL`
        )
      )
      .groupBy(
        sql`DATE(${StudentGame.CompletedOn})`,
        StudentGame.StudentId,
        User.FullName
      );

    // Initialize complete dataset with zeros
    const dailyProgress: DailyProgressData = {};

    allDates.forEach((date) => {
      dailyProgress[date] = {};
      students.forEach((student) => {
        dailyProgress[date][student.studentName || "Unknown Student"] = 0;
      });
    });

    // Fill in actual data
    results.forEach((row) => {
      if (dailyProgress[row.date] && row.studentName) {
        dailyProgress[row.date][row.studentName] = row.totalStars || 0;
      }
    });

    return dailyProgress;
  } catch (error) {
    console.error("Error in getStudentDailyStarProgress:", error);
    throw new Error(
      `Failed to fetch daily star progress: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Simplified subject performance query
 */
export async function getStudentSubjectPerformance(
  studentIds: string[],
  filter: AnalyticsFilter = "7d"
): Promise<SimplifiedSubjectPerformance[]> {
  try {
    if (studentIds.length === 0) return [];

    const { startDate, endDate } = getDateRange(filter);

    // Get all students' information
    const students = await db
      .select({
        studentId: User.Id,
        studentName: User.FullName,
      })
      .from(User)
      .where(inArray(User.Id, studentIds));

    // Get subject performance data
    const results = await db
      .select({
        studentId: StudentGame.StudentId,
        subject: Game.Subject,
        averageScore: sql<number>`ROUND(AVG(CAST(${StudentGame.Score} AS DECIMAL(10,2))), 2) as avg_score`,
      })
      .from(StudentGame)
      .innerJoin(Game, eq(StudentGame.GameId, Game.Id))
      .where(
        and(
          inArray(StudentGame.StudentId, studentIds),
          gte(StudentGame.CompletedOn, startDate.toISOString()),
          lte(StudentGame.CompletedOn, endDate.toISOString()),
          sql`${StudentGame.CompletedOn} IS NOT NULL`,
          sql`${Game.Subject} IS NOT NULL`
        )
      )
      .groupBy(StudentGame.StudentId, Game.Subject);

    // Create complete dataset for all students with default values
    const subjectPerformance: SimplifiedSubjectPerformance[] = students.map(
      (student) => ({
        english: 0,
        mathematics: 0,
        sciences: 0,
        studentId: student.studentId,
        studentName: student.studentName || "Unknown Student",
      })
    );

    // Create a map for easy lookup
    const performanceMap = new Map<string, SimplifiedSubjectPerformance>();
    subjectPerformance.forEach((perf) => {
      performanceMap.set(perf.studentId, perf);
    });

    // Group scores by student and subject category
    const studentScores = new Map<
      string,
      {
        mathematics: number[];
        english: number[];
        sciences: number[];
      }
    >();

    // Initialize score arrays for each student
    students.forEach((student) => {
      studentScores.set(student.studentId, {
        mathematics: [],
        english: [],
        sciences: [],
      });
    });

    results.forEach((row) => {
      const scores = studentScores.get(row.studentId);
      if (!scores || !row.subject) return;

      const subject = row.subject.toLowerCase().trim();
      const score = row.averageScore || 0;

      if (subject.includes("math")) {
        scores.mathematics.push(score);
      } else if (subject.includes("english") || subject.includes("language")) {
        scores.english.push(score);
      } else if (subject === "sciences") {
        // Only if the subject is strictly "sciences"
        scores.sciences.push(score);
      }
    });

    // Debug: Log what scores we collected
    studentScores.forEach((scores, studentId) => {
      console.log(`Student ${studentId} scores:`, {
        math: scores.mathematics,
        english: scores.english,
        sciences: scores.sciences,
      });
    });

    // Calculate averages for each subject category
    studentScores.forEach((scores, studentId) => {
      const performance = performanceMap.get(studentId);
      if (!performance) return;

      // Calculate average for mathematics
      if (scores.mathematics.length > 0) {
        const avg =
          scores.mathematics.reduce((sum, score) => sum + score, 0) /
          scores.mathematics.length;
        performance.mathematics = Math.round(avg * 100) / 100;
        console.log(
          `Mathematics average for ${studentId}: ${performance.mathematics}`
        );
      }

      // Calculate average for english
      if (scores.english.length > 0) {
        const avg =
          scores.english.reduce((sum, score) => sum + score, 0) /
          scores.english.length;
        performance.english = Math.round(avg * 100) / 100;
        console.log(`English average for ${studentId}: ${performance.english}`);
      }

      // Calculate average for sciences (all other subjects combined)
      if (scores.sciences.length > 0) {
        const avg =
          scores.sciences.reduce((sum, score) => sum + score, 0) /
          scores.sciences.length;
        performance.sciences = Math.round(avg * 100) / 100;
        console.log(
          `Sciences average for ${studentId}: ${performance.sciences}`
        );
      } else {
        console.log(`No sciences scores found for student ${studentId}`);
      }
    });

    return Array.from(performanceMap.values()).sort((a, b) =>
      a.studentName.localeCompare(b.studentName)
    );
  } catch (error) {
    console.error("Error in getStudentSubjectPerformance:", error);
    throw new Error(
      `Failed to fetch subject performance: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getStudentAnalytics(
  studentIds: string[],
  filter: AnalyticsFilter = "7d"
): Promise<{
  dailyProgress: DailyProgressData;
  subjectPerformance: SimplifiedSubjectPerformance[];
}> {
  try {
    if (studentIds.length === 0) {
      return {
        dailyProgress: {},
        subjectPerformance: [],
      };
    }

    const [dailyProgress, subjectPerformance] = await Promise.all([
      getStudentDailyStarProgress(studentIds, filter),
      getStudentSubjectPerformance(studentIds, filter),
    ]);

    return {
      dailyProgress,
      subjectPerformance,
    };
  } catch (error) {
    console.error("Error in getStudentAnalytics:", error);
    throw new Error(
      `Failed to fetch student analytics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
