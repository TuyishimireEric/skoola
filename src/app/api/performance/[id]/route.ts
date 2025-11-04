// @/app/api/performance/[id]/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { updatePerformance, deletePerformance } from "@/server/queries/course";
import { getUserToken } from "@/utils/getToken";
import { coursePerformanceSchema } from "@/types/Course";

export async function PUT(
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
                    message: "You are not authorized to update performance",
                },
                { status: HttpStatusCode.Forbidden }
            );
        }

        const formData = await req.json();

        const validationResult = coursePerformanceSchema.partial().safeParse(formData);

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

        const updated = await updatePerformance(params.id, validationResult.data, userId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Performance updated successfully!",
                data: updated,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Performance PUT error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}

export async function DELETE(
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
                    message: "You are not authorized to delete performance",
                },
                { status: HttpStatusCode.Forbidden }
            );
        }

        await deletePerformance(params.id, organizationId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Performance deleted successfully!",
                data: null,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Performance DELETE error:", error);
        return NextResponse.json(
            { status: "Error", data: null, message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}