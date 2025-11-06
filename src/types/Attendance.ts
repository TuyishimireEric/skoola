// @/types/Attendance.ts
import { z } from "zod";

export const attendanceRecordSchema = z.object({
    studentId: z.string().uuid(),
    status: z.enum(["present", "late", "absent", "excused"]),
    notes: z.string().optional().default(""),
});

export const attendanceSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    records: z.array(attendanceRecordSchema).min(1),
});

export const batchAttendanceSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    records: z.array(attendanceRecordSchema),
});

export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type BatchAttendanceInput = z.infer<typeof batchAttendanceSchema>;

export interface AttendanceDataI {
    Id?: string;
    StudentId: string;
    Date: string;
    Status: "present" | "late" | "absent" | "excused";
    Notes?: string;
    OrganizationId: string;
    CreatedBy?: string;
    UpdatedBy?: string;
    CreatedOn?: string;
    UpdatedOn?: string;
}

export interface AttendanceStatsI {
    date: string;
    totalStudents: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    unmarked: number;
    attendanceRate: number;
}