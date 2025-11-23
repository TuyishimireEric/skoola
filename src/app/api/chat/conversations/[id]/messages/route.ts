// @/app/api/chat/conversations/[id]/messages/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
    getConversationMessages,
    sendMessage,
    markMessagesAsRead,
} from "@/server/queries/chat";
import { getUserToken } from "@/utils/getToken";
import { sendMessageSchema } from "@/types/Chat";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getUserToken(req);
        const { id } = await params;


        if (!userId) {
            return NextResponse.json(
                { status: "Error", message: "Unauthorized" },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const messages = await getConversationMessages(
            id,
            userId,
            limit,
            offset
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Messages fetched successfully",
                data: messages,
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getUserToken(req);
        const { id } = await params;

        if (!userId) {
            return NextResponse.json(
                { status: "Error", message: "Unauthorized" },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const body = await req.json();
        const validationResult = sendMessageSchema.safeParse({
            ...body,
            ConversationId: id,
        });

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

        const message = await sendMessage(validationResult.data, userId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Message sent successfully",
                data: message,
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await getUserToken(req);
        const { id } = await params;


        if (!userId) {
            return NextResponse.json(
                { status: "Error", message: "Unauthorized" },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        await markMessagesAsRead(id, userId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Messages marked as read",
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