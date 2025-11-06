import { db } from "@/server/db";
import { Attendance, User } from "@/server/db/schema";
import { AttendanceDataI, AttendanceRecordInput } from "@/types/Attendance";
import { and, eq, sql, inArray, gte, lte } from "drizzle-orm";

interface AttendanceQueryParams {
    organizationId: string;
    date?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
}

export const getAttendanceByDate = async (
    params: AttendanceQueryParams,
    trx: typeof db = db
): Promise<AttendanceDataI[]> => {
    const filters = [eq(Attendance.OrganizationId, params.organizationId)];

    if (params.date) {
        filters.push(eq(Attendance.Date, params.date));
    }

    if (params.studentId) {
        filters.push(eq(Attendance.StudentId, params.studentId));
    }

    if (params.startDate) {
        filters.push(gte(Attendance.Date, params.startDate));
    }

    if (params.endDate) {
        filters.push(lte(Attendance.Date, params.endDate));
    }

    const results = await trx
        .select({
            Id: Attendance.Id,
            StudentId: Attendance.StudentId,
            Date: Attendance.Date,
            Status: Attendance.Status,
            Notes: Attendance.Notes,
            OrganizationId: Attendance.OrganizationId,
            CreatedBy: Attendance.CreatedBy,
            UpdatedBy: Attendance.UpdatedBy,
            CreatedOn: Attendance.CreatedOn,
            UpdatedOn: Attendance.UpdatedOn,
            StudentName: User.FullName,
        })
        .from(Attendance)
        .leftJoin(User, eq(User.Id, Attendance.StudentId))
        .where(and(...filters));

    return results as AttendanceDataI[];
};

export const getAttendanceStats = async (
    date: string,
    organizationId: string,
    grade?: string,
    trx: typeof db = db
) => {
    const baseFilters = [
        eq(Attendance.OrganizationId, organizationId),
        eq(Attendance.Date, date),
    ];

    const results = await trx
        .select({
            Status: Attendance.Status,
            Count: sql<number>`COUNT(*)::int`,
        })
        .from(Attendance)
        .where(and(...baseFilters))
        .groupBy(Attendance.Status);

    const stats = {
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
    };

    results.forEach((row) => {
        stats[row.Status as keyof typeof stats] = row.Count;
    });

    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const attendanceRate =
        total > 0 ? Math.round(((stats.present + stats.late) / total) * 100) : 0;

    return {
        date,
        totalStudents: total,
        ...stats,
        attendanceRate,
    };
};

export const batchCreateAttendance = async (
    date: string,
    records: AttendanceRecordInput[],
    organizationId: string,
    userId: string,
    trx: typeof db = db
) => {
    // First, delete existing attendance records for this date and students
    const studentIds = records.map((r) => r.studentId);

    if (studentIds.length > 0) {
        await trx
            .delete(Attendance)
            .where(
                and(
                    eq(Attendance.Date, date),
                    eq(Attendance.OrganizationId, organizationId),
                    inArray(Attendance.StudentId, studentIds)
                )
            );
    }

    // Insert new records
    const attendanceData = records.map((record) => ({
        StudentId: record.studentId,
        Date: date,
        Status: record.status,
        Notes: record.notes || "",
        OrganizationId: organizationId,
        CreatedBy: userId,
        UpdatedBy: userId,
    }));

    if (attendanceData.length === 0) {
        return [];
    }

    const result = await trx
        .insert(Attendance)
        .values(attendanceData)
        .returning({
            Id: Attendance.Id,
            StudentId: Attendance.StudentId,
            Date: Attendance.Date,
            Status: Attendance.Status,
            Notes: Attendance.Notes,
        });

    return result;
};

export const updateAttendance = async (
    id: string,
    data: Partial<AttendanceDataI>,
    userId: string,
    trx: typeof db = db
) => {
    const result = await trx
        .update(Attendance)
        .set({
            ...data,
            UpdatedBy: userId,
            UpdatedOn: new Date().toISOString(),
        })
        .where(eq(Attendance.Id, id))
        .returning();

    return result[0];
};

export const deleteAttendance = async (
    id: string,
    organizationId: string,
    trx: typeof db = db
) => {
    await trx
        .delete(Attendance)
        .where(
            and(eq(Attendance.Id, id), eq(Attendance.OrganizationId, organizationId))
        );

    return { success: true };
};

export const deleteAttendanceByDate = async (
    date: string,
    organizationId: string,
    trx: typeof db = db
) => {
    await trx
        .delete(Attendance)
        .where(
            and(
                eq(Attendance.Date, date),
                eq(Attendance.OrganizationId, organizationId)
            )
        );

    return { success: true };
};