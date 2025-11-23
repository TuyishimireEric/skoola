import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
    getUserConversations,
    createConversation,
} from "@/server/queries/chat";
import { getUserToken } from "@/utils/getToken";
import { createConversationSchema } from "@/types/Chat";

export async function GET(req: NextRequest) {
    try {
        const { userId, organizationId } = await getUserToken(req);

        if (!userId || !organizationId) {
            return NextResponse.json(
                { status: "Error", message: "Unauthorized" },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const conversations = await getUserConversations(userId, organizationId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Conversations fetched successfully",
                data: conversations,
            },
            { status: HttpStatusCode.Ok }
        );
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { status: "Error", message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, organizationId } = await getUserToken(req);

        if (!userId || !organizationId) {
            return NextResponse.json(
                { status: "Error", message: "Unauthorized" },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const body = await req.json();
        const validationResult = createConversationSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    status: "Error",
                    message: validationResult.error.errors
                        .map((err) => err.message)
                        .join(", "),
                },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const conversation = await createConversation(
            validationResult.data,
            userId,
            organizationId
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Conversation created successfully",
                data: conversation,
            },
            { status: HttpStatusCode.Created }
        );
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json(
            { status: "Error", message: error.message },
            { status: HttpStatusCode.InternalServerError }
        );
    }
}