// @/server/queries/courses.ts
import { db } from "@/server/db";
import { Course, CoursePerformance, User } from "@/server/db/schema";
import { CourseDataI, CoursePerformanceDataI } from "@/types/Course";
import { and, eq, desc, sql, or, count, countDistinct, inArray } from "drizzle-orm";

interface CourseQueryParams {
    page: number;
    pageSize: number;
    searchText?: string;
    grade?: string;
    subject?: string;
    status?: string;
    organizationId: string;
    isActive?: boolean;
}

export const calculatePerformance = (
    assignment1?: number | null,
    assignment2?: number | null,
    cat?: number | null,
    exam?: number | null
): { total: number | null; grade: string | null } => {
    // Only calculate if ALL four scores are present and not null
    if (
        assignment1 === null ||
        assignment1 === undefined ||
        assignment2 === null ||
        assignment2 === undefined ||
        cat === null ||
        cat === undefined ||
        exam === null ||
        exam === undefined
    ) {
        return { total: null, grade: null };
    }

    // Weighted calculation:
    // Assignment 1: 10%, Assignment 2: 10%, CAT: 40%, Exam: 40%
    const total = (assignment1 * 0.1) + (assignment2 * 0.1) + (cat * 0.4) + (exam * 0.4);

    let grade = "F";
    if (total >= 90) grade = "A";
    else if (total >= 80) grade = "B";
    else if (total >= 70) grade = "C";
    else if (total >= 60) grade = "D";
    else if (total >= 50) grade = "E";

    return { total: Math.round(total * 100) / 100, grade };
};

export const getCourses = async (
    data: CourseQueryParams,
    trx: typeof db = db
): Promise<{ courses: CourseDataI[]; total: number }> => {
    const limit = data.pageSize;
    const offset = (data.page - 1) * data.pageSize;

    const baseFilters = [];

    baseFilters.push(eq(Course.OrganizationId, data.organizationId));

    if (data.status) {
        baseFilters.push(eq(Course.Status, data.status as any));
    } else {
        baseFilters.push(eq(Course.Status, "Published"));
    }

    if (data.isActive !== undefined) {
        baseFilters.push(eq(Course.IsActive, data.isActive));
    }

    if (data.searchText) {
        const searchTerm = `%${data.searchText.toLowerCase()}%`;
        baseFilters.push(
            or(
                sql`LOWER(${Course.Title}) LIKE ${searchTerm}`,
                sql`LOWER(${Course.Description}) LIKE ${searchTerm}`,
                sql`LOWER(${Course.Subject}) LIKE ${searchTerm}`
            )
        );
    }

    if (data.grade) {
        baseFilters.push(eq(Course.Grade, data.grade));
    }

    if (data.subject) {
        baseFilters.push(eq(Course.Subject, data.subject));
    }

    const totalResult = await trx
        .select({ count: count() })
        .from(Course)
        .where(and(...baseFilters));

    const total = totalResult[0]?.count || 0;

    // Get courses with performance stats - only count records with all 4 scores
    // Get courses with performance stats - only count records with all 4 scores
    const performanceStats = trx
        .select({
            CourseId: CoursePerformance.CourseId,
            studentCount: countDistinct(CoursePerformance.StudentId).as("student_count"),
            avgPerformance: sql<number>`
            ROUND(
                AVG(
                    CASE 
                        WHEN ${CoursePerformance.Assignment1} IS NOT NULL 
                        AND ${CoursePerformance.Assignment2} IS NOT NULL 
                        AND ${CoursePerformance.CAT} IS NOT NULL 
                        AND ${CoursePerformance.Exam} IS NOT NULL 
                        THEN (
                            (${CoursePerformance.Assignment1}::numeric * 0.1) + 
                            (${CoursePerformance.Assignment2}::numeric * 0.1) + 
                            (${CoursePerformance.CAT}::numeric * 0.4) + 
                            (${CoursePerformance.Exam}::numeric * 0.4)
                        )
                        ELSE NULL
                    END
                ), 2
            )
        `.as("avg_performance"),
        })
        .from(CoursePerformance)
        .groupBy(CoursePerformance.CourseId)
        .as("performance_stats");

    const results = await trx
        .select({
            Id: Course.Id,
            Title: Course.Title,
            Description: Course.Description,
            ImageUrl: Course.ImageUrl,
            Grade: Course.Grade,
            Subject: Course.Subject,
            Status: Course.Status,
            Order: Course.Order,
            IsActive: Course.IsActive,
            OrganizationId: Course.OrganizationId,
            CreatedOn: Course.CreatedOn,
            UpdatedOn: Course.UpdatedOn,
            CreatorName: User.FullName,
            CreatorImage: User.ImageUrl,
            TotalStudents: sql<number>`COALESCE(${performanceStats.studentCount}, 0)`,
            AveragePerformance: sql<number>`COALESCE(${performanceStats.avgPerformance}, 0)`,
        })
        .from(Course)
        .leftJoin(User, eq(User.Id, Course.CreatedBy))
        .leftJoin(performanceStats, eq(performanceStats.CourseId, Course.Id))
        .where(and(...baseFilters))
        .orderBy(Course.Order, desc(Course.CreatedOn))
        .limit(limit)
        .offset(offset);

    const courses = results.map((row) => ({
        Id: row.Id,
        Title: row.Title,
        Description: row.Description || undefined,
        ImageUrl: row.ImageUrl || undefined,
        Grade: row.Grade,
        Subject: row.Subject || undefined,
        Status: row.Status,
        Order: row.Order || 0,
        IsActive: row.IsActive,
        OrganizationId: row.OrganizationId,
        CreatedOn: row.CreatedOn,
        UpdatedOn: row.UpdatedOn,
        CreatorName: row.CreatorName || undefined,
        CreatorImage: row.CreatorImage || undefined,
        TotalStudents: row.TotalStudents,
        AveragePerformance: row.AveragePerformance,
    })) as CourseDataI[];

    return { courses, total };
};

export const getCourseById = async (
    id: string,
    organizationId: string,
    trx: typeof db = db
): Promise<CourseDataI | null> => {
    const performanceStats = trx
        .select({
            CourseId: CoursePerformance.CourseId,
            studentCount: countDistinct(CoursePerformance.StudentId).as("student_count"),
            avgPerformance: sql<number>`
                ROUND(
                    AVG(
                        CASE 
                            WHEN ${CoursePerformance.Assignment1} IS NOT NULL 
                            AND ${CoursePerformance.Assignment2} IS NOT NULL 
                            AND ${CoursePerformance.CAT} IS NOT NULL 
                            AND ${CoursePerformance.Exam} IS NOT NULL 
                            THEN ${CoursePerformance.Total}::numeric
                            ELSE NULL
                        END
                    ), 2
                )
            `.as("avg_performance"),
        })
        .from(CoursePerformance)
        .where(eq(CoursePerformance.CourseId, id))
        .groupBy(CoursePerformance.CourseId)
        .as("performance_stats");

    const result = await trx
        .select({
            Id: Course.Id,
            Title: Course.Title,
            Description: Course.Description,
            ImageUrl: Course.ImageUrl,
            Grade: Course.Grade,
            Subject: Course.Subject,
            Status: Course.Status,
            Order: Course.Order,
            IsActive: Course.IsActive,
            OrganizationId: Course.OrganizationId,
            CreatedOn: Course.CreatedOn,
            UpdatedOn: Course.UpdatedOn,
            CreatorName: User.FullName,
            CreatorImage: User.ImageUrl,
            TotalStudents: sql<number>`COALESCE(${performanceStats.studentCount}, 0)`,
            AveragePerformance: sql<number>`COALESCE(${performanceStats.avgPerformance}, 0)`,
        })
        .from(Course)
        .leftJoin(User, eq(User.Id, Course.CreatedBy))
        .leftJoin(performanceStats, eq(performanceStats.CourseId, Course.Id))
        .where(and(eq(Course.Id, id), eq(Course.OrganizationId, organizationId)))
        .limit(1);

    if (!result[0]) {
        return null;
    }

    const row = result[0];

    return {
        Id: row.Id,
        Title: row.Title,
        Description: row.Description || undefined,
        ImageUrl: row.ImageUrl || undefined,
        Grade: row.Grade,
        Subject: row.Subject || undefined,
        Status: row.Status,
        Order: row.Order || 0,
        IsActive: row.IsActive,
        OrganizationId: row.OrganizationId,
        CreatedOn: row.CreatedOn,
        UpdatedOn: row.UpdatedOn,
        CreatorName: row.CreatorName || undefined,
        CreatorImage: row.CreatorImage || undefined,
        TotalStudents: row.TotalStudents,
        AveragePerformance: row.AveragePerformance,
    } as CourseDataI;
};

export const createCourse = async (
    formData: CourseDataI,
    userId: string,
    trx: typeof db = db
) => {
    const result = await trx
        .insert(Course)
        .values({
            ...formData,
            CreatedBy: userId,
            UpdatedBy: userId,
        })
        .returning({
            Id: Course.Id,
            Title: Course.Title,
            Grade: Course.Grade,
        });

    return result[0];
};

export const updateCourse = async (
    formData: CourseDataI,
    userId: string,
    trx: typeof db = db
) => {
    const { Id, ...updateData } = formData;

    if (!Id) {
        throw new Error("Cannot update course without an Id");
    }

    const result = await trx
        .update(Course)
        .set({
            ...updateData,
            UpdatedBy: userId,
            UpdatedOn: new Date().toISOString(),
        })
        .where(eq(Course.Id, Id))
        .returning();

    return result[0];
};

export const deleteCourse = async (
    id: string,
    organizationId: string,
    trx: typeof db = db
) => {
    await trx
        .delete(Course)
        .where(and(eq(Course.Id, id), eq(Course.OrganizationId, organizationId)));

    return { success: true };
};

// Performance queries
export const getCoursePerformances = async (
    courseId: string,
    term?: string,
    academicYear?: string,
    trx: typeof db = db
): Promise<CoursePerformanceDataI[]> => {
    const filters = [eq(CoursePerformance.CourseId, courseId)];

    if (term) {
        filters.push(eq(CoursePerformance.Term, term));
    }

    if (academicYear) {
        filters.push(eq(CoursePerformance.AcademicYear, academicYear));
    }

    const results = await trx
        .select({
            Id: CoursePerformance.Id,
            CourseId: CoursePerformance.CourseId,
            StudentId: CoursePerformance.StudentId,
            Assignment1: CoursePerformance.Assignment1,
            Assignment2: CoursePerformance.Assignment2,
            CAT: CoursePerformance.CAT,
            Exam: CoursePerformance.Exam,
            Total: CoursePerformance.Total,
            Grade: CoursePerformance.Grade,
            Remarks: CoursePerformance.Remarks,
            Term: CoursePerformance.Term,
            AcademicYear: CoursePerformance.AcademicYear,
            OrganizationId: CoursePerformance.OrganizationId,
            CreatedOn: CoursePerformance.CreatedOn,
            UpdatedOn: CoursePerformance.UpdatedOn,
            StudentName: User.FullName,
            StudentAvatar: User.ImageUrl,
        })
        .from(CoursePerformance)
        .innerJoin(User, eq(User.Id, CoursePerformance.StudentId))
        .where(and(...filters))
        .orderBy(User.FullName);

    return results as CoursePerformanceDataI[];
};

export const getStudentPerformance = async (
    studentId: string,
    organizationId: string,
    term?: string,
    academicYear?: string,
    trx: typeof db = db
): Promise<CoursePerformanceDataI[]> => {
    const filters = [
        eq(CoursePerformance.StudentId, studentId),
        eq(CoursePerformance.OrganizationId, organizationId),
    ];

    if (term) {
        filters.push(eq(CoursePerformance.Term, term));
    }

    if (academicYear) {
        filters.push(eq(CoursePerformance.AcademicYear, academicYear));
    }

    const results = await trx
        .select({
            Id: CoursePerformance.Id,
            CourseId: CoursePerformance.CourseId,
            StudentId: CoursePerformance.StudentId,
            Assignment1: CoursePerformance.Assignment1,
            Assignment2: CoursePerformance.Assignment2,
            CAT: CoursePerformance.CAT,
            Exam: CoursePerformance.Exam,
            Total: CoursePerformance.Total,
            Grade: CoursePerformance.Grade,
            Remarks: CoursePerformance.Remarks,
            Term: CoursePerformance.Term,
            AcademicYear: CoursePerformance.AcademicYear,
            OrganizationId: CoursePerformance.OrganizationId,
            CreatedOn: CoursePerformance.CreatedOn,
            UpdatedOn: CoursePerformance.UpdatedOn,
            CourseName: Course.Title,
            CourseSubject: Course.Subject,
        })
        .from(CoursePerformance)
        .innerJoin(Course, eq(Course.Id, CoursePerformance.CourseId))
        .where(and(...filters))
        .orderBy(Course.Title);

    return results as CoursePerformanceDataI[];
};

export const batchUpsertPerformance = async (
    courseId: string,
    term: string,
    academicYear: string,
    performances: Array<{
        StudentId: string;
        Assignment1?: number | null;
        Assignment2?: number | null;
        CAT?: number | null;
        Exam?: number | null;
        Remarks?: string | null;
    }>,
    organizationId: string,
    userId: string,
    trx: typeof db = db
) => {
    const studentIds = performances.map((p) => p.StudentId);

    // Delete existing performance records for these students in this term/year
    await trx
        .delete(CoursePerformance)
        .where(
            and(
                eq(CoursePerformance.CourseId, courseId),
                eq(CoursePerformance.Term, term),
                eq(CoursePerformance.AcademicYear, academicYear),
                inArray(CoursePerformance.StudentId, studentIds)
            )
        );

    // Insert new performance records
    const performanceData = performances.map((perf) => {
        const { total, grade } = calculatePerformance(
            perf.Assignment1,
            perf.Assignment2,
            perf.CAT,
            perf.Exam
        );

        return {
            CourseId: courseId,
            StudentId: perf.StudentId,
            Assignment1: perf.Assignment1?.toString() || null,
            Assignment2: perf.Assignment2?.toString() || null,
            CAT: perf.CAT?.toString() || null,
            Exam: perf.Exam?.toString() || null,
            Total: total !== null ? total.toString() : null,  // Store null if not calculated
            Grade: grade || null,  // Store null if not calculated
            Remarks: perf.Remarks || null,
            Term: term,
            AcademicYear: academicYear,
            OrganizationId: organizationId,
            CreatedBy: userId,
            UpdatedBy: userId,
        };
    });

    const result = await trx
        .insert(CoursePerformance)
        .values(performanceData)
        .returning({
            Id: CoursePerformance.Id,
            StudentId: CoursePerformance.StudentId,
            Total: CoursePerformance.Total,
            Grade: CoursePerformance.Grade,
        });

    return result;
};

export const updatePerformance = async (
    id: string,
    data: Partial<CoursePerformanceDataI>,
    userId: string,
    trx: typeof db = db
) => {
    // Recalculate total and grade if scores are being updated
    let updateData: any = { ...data };

    if (
        data.Assignment1 !== undefined ||
        data.Assignment2 !== undefined ||
        data.CAT !== undefined ||
        data.Exam !== undefined
    ) {
        const { total, grade } = calculatePerformance(
            data.Assignment1,
            data.Assignment2,
            data.CAT,
            data.Exam
        );

        updateData.Total = total !== null ? total.toString() : null;  // Store null if not calculated
        updateData.Grade = grade || null;  // Store null if not calculated
    }

    const result = await trx
        .update(CoursePerformance)
        .set({
            ...updateData,
            UpdatedBy: userId,
            UpdatedOn: new Date().toISOString(),
        })
        .where(eq(CoursePerformance.Id, id))
        .returning();

    return result[0];
};

export const deletePerformance = async (
    id: string,
    organizationId: string,
    trx: typeof db = db
) => {
    await trx
        .delete(CoursePerformance)
        .where(
            and(
                eq(CoursePerformance.Id, id),
                eq(CoursePerformance.OrganizationId, organizationId)
            )
        );

    return { success: true };
};