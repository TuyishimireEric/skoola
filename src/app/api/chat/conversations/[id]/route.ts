// @/app/api/chat/messages/[id]/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { deleteMessage, updateMessage } from "@/server/queries/chat";
import { getUserToken } from "@/utils/getToken";
import { updateMessageSchema } from "@/types/Chat";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await getUserToken(req);

        if (!userId) {
            return NextResponse.json(
                { status: "Error", message: "Unauthorized" },
                { status: HttpStatusCode.Unauthorized }
            );
        }

        const body = await req.json();
        const validationResult = updateMessageSchema.safeParse(body);

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

        const message = await updateMessage(
            params.id,
            validationResult.data.Content,
            userId
        );

        return NextResponse.json(
            {
                status: "Success",
                message: "Message updated successfully",
                data: message,
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

export async function DELETE(
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

        await deleteMessage(id, userId);

        return NextResponse.json(
            {
                status: "Success",
                message: "Message deleted successfully",
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