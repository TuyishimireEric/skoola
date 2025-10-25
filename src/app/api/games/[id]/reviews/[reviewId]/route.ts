import { toggleReviewLike } from "@/server/queries/reviews";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { userId, organizationId } = await getUserToken(request);

    if (!userId || !organizationId) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Please Login!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;
    if (!reviewId) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Review Id is missing.",
          data: null,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const result = await toggleReviewLike(reviewId, userId);

    return NextResponse.json(
      {
        status: "Success",
        message: `Review ${result.action} successfully.`,
        data: result,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    const err = error as Error;
    console.error("API Error:", err);
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: `Internal server error: ${err.message}`,
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
