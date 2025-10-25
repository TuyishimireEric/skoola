import { db } from "@/server/db";
import { User, OrganizationUser, ParentStudent } from "@/server/db/schema";
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

  // Main optimized query without ranking calculation
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
    })
    .from(User)
    .innerJoin(OrganizationUser, eq(User.Id, OrganizationUser.UserId))
    .leftJoin(
      // Game statistics subquery - also filtered by organization for consistency
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
      // Today's streak subquery - also filtered by organization and grade
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
    .leftJoin(ParentStudent, eq(User.Id, ParentStudent.StudentId))
    .leftJoin(
      sql`"User" as parent_user`,
      sql`"ParentStudent"."ParentId" = parent_user."Id"`
    )
    .where(whereConditions);

  // Apply sorting and pagination - inline approach
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
