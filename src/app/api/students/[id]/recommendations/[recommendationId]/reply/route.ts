import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getUserToken } from "@/utils/getToken";
import { createReply } from "@/server/queries/StudentRecommendations";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; recommendationId: string }> }
) {
    try {
        const { userId } = await getUserToken(req);

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

        const { recommendationId } = await params;

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

        const replyId = await createReply(
            recommendationId,
            userId,
            content.trim()
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Reply created successfully",
                data: { id: replyId },
            },
            { status: HttpStatusCode.Created }
        );
    } catch (error) {
        console.error("Error creating reply:", error);
        const err = error as Error;
        return NextResponse.json(
            {
                status: "Error",
                message: err?.message || "Failed to create reply",
                data: null,
            },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}