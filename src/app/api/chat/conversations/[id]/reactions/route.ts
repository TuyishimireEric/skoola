import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { addReaction } from "@/server/queries/chat";
import { getUserToken } from "@/utils/getToken";

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

        const { emoji } = await req.json();

        if (!emoji || typeof emoji !== "string") {
            return NextResponse.json(
                { status: "Error", message: "Invalid emoji" },
                { status: HttpStatusCode.BadRequest }
            );
        }

        const result = await addReaction(id, emoji, userId);

        return NextResponse.json(
            {
                status: "Success",
                message: `Reaction ${result.action}`,
                data: result,
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