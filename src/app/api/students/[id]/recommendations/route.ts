import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getUserToken } from "@/utils/getToken";
import {
    getStudentRecommendations,
    createRecommendation,
} from "@/server/queries/StudentRecommendations";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId, organizationId } = await getUserToken(req);

        if (!userId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Unauthorized, Please Login!",
                },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        if (!organizationId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "User not associated with any organization",
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const studentId = params.id;

        const recommendations = await getStudentRecommendations(
            studentId,
            organizationId
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Recommendations fetched successfully",
                data: recommendations,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        const err = error as Error;
        return NextResponse.json(
            {
                status: "Error",
                message: err?.message || "Failed to fetch recommendations",
                data: null,
            },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId, organizationId } = await getUserToken(req);

        if (!userId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "Unauthorized, Please Login!",
                },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        if (!organizationId) {
            return NextResponse.json(
                {
                    status: "Error",
                    data: null,
                    message: "User not associated with any organization",
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const studentId = params.id;
        const { content } = await req.json();

        if (!content || content.trim() === "") {
            return NextResponse.json(
                {
                    status: "Error",
                    message: "Content is required",
                    data: null,
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const recommendationId = await createRecommendation(
            studentId,
            organizationId,
            userId,
            content.trim()
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Recommendation created successfully",
                data: { id: recommendationId },
            },
            { status: HttpStatusCode.Created }
        );
    } catch (error) {
        console.error("Error creating recommendation:", error);
        const err = error as Error;
        return NextResponse.json(
            {
                status: "Error",
                message: err?.message || "Failed to create recommendation",
                data: null,
            },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}