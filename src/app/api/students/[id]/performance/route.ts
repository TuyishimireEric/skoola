// @/app/api/students/[id]/performance/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getStudentPerformance } from "@/server/queries/course";
import { getUserToken } from "@/utils/getToken";

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

        const performances = await getStudentPerformance(
            params.id,
            organizationId,
            term,
            academicYear
        );

        // Calculate overall average
        const totals = performances
            .map((p) => parseFloat(p.Total?.toString() || "0"))
            .filter((t) => t > 0);

        const overallAverage =
            totals.length > 0
                ? totals.reduce((sum, total) => sum + total, 0) / totals.length
                : 0;

        return NextResponse.json(
            {
                status: "Success",
                message: "Student performance fetched successfully!",
                data: {
                    performances,
                    overallAverage: Math.round(overallAverage * 100) / 100,
                    totalCourses: performances.length,
                },
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Student Performance GET error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}