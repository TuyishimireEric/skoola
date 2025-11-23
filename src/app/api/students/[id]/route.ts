// @/app/api/students/[id]/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getUserToken } from "@/utils/getToken";
import { getStudentDetail } from "@/server/queries/student-details";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        const { id: studentId } = await params;

        const studentDetail = await getStudentDetail(studentId, organizationId);

        if (!studentDetail) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Student not found",
                },
                { status: HttpStatusCode.NotFound }
            );
        }

        return NextResponse.json(
            {
                status: "Success",
                message: "Student details fetched successfully!",
                data: studentDetail,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Student Detail GET error:", error);
        return NextResponse.json(
            {
                status: "Error",
                data: null,
                message: error.message,
            },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}