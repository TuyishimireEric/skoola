import { db } from "@/server/db";
import {
    User,
    OrganizationUser,
    ParentStudent,
    Attendance,
    CoursePerformance,
    Course,
    StudentGame,
} from "@/server/db/schema";
import { getAge } from "@/utils/functions";
import { eq, and, sql, desc, gte } from "drizzle-orm";

export interface StudentDetailResponse {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
    age: number;
    dateOfBirth: string;
    grade: string;
    status: string;
    userName: string;
    address: string;
    parent: {
        id: string;
        name: string;
        email: string;
        phone: string;
        relationship: string;
    } | null;
    stats: {
        attendanceRate: number;
        performanceScore: number;
        totalStars: number;
        totalCourses: number;
        currentStreak: number;
        behaviorScore: number;
        dropoutRisk: number;
        lastActivity: string;
    };
    courses: Array<{
        id: string;
        title: string;
        subject: string;
        performance: {
            assignment1: number | null;
            assignment2: number | null;
            cat: number | null;
            exam: number | null;
            total: number | null;
            grade: string | null;
            remarks: string | null;
            term: string;
            academicYear: string;
        } | null;
    }>;
    attendanceHistory: Array<{
        date: string;
        status: string;
        notes: string | null;
    }>;
}

export async function getStudentDetail(
    studentId: string,
    organizationId: string
): Promise<StudentDetailResponse | null> {
    // Get today's date for current streak calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get date 30 days ago for attendance history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Fetch student basic info with parent details
    const studentResult = await db
        .select({
            id: User.Id,
            fullName: User.FullName,
            email: User.Email,
            phone: User.Phone,
            avatar: User.ImageUrl,
            dateOfBirth: User.DateOfBirth,
            status: OrganizationUser.Status,
            grade: OrganizationUser.Grade,
            userNumber: User.UserNumber,
            address: sql<string | null>`${User.Address}`,
            parentId: sql<string | null>`parent_user."Id"`,
            parentName: sql<string | null>`parent_user."FullName"`,
            parentEmail: sql<string | null>`parent_user."Email"`,
            parentPhone: sql<string | null>`parent_user."Phone"`,
            parentRelationship: sql<string | null>`"ParentStudent"."Relationship"`,
        })
        .from(User)
        .innerJoin(OrganizationUser, eq(User.Id, OrganizationUser.UserId))
        .leftJoin(ParentStudent, eq(User.Id, ParentStudent.StudentId))
        .leftJoin(
            sql`"User" as parent_user`,
            sql`"ParentStudent"."ParentId" = parent_user."Id"`
        )
        .where(
            and(
                eq(User.Id, studentId),
                eq(OrganizationUser.OrganizationId, organizationId),
                eq(OrganizationUser.RoleId, 2) // Student role
            )
        )
        .limit(1);

    if (!studentResult[0]) {
        return null;
    }

    const student = studentResult[0];

    // Fetch student stats
    const statsResult = await db
        .select({
            totalStars: sql<number>`COALESCE(SUM(${StudentGame.Stars}), 0)`,
            totalCourses: sql<number>`COUNT(DISTINCT ${StudentGame.GameId})`,
            lastActivity: sql<string>`MAX(${StudentGame.CompletedOn})`,
            avgScore: sql<number>`COALESCE(AVG(CAST(${StudentGame.Score} AS DECIMAL)), 0)`,
            currentStreak: sql<number>`COALESCE(MAX(CASE WHEN ${StudentGame.CompletedOn} >= ${todayISO} THEN ${StudentGame.CurrentStreak} ELSE 0 END), 0)`,
        })
        .from(StudentGame)
        .where(eq(StudentGame.StudentId, studentId));

    const stats = statsResult[0];

    // Fetch attendance rate (all time)
    const attendanceResult = await db
        .select({
            attendanceRate: sql<number>`
        ROUND(
          (COUNT(CASE WHEN ${Attendance.Status} IN ('present', 'late') THEN 1 END)::NUMERIC / 
          NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
          2
        )
      `,
        })
        .from(Attendance)
        .where(
            and(
                eq(Attendance.StudentId, studentId),
                eq(Attendance.OrganizationId, organizationId)
            )
        );

    const attendanceRate = attendanceResult[0]?.attendanceRate || 0;

    // Fetch performance score (weighted average across all courses)
    const performanceResult = await db
        .select({
            performanceScore: sql<number>`
        ROUND(
          AVG(
            CASE 
              WHEN (
                CASE WHEN CAST(${CoursePerformance.Assignment1} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Assignment1} AS TEXT) != '' THEN 0.1 ELSE 0 END +
                CASE WHEN CAST(${CoursePerformance.Assignment2} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Assignment2} AS TEXT) != '' THEN 0.1 ELSE 0 END +
                CASE WHEN CAST(${CoursePerformance.CAT} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.CAT} AS TEXT) != '' THEN 0.4 ELSE 0 END +
                CASE WHEN CAST(${CoursePerformance.Exam} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Exam} AS TEXT) != '' THEN 0.4 ELSE 0 END
              ) > 0 THEN
                (
                  (
                    CASE WHEN CAST(${CoursePerformance.Assignment1} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Assignment1} AS TEXT) != '' 
                    THEN CAST(${CoursePerformance.Assignment1} AS NUMERIC) * 0.1 ELSE 0 END +
                    CASE WHEN CAST(${CoursePerformance.Assignment2} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Assignment2} AS TEXT) != '' 
                    THEN CAST(${CoursePerformance.Assignment2} AS NUMERIC) * 0.1 ELSE 0 END +
                    CASE WHEN CAST(${CoursePerformance.CAT} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.CAT} AS TEXT) != '' 
                    THEN CAST(${CoursePerformance.CAT} AS NUMERIC) * 0.4 ELSE 0 END +
                    CASE WHEN CAST(${CoursePerformance.Exam} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Exam} AS TEXT) != '' 
                    THEN CAST(${CoursePerformance.Exam} AS NUMERIC) * 0.4 ELSE 0 END
                  ) / 
                  (
                    CASE WHEN CAST(${CoursePerformance.Assignment1} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Assignment1} AS TEXT) != '' THEN 0.1 ELSE 0 END +
                    CASE WHEN CAST(${CoursePerformance.Assignment2} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Assignment2} AS TEXT) != '' THEN 0.1 ELSE 0 END +
                    CASE WHEN CAST(${CoursePerformance.CAT} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.CAT} AS TEXT) != '' THEN 0.4 ELSE 0 END +
                    CASE WHEN CAST(${CoursePerformance.Exam} AS TEXT) IS NOT NULL AND CAST(${CoursePerformance.Exam} AS TEXT) != '' THEN 0.4 ELSE 0 END
                  )
                )
              ELSE NULL
            END
          ), 
          2
        )
      `,
        })
        .from(CoursePerformance)
        .where(
            and(
                eq(CoursePerformance.StudentId, studentId),
                eq(CoursePerformance.OrganizationId, organizationId)
            )
        );

    const performanceScore = performanceResult[0]?.performanceScore || 0;

    // Calculate dropout risk (60% attendance + 40% performance)
    const healthScore = attendanceRate * 0.6 + performanceScore * 0.4;
    const dropoutRisk = Math.max(0, 100 - healthScore);

    // Fetch courses for student's grade with performance data (including individual scores)
    const coursesResult = await db
        .select({
            courseId: Course.Id,
            courseTitle: Course.Title,
            courseSubject: Course.Subject,
            performanceId: CoursePerformance.Id,
            assignment1: CoursePerformance.Assignment1,
            assignment2: CoursePerformance.Assignment2,
            cat: CoursePerformance.CAT,
            exam: CoursePerformance.Exam,
            total: CoursePerformance.Total,
            grade: CoursePerformance.Grade,
            remarks: CoursePerformance.Remarks,
            term: CoursePerformance.Term,
            academicYear: CoursePerformance.AcademicYear,
        })
        .from(Course)
        .leftJoin(
            CoursePerformance,
            and(
                eq(CoursePerformance.CourseId, Course.Id),
                eq(CoursePerformance.StudentId, studentId)
            )
        )
        .where(
            and(
                eq(Course.Grade, student.grade || ""),
                eq(Course.OrganizationId, organizationId),
                eq(Course.Status, "Published"),
                eq(Course.IsActive, true)
            )
        )
        .orderBy(Course.Order, Course.Title);

    const courses = coursesResult.map((row) => ({
        id: row.courseId,
        title: row.courseTitle,
        subject: row.courseSubject || "",
        performance: row.performanceId
            ? {
                assignment1: row.assignment1 ? parseFloat(row.assignment1) : null,
                assignment2: row.assignment2 ? parseFloat(row.assignment2) : null,
                cat: row.cat ? parseFloat(row.cat) : null,
                exam: row.exam ? parseFloat(row.exam) : null,
                total: row.total ? parseFloat(row.total) : null,
                grade: row.grade,
                remarks: row.remarks,
                term: row.term || "",
                academicYear: row.academicYear || "",
            }
            : null,
    }));

    // Fetch attendance history (last 30 days with daily records)
    const attendanceHistory = await db
        .select({
            date: Attendance.Date,
            status: Attendance.Status,
            notes: Attendance.Notes,
        })
        .from(Attendance)
        .where(
            and(
                eq(Attendance.StudentId, studentId),
                eq(Attendance.OrganizationId, organizationId),
                gte(Attendance.Date, thirtyDaysAgo.toISOString().split('T')[0])
            )
        )
        .orderBy(desc(Attendance.Date))
        .limit(30);

    // Transform data
    const nameParts = student.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const age = student.dateOfBirth ? getAge(new Date(student.dateOfBirth)) : 0;

    // Behavior score (placeholder - you can implement based on your logic)
    const behaviorScore = 92; // TODO: Calculate from actual behavior records

    return {
        id: student.id,
        firstName,
        lastName,
        fullName: student.fullName,
        email: student.email || "",
        phone: student.phone || "",
        avatar: student.avatar || "",
        age,
        dateOfBirth: student.dateOfBirth || "",
        grade: student.grade ? `Grade ${student.grade}` : "",
        status: student.status || "Active",
        userName:
            student.userNumber != null
                ? firstName + Number(student.userNumber)
                : "",
        address: student.address || "",
        parent: student.parentId
            ? {
                id: student.parentId,
                name: student.parentName || "",
                email: student.parentEmail || "",
                phone: student.parentPhone || "",
                relationship: student.parentRelationship || "Parent",
            }
            : null,
        stats: {
            attendanceRate: Math.round(attendanceRate),
            performanceScore: Math.round(performanceScore),
            totalStars: stats.totalStars,
            totalCourses: stats.totalCourses,
            currentStreak: stats.currentStreak,
            behaviorScore,
            dropoutRisk: Math.round(dropoutRisk),
            lastActivity: stats.lastActivity || new Date().toISOString(),
        },
        courses,
        attendanceHistory: attendanceHistory.map((a) => ({
            date: a.date,
            status: a.status,
            notes: a.notes,
        })),
    };
}