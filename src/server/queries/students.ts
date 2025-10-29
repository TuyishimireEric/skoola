import { db } from "@/server/db";
import { User, OrganizationUser, ParentStudent, Attendance, CoursePerformance } from "@/server/db/schema";
import { getAge } from "@/utils/functions";
import { eq, and, sql, ilike, or, desc, asc } from "drizzle-orm";

// Define sortable columns as a const assertion for type inference
const SortableColumn = {
  fullName: "fullName",
  email: "email",
  createdOn: "createdOn",
  stars: "stars",
  averageScore: "averageScore",
  totalCourses: "totalCourses",
  currentStreak: "currentStreak",
  attendanceRate: "attendanceRate",
  performanceScore: "performanceScore",
} as const;

// Create a type from the const object
type SortableColumn = (typeof SortableColumn)[keyof typeof SortableColumn];

interface StudentListParams {
  page: number;
  pageSize: number;
  searchText: string;
  organizationId: string;
  sortColumn: SortableColumn;
  sortOrder: string;
  activeOnly: boolean;
  grade: string | null;
}

export interface StudentListResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  grade: string;
  avatar: string;
  stars: number;
  lastActivity: string;
  status: string;
  email: string;
  parent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    relationship: string;
  } | null;
  averageScore: number;
  totalCourses: number;
  userName: string;
  currentStreak: number;
  attendanceRate: number;
  performanceScore: number;
}

// Define the shape of raw student data from database
interface RawStudentData {
  id: string;
  fullName: string;
  email: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
  status: "Active" | "Inactive" | "Pending" | "Suspended" | null;
  grade: string | null;
  userNumber: number | null;
  parentId: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  parentRelationship: string | null;
  totalStars: number;
  totalCourses: number;
  currentStreak: number;
  lastActivity: string;
  avgScore: number;
  attendanceRate: number | null;
  performanceScore: number | null;
}

export async function getStudentList(params: StudentListParams): Promise<{
  students: StudentListResponse[];
  totalCount: number;
  totalPages: number;
}> {
  const {
    page,
    pageSize,
    searchText,
    organizationId,
    sortColumn,
    sortOrder,
    activeOnly,
    grade,
  } = params;

  const offset = (page - 1) * pageSize;

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Build WHERE conditions with grade filter
  const whereConditions = and(
    eq(OrganizationUser.OrganizationId, organizationId),
    eq(OrganizationUser.RoleId, 2), // Student role
    activeOnly ? eq(OrganizationUser.Status, "Active") : undefined,
    grade ? eq(OrganizationUser.Grade, grade) : undefined,
    searchText
      ? or(
        ilike(User.FullName, `%${searchText}%`),
        ilike(User.Email, `%${searchText}%`),
        sql`parent_user."FullName" ILIKE ${`%${searchText}%`}`,
        sql`parent_user."Email" ILIKE ${`%${searchText}%`}`
      )
      : undefined
  );

  // Get total count for pagination
  const totalCountResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(User)
    .innerJoin(OrganizationUser, eq(User.Id, OrganizationUser.UserId))
    .leftJoin(ParentStudent, eq(User.Id, ParentStudent.StudentId))
    .leftJoin(
      sql`"User" as parent_user`,
      sql`"ParentStudent"."ParentId" = parent_user."Id"`
    )
    .where(whereConditions);

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Main optimized query with attendance and performance data
  const studentsQuery = db
    .select({
      id: User.Id,
      fullName: User.FullName,
      email: User.Email,
      dateOfBirth: User.DateOfBirth,
      avatar: User.ImageUrl,
      status: OrganizationUser.Status,
      grade: OrganizationUser.Grade,
      userNumber: User.UserNumber,
      parentId: sql<string | null>`parent_user."Id"`,
      parentName: sql<string | null>`parent_user."FullName"`,
      parentEmail: sql<string | null>`parent_user."Email"`,
      parentPhone: sql<string | null>`parent_user."Phone"`,
      parentRelationship: sql<string | null>`"ParentStudent"."Relationship"`,
      totalStars: sql<number>`COALESCE(game_stats.total_stars, 0)`,
      totalCourses: sql<number>`COALESCE(game_stats.total_courses, 0)`,
      currentStreak: sql<number>`COALESCE(today_streak.current_streak, 0)`,
      lastActivity: sql<string>`COALESCE(game_stats.last_activity, ${User.CreatedOn})`,
      avgScore: sql<number>`COALESCE(game_stats.avg_score, 0)`,
      attendanceRate: sql<number | null>`attendance_stats.attendance_rate`,
      performanceScore: sql<number | null>`performance_stats.avg_performance`,
    })
    .from(User)
    .innerJoin(OrganizationUser, eq(User.Id, OrganizationUser.UserId))
    .leftJoin(
      // Game statistics subquery
      sql`(
        SELECT 
          sg."StudentId",
          COALESCE(SUM(sg."Stars"), 0) as total_stars,
          COUNT(DISTINCT sg."GameId") as total_courses,
          MAX(sg."CompletedOn") as last_activity,
          COALESCE(AVG(CAST(sg."Score" AS DECIMAL)), 0) as avg_score
        FROM "StudentGame" sg
        INNER JOIN "OrganizationUser" ou ON sg."StudentId" = ou."UserId"
        WHERE ou."OrganizationId" = ${organizationId}
          ${grade ? sql`AND ou."Grade" = ${grade}` : sql``}
        GROUP BY sg."StudentId"
      ) as game_stats`,
      sql`"User"."Id" = game_stats."StudentId"`
    )
    .leftJoin(
      // Today's streak subquery
      sql`(
        SELECT 
          sg."StudentId",
          COALESCE(MAX(sg."CurrentStreak"), 0) as current_streak
        FROM "StudentGame" sg
        INNER JOIN "OrganizationUser" ou ON sg."StudentId" = ou."UserId"
        WHERE ou."OrganizationId" = ${organizationId}
          ${grade ? sql`AND ou."Grade" = ${grade}` : sql``}
          AND sg."CompletedOn" >= ${todayISO}
          AND sg."CompletedOn" IS NOT NULL
        GROUP BY sg."StudentId"
      ) as today_streak`,
      sql`"User"."Id" = today_streak."StudentId"`
    )
    .leftJoin(
      // Attendance statistics subquery - returns NULL if no records
      sql`(
        SELECT 
          a."StudentId",
          CASE 
            WHEN COUNT(*) > 0 THEN
              ROUND(
                (COUNT(CASE WHEN a."Status" IN ('present', 'late') THEN 1 END)::NUMERIC / 
                NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
                2
              )
            ELSE NULL
          END as attendance_rate
        FROM "Attendance" a
        WHERE a."OrganizationId" = ${organizationId}
        GROUP BY a."StudentId"
        HAVING COUNT(*) > 0
      ) as attendance_stats`,
      sql`"User"."Id" = attendance_stats."StudentId"`
    )
    .leftJoin(
      // Course Performance statistics subquery - returns NULL if no records
      sql`(
        SELECT 
          cp."StudentId",
          ROUND(
            AVG(
              CASE 
                -- Calculate total weight of completed assessments
                WHEN (
                  CASE WHEN CAST(cp."Assignment1" AS TEXT) IS NOT NULL AND CAST(cp."Assignment1" AS TEXT) != '' THEN 0.1 ELSE 0 END +
                  CASE WHEN CAST(cp."Assignment2" AS TEXT) IS NOT NULL AND CAST(cp."Assignment2" AS TEXT) != '' THEN 0.1 ELSE 0 END +
                  CASE WHEN CAST(cp."CAT" AS TEXT) IS NOT NULL AND CAST(cp."CAT" AS TEXT) != '' THEN 0.4 ELSE 0 END +
                  CASE WHEN CAST(cp."Exam" AS TEXT) IS NOT NULL AND CAST(cp."Exam" AS TEXT) != '' THEN 0.4 ELSE 0 END
                ) > 0 THEN
                  -- Calculate weighted sum and normalize to 100
                  (
                    (
                      CASE WHEN CAST(cp."Assignment1" AS TEXT) IS NOT NULL AND CAST(cp."Assignment1" AS TEXT) != '' 
                      THEN CAST(cp."Assignment1" AS NUMERIC) * 0.1 ELSE 0 END +
                      CASE WHEN CAST(cp."Assignment2" AS TEXT) IS NOT NULL AND CAST(cp."Assignment2" AS TEXT) != '' 
                      THEN CAST(cp."Assignment2" AS NUMERIC) * 0.1 ELSE 0 END +
                      CASE WHEN CAST(cp."CAT" AS TEXT) IS NOT NULL AND CAST(cp."CAT" AS TEXT) != '' 
                      THEN CAST(cp."CAT" AS NUMERIC) * 0.4 ELSE 0 END +
                      CASE WHEN CAST(cp."Exam" AS TEXT) IS NOT NULL AND CAST(cp."Exam" AS TEXT) != '' 
                      THEN CAST(cp."Exam" AS NUMERIC) * 0.4 ELSE 0 END
                    ) / 
                    (
                      CASE WHEN CAST(cp."Assignment1" AS TEXT) IS NOT NULL AND CAST(cp."Assignment1" AS TEXT) != '' THEN 0.1 ELSE 0 END +
                      CASE WHEN CAST(cp."Assignment2" AS TEXT) IS NOT NULL AND CAST(cp."Assignment2" AS TEXT) != '' THEN 0.1 ELSE 0 END +
                      CASE WHEN CAST(cp."CAT" AS TEXT) IS NOT NULL AND CAST(cp."CAT" AS TEXT) != '' THEN 0.4 ELSE 0 END +
                      CASE WHEN CAST(cp."Exam" AS TEXT) IS NOT NULL AND CAST(cp."Exam" AS TEXT) != '' THEN 0.4 ELSE 0 END
                    )
                  )
                ELSE NULL
              END
            ), 
            2
          ) as avg_performance
        FROM "CoursePerformance" cp
        WHERE cp."OrganizationId" = ${organizationId}
          AND (
            (CAST(cp."Assignment1" AS TEXT) IS NOT NULL AND CAST(cp."Assignment1" AS TEXT) != '')
            OR (CAST(cp."Assignment2" AS TEXT) IS NOT NULL AND CAST(cp."Assignment2" AS TEXT) != '')
            OR (CAST(cp."CAT" AS TEXT) IS NOT NULL AND CAST(cp."CAT" AS TEXT) != '')
            OR (CAST(cp."Exam" AS TEXT) IS NOT NULL AND CAST(cp."Exam" AS TEXT) != '')
          )
        GROUP BY cp."StudentId"
      ) as performance_stats`,
      sql`"User"."Id" = performance_stats."StudentId"`
    )
    .leftJoin(ParentStudent, eq(User.Id, ParentStudent.StudentId))
    .leftJoin(
      sql`"User" as parent_user`,
      sql`"ParentStudent"."ParentId" = parent_user."Id"`
    )
    .where(whereConditions);

  // Apply sorting and pagination
  const direction = sortOrder === "asc" ? asc : desc;

  let sortedQuery;
  switch (sortColumn) {
    case "fullName":
      sortedQuery = studentsQuery.orderBy(direction(User.FullName));
      break;
    case "email":
      sortedQuery = studentsQuery.orderBy(direction(User.Email));
      break;
    case "createdOn":
      sortedQuery = studentsQuery.orderBy(direction(User.CreatedOn));
      break;
    case "stars":
      sortedQuery = studentsQuery.orderBy(
        direction(sql`COALESCE(game_stats.total_stars, 0)`),
        desc(User.CreatedOn)
      );
      break;
    case "averageScore":
      sortedQuery = studentsQuery.orderBy(
        direction(sql`COALESCE(game_stats.avg_score, 0)`),
        desc(User.CreatedOn)
      );
      break;
    case "totalCourses":
      sortedQuery = studentsQuery.orderBy(
        direction(sql`COALESCE(game_stats.total_courses, 0)`),
        desc(User.CreatedOn)
      );
      break;
    case "currentStreak":
      sortedQuery = studentsQuery.orderBy(
        direction(sql`COALESCE(today_streak.current_streak, 0)`),
        desc(User.CreatedOn)
      );
      break;
    case "attendanceRate":
      sortedQuery = studentsQuery.orderBy(
        direction(sql`COALESCE(attendance_stats.attendance_rate, 0)`),
        desc(User.CreatedOn)
      );
      break;
    case "performanceScore":
      sortedQuery = studentsQuery.orderBy(
        direction(sql`COALESCE(performance_stats.avg_performance, 0)`),
        desc(User.CreatedOn)
      );
      break;
    default:
      // Default sort by total stars (descending), then by creation date
      sortedQuery = studentsQuery.orderBy(
        desc(sql`COALESCE(game_stats.total_stars, 0)`),
        desc(User.CreatedOn)
      );
  }

  const students = await sortedQuery.limit(pageSize).offset(offset);

  // Transform results
  const transformedStudents = students.map(transformStudent);

  return {
    students: transformedStudents,
    totalCount,
    totalPages,
  };
}

// Helper function to transform student data
function transformStudent(student: RawStudentData): StudentListResponse {
  const nameParts = student.fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const age = student.dateOfBirth ? getAge(new Date(student.dateOfBirth)) : 0;
  const grade = student.grade ? `Grade ${student.grade}` : "";

  return {
    id: student.id,
    firstName,
    lastName,
    fullName: student.fullName,
    age,
    grade,
    avatar: student.avatar || "",
    stars: student.totalStars,
    lastActivity: formatDate(student.lastActivity),
    status: student.status || "Active",
    email: student.email || "",
    userName:
      student.userNumber != null
        ? student.fullName.split(" ")[0] + Number(student.userNumber)
        : "",
    parent: student.parentId
      ? {
        id: student.parentId,
        name: student.parentName || "",
        email: student.parentEmail || "",
        phone: student.parentPhone || "",
        relationship: student.parentRelationship || "Parent",
      }
      : null,
    averageScore:
      student.totalCourses > 0
        ? Math.min(100, Math.round((student.avgScore / 100) * 100))
        : 0,
    totalCourses: student.totalCourses,
    currentStreak: student.currentStreak,
    // Convert null to 0 for frontend display
    attendanceRate: student.attendanceRate !== null
      ? Math.round(student.attendanceRate)
      : 0,
    performanceScore: student.performanceScore !== null
      ? Math.round(student.performanceScore)
      : 0,
  };
}

// Helper function to format dates
function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toISOString();
}

// Additional helper function to get all available grades for an organization
export async function getAvailableGrades(
  organizationId: string
): Promise<string[]> {
  const gradesResult = await db
    .selectDistinct({
      grade: OrganizationUser.Grade,
    })
    .from(OrganizationUser)
    .where(
      and(
        eq(OrganizationUser.OrganizationId, organizationId),
        eq(OrganizationUser.RoleId, 2), // Student role
        sql`${OrganizationUser.Grade} IS NOT NULL`
      )
    )
    .orderBy(asc(OrganizationUser.Grade));

  return gradesResult
    .map((result) => result.grade)
    .filter((grade): grade is string => grade !== null);
}
