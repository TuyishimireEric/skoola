import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "@/server/queries/skoolaDashboard";
import { getUserToken } from "@/utils/getToken";

export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        const grade = searchParams.get("grade") || undefined;

        const dashboardData = await getDashboardStats(organizationId, grade);

        return NextResponse.json(
            {
                status: "Success",
                message: "Dashboard data fetched successfully!",
                data: dashboardData,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Dashboard GET error:", error);
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