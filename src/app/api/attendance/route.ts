import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
    getAttendanceByDate,
    batchCreateAttendance,
    getAttendanceStats,
} from "@/server/queries/attendance";
import { getUserToken } from "@/utils/getToken";
import { batchAttendanceSchema } from "@/types/Attendance";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const studentId = searchParams.get("studentId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const grade = searchParams.get("grade");
        const includeStats = searchParams.get("includeStats") === "true";

        const { organizationId } = await getUserToken(req);

        if (!organizationId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Organization not found",
                },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const queryParams = {
            organizationId,
            date: date || undefined,
            studentId: studentId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            grade: grade || undefined,
        };

        const attendance = await getAttendanceByDate(queryParams);

        let stats = null;
        if (includeStats && date) {
            stats = await getAttendanceStats(date, organizationId, grade || undefined);
        }

        return NextResponse.json(
            {
                status: "Success",
                message: "Attendance fetched successfully!",
                data: {
                    attendance,
                    stats,
                },
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, organizationId, userRoleId } = await getUserToken(req);

        if (!userId || !organizationId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Unauthorized, Please Login!",
                },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        // Check if user is teacher or admin
        if (userRoleId !== 1 && userRoleId !== 2) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "You are not authorized to record attendance",
                },
                { status: HttpStatusCode.Forbidden }
            );
        }

        const formData = await req.json();

        const validationResult = batchAttendanceSchema.safeParse(formData);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: validationResult.error.errors
                        .map((err) => `${err.path.join(".")}: ${err.message}`)
                        .join(", "),
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const { date, records } = validationResult.data;

        // Check if date is in the future
        const selectedDate = new Date(date);
        const today = new Date();

        if (selectedDate > today) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Cannot record attendance for future dates",
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const result = await batchCreateAttendance(
            date,
            records,
            organizationId,
            userId
        );

        // Get updated stats
        const stats = await getAttendanceStats(date, organizationId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Attendance recorded successfully!",
                data: {
                    records: result,
                    stats,
                },
            },
            { status: HttpStatusCode.Created }
        );
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}