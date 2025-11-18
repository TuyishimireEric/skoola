import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
    getCoursePerformances,
    batchUpsertPerformance,
} from "@/server/queries/course";
import { getUserToken } from "@/utils/getToken";
import { bulkPerformanceSchema } from "@/types/Course";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const term = searchParams.get("term") || undefined;
        const academicYear = searchParams.get("academicYear") || undefined;

        const { userId, organizationId } = await getUserToken(req);

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

        const performances = await getCoursePerformances(
            params.id,
            term,
            academicYear
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Course performances fetched successfully!",
                data: performances,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Performance GET error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId, userRoleId, organizationId } = await getUserToken(req);

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

        if (userRoleId !== 1 && userRoleId !== 2) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "You are not authorized to record performance",
                },
                { status: HttpStatusCode.Forbidden }
            );
        }

        const formData = await req.json();

        const validationResult = bulkPerformanceSchema.safeParse({
            ...formData,
            CourseId: params.id,
        });

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

        const { Term, AcademicYear, Performances } = validationResult.data;

        const result = await batchUpsertPerformance(
            params.id,
            Term,
            AcademicYear,
            Performances,
            organizationId,
            userId
        );

        return NextResponse.json(
            {
                status: "Success",
                message: `Performance recorded successfully for ${result.length} student(s)!`,
                data: result,
            },
            { status: HttpStatusCode.Created }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Performance POST error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}
