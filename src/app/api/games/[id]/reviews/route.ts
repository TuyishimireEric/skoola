import { addReview, getGameReviews } from "@/server/queries/reviews";
import {
  addReviewSchema,
  GetGameReviewsOptions,
  SortOption,
} from "@/types/Reviews";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

const parseQueryParams = (searchParams: URLSearchParams) => {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
  );

  const sortByParam = searchParams.get("sortBy");
  const validSorts: SortOption[] = [
    "newest",
    "oldest",
    "rating_high",
    "rating_low",
    "helpful",
  ];
  const sortBy =
    sortByParam && validSorts.includes(sortByParam as SortOption)
      ? (sortByParam as SortOption)
      : undefined;

  const includeUnApproved = searchParams.get("includeUnApproved") === "true";

  return { page, limit, sortBy, includeUnApproved };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getUserToken(request);

    const resolvedParams = await params;
    const gameId = resolvedParams.id;
    if (!gameId) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Game Id is missing.",
          data: null,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Parse query parameters safely
    const { searchParams } = new URL(request.url);
    const { page, limit, sortBy, includeUnApproved } =
      parseQueryParams(searchParams);

    const options: GetGameReviewsOptions = {
      page,
      limit,
      sortBy,
      includeUnApproved,
    };

    if (userId) {
      options.userId = userId;
    }

    console.log("Query options:", options); // Debug log

    const reviews = await getGameReviews(gameId, options);

    return NextResponse.json(
      {
        status: "Success",
        message: "Game reviews retrieved successfully.",
        data: reviews,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: gameId } = await params;
    if (!gameId) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Game Id is missing.",
          data: null,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = addReviewSchema.safeParse({ ...body, gameId });

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: validation.error.errors.map((err) => err.message).join(", "),
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { gameId: validatedGameId, rating, comment } = validation.data;

    const review = await addReview({
      gameId: validatedGameId,
      userId,
      rating,
      comment,
    });

    return NextResponse.json(
      {
        status: "Success",
        message: "Review added successfully.",
        data: review,
      },
      { status: HttpStatusCode.Created }
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
