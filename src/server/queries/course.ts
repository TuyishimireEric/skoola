// @/server/queries/courses.ts
import { db } from "@/server/db";
import { CoursePerformance, User } from "@/server/db/schema";
import { CoursePerformanceDataI } from "@/types/Course";
import { and, eq, inArray } from "drizzle-orm";

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
            Total: total !== null ? total.toString() : null,
            Grade: grade || null,
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
    // Convert numeric values to strings for database storage
    const dbData: Record<string, string | null | undefined> = {};

    // Handle score fields - convert numbers to strings
    if (data.Assignment1 !== undefined) {
        dbData.Assignment1 = data.Assignment1 !== null ? data.Assignment1.toString() : null;
    }
    if (data.Assignment2 !== undefined) {
        dbData.Assignment2 = data.Assignment2 !== null ? data.Assignment2.toString() : null;
    }
    if (data.CAT !== undefined) {
        dbData.CAT = data.CAT !== null ? data.CAT.toString() : null;
    }
    if (data.Exam !== undefined) {
        dbData.Exam = data.Exam !== null ? data.Exam.toString() : null;
    }

    // Handle other string fields
    if (data.Remarks !== undefined) {
        dbData.Remarks = data.Remarks;
    }
    if (data.Term !== undefined) {
        dbData.Term = data.Term;
    }
    if (data.AcademicYear !== undefined) {
        dbData.AcademicYear = data.AcademicYear;
    }

    // Recalculate total and grade if scores are being updated
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

        dbData.Total = total !== null ? total.toString() : null;
        dbData.Grade = grade || null;
    }

    const result = await trx
        .update(CoursePerformance)
        .set({
            ...dbData,
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