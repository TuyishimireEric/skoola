import { db } from "@/server/db";
import {
    User,
    OrganizationUser,
    Attendance,
} from "@/server/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";

export interface DashboardStats {
    totalStudents: number;
    atRiskCount: number;
    averageAttendance: number;
    classAverage: number;
    attendanceTrend: Array<{
        week: string;
        attendanceRate: number;
        atRiskCount: number;
    }>;
    performanceDistribution: Array<{
        range: string;
        count: number;
    }>;
    topAtRiskStudents: Array<{
        id: string;
        name: string;
        avatar: string;
        dropoutRisk: number;
        attendanceRate: number;
        performanceScore: number;
        concerns: string[];
    }>;
    gradeBreakdown: Array<{
        grade: string;
        studentCount: number;
        averagePerformance: number;
        atRiskCount: number;
    }>;
}

export async function getDashboardStats(
    organizationId: string,
    grade?: string
): Promise<DashboardStats> {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build grade filter
    const gradeFilter = grade
        ? and(
            eq(OrganizationUser.OrganizationId, organizationId),
            eq(OrganizationUser.RoleId, 2),
            eq(OrganizationUser.Status, "Active"),
            eq(OrganizationUser.Grade, grade)
        )
        : and(
            eq(OrganizationUser.OrganizationId, organizationId),
            eq(OrganizationUser.RoleId, 2),
            eq(OrganizationUser.Status, "Active")
        );

    // 1. Get total students
    const totalStudentsResult = await db
        .select({
            count: sql<number>`COUNT(*)`,
        })
        .from(User)
        .innerJoin(OrganizationUser, eq(User.Id, OrganizationUser.UserId))
        .where(gradeFilter);

    const totalStudents = totalStudentsResult[0]?.count || 0;

    // 2. Get all students with their metrics for calculations
    const studentsData = await db
        .select({
            studentId: User.Id,
            studentName: User.FullName,
            studentAvatar: User.ImageUrl,
            studentGrade: OrganizationUser.Grade,
            attendanceRate: sql<number>`
            COALESCE(
                (
                SELECT ROUND(
                    (
                    COUNT(CASE WHEN a."Status" IN ('present', 'late') THEN 1 END)::NUMERIC
                    / NULLIF(COUNT(*)::NUMERIC, 0)
                    ) * 100,
                    2
                )
                FROM "Attendance" a
                WHERE a."StudentId" = ${User.Id}
                    AND a."OrganizationId" = ${organizationId}
                    AND a."Date" >= date_trunc('month', CURRENT_DATE)
                    AND a."Date" < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
                ),
                0
            )
            `,

            performanceScore: sql<number>`
        COALESCE(
            (
            SELECT ROUND(
                AVG(
                -- compute for each CoursePerformance row: normalized weighted score (only weights of present marks)
                CASE
                    WHEN (
                    (CASE WHEN cp."Assignment1" IS NOT NULL THEN 0.1 ELSE 0 END) +
                    (CASE WHEN cp."Assignment2" IS NOT NULL THEN 0.1 ELSE 0 END) +
                    (CASE WHEN cp."CAT" IS NOT NULL THEN 0.4 ELSE 0 END) +
                    (CASE WHEN cp."Exam" IS NOT NULL THEN 0.4 ELSE 0 END)
                    ) > 0 THEN
                    (
                        (
                        CASE WHEN cp."Assignment1" IS NOT NULL THEN cp."Assignment1" * 0.1 ELSE 0 END +
                        CASE WHEN cp."Assignment2" IS NOT NULL THEN cp."Assignment2" * 0.1 ELSE 0 END +
                        CASE WHEN cp."CAT" IS NOT NULL THEN cp."CAT" * 0.4 ELSE 0 END +
                        CASE WHEN cp."Exam" IS NOT NULL THEN cp."Exam" * 0.4 ELSE 0 END
                        )
                        /
                        (
                        (CASE WHEN cp."Assignment1" IS NOT NULL THEN 0.1 ELSE 0 END) +
                        (CASE WHEN cp."Assignment2" IS NOT NULL THEN 0.1 ELSE 0 END) +
                        (CASE WHEN cp."CAT" IS NOT NULL THEN 0.4 ELSE 0 END) +
                        (CASE WHEN cp."Exam" IS NOT NULL THEN 0.4 ELSE 0 END)
                        )
                    )
                    ELSE NULL
                END
                ),
                2
            )
            FROM "CoursePerformance" cp
            WHERE cp."StudentId" = ${User.Id}
                AND cp."OrganizationId" = ${organizationId}
            ),
            0
        )
    `,

        })
        .from(User)
        .innerJoin(OrganizationUser, eq(User.Id, OrganizationUser.UserId))
        .where(gradeFilter);



    // Calculate total performance excluding null scores
    const totalPerformance = studentsData.reduce((sum, s) => {
        // Ensure performanceScore is a valid number
        const score = Number(s.performanceScore);  // Convert to number safely

        // Only include valid performance scores (non-null, non-zero)
        if (!isNaN(score) && score > 0) {
            return sum + score;
        }
        return sum;
    }, 0);

    // Count only students with valid (non-null and non-zero) performance scores
    const validPerformanceCount = studentsData.filter(s => {
        const score = Number(s.performanceScore);  // Convert to number safely
        return !isNaN(score) && score > 0;
    }).length;

    // Calculate class average (ensure we don't divide by zero)
    const classAverage = validPerformanceCount > 0
        ? Math.round(totalPerformance / validPerformanceCount)
        : 0; // Return 0 if there are no valid performance scores


    // Calculate dropout risk for each student (60% attendance + 40% performance)
    const studentsWithRisk = studentsData.map((student) => {
        const healthScore = (student.attendanceRate * 0.6) + (student.performanceScore * 0.4);
        const dropoutRisk = Math.max(0, 100 - healthScore);

        return {
            ...student,
            dropoutRisk: Math.round(dropoutRisk),
        };
    });

    // Count at-risk students (dropout risk >= 50%)
    const atRiskCount = studentsWithRisk.filter((s) => s.dropoutRisk >= 50).length;

    // Get top 5 at-risk students
    const topAtRiskStudents = studentsWithRisk
        .sort((a, b) => b.dropoutRisk - a.dropoutRisk)
        .slice(0, 5)
        .map((student) => {
            const concerns: string[] = [];

            if (student.attendanceRate < 80) {
                concerns.push(`Low attendance: ${student.attendanceRate}%`);
            }
            if (student.performanceScore < 70) {
                concerns.push(`Failing grades: ${student.performanceScore}%`);
            }
            if (student.attendanceRate < 70 && student.performanceScore < 70) {
                concerns.push("Multiple risk factors present");
            }

            return {
                id: student.studentId,
                name: student.studentName,
                avatar: student.studentAvatar || "",
                dropoutRisk: student.dropoutRisk,
                attendanceRate: Math.round(student.attendanceRate),
                performanceScore: Math.round(student.performanceScore),
                concerns,
            };
        });

    // 3. Get attendance trend for last 5 weeks
    const attendanceTrend = await Promise.all(
        Array.from({ length: 5 }, async (_, i) => {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (4 - i) * 7);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weekData = await db
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
                .innerJoin(
                    OrganizationUser,
                    eq(Attendance.StudentId, OrganizationUser.UserId)
                )
                .where(
                    and(
                        eq(Attendance.OrganizationId, organizationId),
                        gte(Attendance.Date, weekStart.toISOString().split('T')[0]),
                        grade ? eq(OrganizationUser.Grade, grade) : undefined
                    )
                );

            // Count at-risk students for this week
            const weekAtRisk = studentsWithRisk.filter((s) => s.dropoutRisk >= 50).length;

            return {
                week: i === 4 ? "Current" : `Week ${i + 1}`,
                attendanceRate: Math.round(weekData[0]?.attendanceRate || 0),
                atRiskCount: weekAtRisk,
            };
        })
    );

    const monthlyAttendanceResult = await db
        .select({
            averageAttendance: sql<number>`
      COALESCE(
        ROUND(
          (
            COUNT(CASE WHEN ${Attendance.Status} IN ('present', 'late') THEN 1 END)::NUMERIC
            / NULLIF(COUNT(*)::NUMERIC, 0)
          ) * 100,
          2
        ),
        0
      )
    `,
        })
        .from(Attendance)
        .innerJoin(OrganizationUser, eq(Attendance.StudentId, OrganizationUser.UserId))
        .where(
            and(
                eq(Attendance.OrganizationId, organizationId),
                sql`${Attendance.Date} >= date_trunc('month', CURRENT_DATE)
           AND ${Attendance.Date} < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
                eq(OrganizationUser.RoleId, 2),
                eq(OrganizationUser.Status, 'Active'),
                grade ? eq(OrganizationUser.Grade, grade) : undefined
            )
        );

    const averageAttendance = monthlyAttendanceResult[0]?.averageAttendance ?? 0;


    // 4. Get performance distribution
    const performanceDistribution = [
        {
            range: "0-40%",
            count: studentsWithRisk.filter((s) => s.performanceScore <= 40).length,
        },
        {
            range: "41-60%",
            count: studentsWithRisk.filter(
                (s) => s.performanceScore > 40 && s.performanceScore <= 60
            ).length,
        },
        {
            range: "61-75%",
            count: studentsWithRisk.filter(
                (s) => s.performanceScore > 60 && s.performanceScore <= 75
            ).length,
        },
        {
            range: "76-85%",
            count: studentsWithRisk.filter(
                (s) => s.performanceScore > 75 && s.performanceScore <= 85
            ).length,
        },
        {
            range: "86-100%",
            count: studentsWithRisk.filter((s) => s.performanceScore > 85).length,
        },
    ];

    // 5. Get grade breakdown (only if no specific grade is selected)
    let gradeBreakdown: Array<{
        grade: string;
        studentCount: number;
        averagePerformance: number;
        atRiskCount: number;
    }> = [];

    if (!grade) {
        const gradesResult = await db
            .selectDistinct({
                grade: OrganizationUser.Grade,
            })
            .from(OrganizationUser)
            .where(
                and(
                    eq(OrganizationUser.OrganizationId, organizationId),
                    eq(OrganizationUser.RoleId, 2),
                    eq(OrganizationUser.Status, "Active"),
                    sql`${OrganizationUser.Grade} IS NOT NULL`
                )
            );

        gradeBreakdown = await Promise.all(
            gradesResult
                .filter((g) => g.grade !== null)
                .map(async (gradeItem) => {
                    const gradeStudents = studentsWithRisk.filter(
                        (s) => s.studentGrade === gradeItem.grade
                    );

                    const avgPerformance = gradeStudents.length > 0
                        ? Math.round(
                            gradeStudents.reduce((sum, s) => sum + s.performanceScore, 0) /
                            gradeStudents.length
                        )
                        : 0;

                    const atRisk = gradeStudents.filter((s) => s.dropoutRisk >= 50).length;

                    return {
                        grade: `Grade ${gradeItem.grade}`,
                        studentCount: gradeStudents.length,
                        averagePerformance: avgPerformance,
                        atRiskCount: atRisk,
                    };
                })
        );
    }

    return {
        totalStudents,
        atRiskCount,
        averageAttendance,
        classAverage,
        attendanceTrend,
        performanceDistribution,
        topAtRiskStudents,
        gradeBreakdown,
    };
}