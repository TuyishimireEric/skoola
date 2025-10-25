import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import { db } from "../db";
import { GameLike, GameReview, GameReviewLike, User } from "../db/schema";
import {
  GameReviewsResponse,
  GetGameReviewsOptions,
  SortOption,
} from "@/types/Reviews";

export async function addReview(data: {
  gameId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
}) {
  // Validate rating is between 1-5
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check if user already reviewed this game
  const existingReview = await db
    .select()
    .from(GameReview)
    .where(
      and(
        eq(GameReview.GameId, data.gameId),
        eq(GameReview.UserId, data.userId)
      )
    )
    .limit(1);

  if (existingReview.length > 0) {
    throw new Error("User has already reviewed this game");
  }

  const [review] = await db
    .insert(GameReview)
    .values({
      GameId: data.gameId,
      UserId: data.userId,
      Rating: data.rating,
      Comment: data.comment,
    })
    .returning();

  return review;
}

// Update an existing review
export async function updateReview(
  reviewId: string,
  userId: string,
  data: {
    rating?: number;
    comment?: string;
  }
) {
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  const [updatedReview] = await db
    .update(GameReview)
    .set({
      ...data,
      UpdatedOn: new Date(),
    })
    .where(
      and(
        eq(GameReview.Id, reviewId),
        eq(GameReview.UserId, userId) // Ensure user owns the review
      )
    )
    .returning();

  if (!updatedReview) {
    throw new Error("Review not found or user not authorized");
  }

  return updatedReview;
}

export async function deleteReview(reviewId: string, userId: string) {
  const [deletedReview] = await db
    .delete(GameReview)
    .where(and(eq(GameReview.Id, reviewId), eq(GameReview.UserId, userId)))
    .returning();

  if (!deletedReview) {
    throw new Error("Review not found or user not authorized");
  }

  return deletedReview;
}

export async function toggleReviewLike(reviewId: string, userId: string) {
  // Check if user already liked this review
  const existingLike = await db
    .select()
    .from(GameReviewLike)
    .where(
      and(
        eq(GameReviewLike.ReviewId, reviewId),
        eq(GameReviewLike.UserId, userId)
      )
    )
    .limit(1);

  if (existingLike.length > 0) {
    // Unlike - remove the like
    await db
      .delete(GameReviewLike)
      .where(
        and(
          eq(GameReviewLike.ReviewId, reviewId),
          eq(GameReviewLike.UserId, userId)
        )
      );

    // Decrement helpful count
    await db
      .update(GameReview)
      .set({
        HelpfulCount: sql`${GameReview.HelpfulCount} - 1`,
        UpdatedOn: new Date(),
      })
      .where(eq(GameReview.Id, reviewId));

    return { action: "unliked" };
  } else {
    // Like - add the like
    await db.insert(GameReviewLike).values({
      ReviewId: reviewId,
      UserId: userId,
    });

    // Increment helpful count
    await db
      .update(GameReview)
      .set({
        HelpfulCount: sql`${GameReview.HelpfulCount} + 1`,
        UpdatedOn: new Date(),
      })
      .where(eq(GameReview.Id, reviewId));

    return { action: "liked" };
  }
}

export async function toggleGameLike(gameId: string, userId: string) {
  const existingLike = await db
    .select()
    .from(GameLike)
    .where(and(eq(GameLike.GameId, gameId), eq(GameLike.UserId, userId)))
    .limit(1);

  if (existingLike.length > 0) {
    // Unlike
    await db
      .delete(GameLike)
      .where(and(eq(GameLike.GameId, gameId), eq(GameLike.UserId, userId)));
    return { action: "unliked" };
  } else {
    // Like
    const [like] = await db
      .insert(GameLike)
      .values({
        GameId: gameId,
        UserId: userId,
      })
      .returning();
    return { action: "liked", like };
  }
}

export async function getGameReviews(
  gameId: string,
  options: GetGameReviewsOptions = {}
): Promise<GameReviewsResponse> {
  const {
    page = 1,
    limit = 10,
    sortBy = "newest",
    userId,
    includeUnApproved = false,
  } = options;

  // Validate inputs
  if (page < 1) throw new Error("Page must be >= 1");
  if (limit < 1 || limit > 100)
    throw new Error("Limit must be between 1 and 100");
  if (!gameId?.trim()) throw new Error("Game ID is required");

  const offset = (page - 1) * limit;

  // Build sort condition with type safety
  const getSortOrder = (sortBy: SortOption) => {
    switch (sortBy) {
      case "oldest":
        return asc(GameReview.CreatedOn);
      case "rating_high":
        return desc(GameReview.Rating);
      case "rating_low":
        return asc(GameReview.Rating);
      case "helpful":
        return desc(GameReview.HelpfulCount);
      case "newest":
      default:
        return desc(GameReview.CreatedOn);
    }
  };

  // Build where conditions
  const baseWhereCondition = includeUnApproved
    ? eq(GameReview.GameId, gameId)
    : and(eq(GameReview.GameId, gameId), eq(GameReview.IsApproved, true));

  // Optimize with single transaction and better parallel execution
  const [reviews, reviewStats, gameLikeInfo, ratingDistribution] =
    await Promise.all([
      // 1. Get paginated reviews with optimized select
      db
        .select({
          id: GameReview.Id,
          rating: GameReview.Rating,
          comment: GameReview.Comment,
          helpfulCount: GameReview.HelpfulCount,
          createdOn: GameReview.CreatedOn,
          updatedOn: GameReview.UpdatedOn,
          isApproved: GameReview.IsApproved,
          isFlagged: GameReview.IsFlagged,
          user: {
            id: User.Id,
            fullName: User.FullName,
            imageUrl: User.ImageUrl,
          },
          isLikedByCurrentUser: userId
            ? sql<boolean>`CASE WHEN EXISTS(
              SELECT 1 FROM ${GameReviewLike} 
              WHERE ${GameReviewLike.ReviewId} = ${GameReview.Id} 
              AND ${GameReviewLike.UserId} = ${userId}
            ) THEN true ELSE false END`
            : sql<boolean>`false`,
        })
        .from(GameReview)
        .innerJoin(User, eq(GameReview.UserId, User.Id)) // Use inner join to ensure user exists
        .where(baseWhereCondition)
        .orderBy(getSortOrder(sortBy))
        .limit(limit)
        .offset(offset),

      // 2. Get review statistics - Fixed the type casting issue
      db
        .select({
          averageRating: sql<string>`COALESCE(ROUND(AVG(CAST(${GameReview.Rating} AS DECIMAL(3,2))), 1), 0)`,
          totalReviews: count(GameReview.Id),
        })
        .from(GameReview)
        .where(baseWhereCondition)
        .then((result) => result[0]),

      // 3. Get game like information (optimized single query)
      db
        .select({
          likeCount: count(GameLike.Id),
          isLikedByUser: userId
            ? sql<boolean>`CASE WHEN EXISTS(
              SELECT 1 FROM ${GameLike} gl2 
              WHERE gl2.${GameLike.GameId} = ${gameId} 
              AND gl2.${GameLike.UserId} = ${userId}
            ) THEN true ELSE false END`
            : sql<boolean>`false`,
        })
        .from(GameLike)
        .where(eq(GameLike.GameId, gameId))
        .then((result) => result[0] || { likeCount: 0, isLikedByUser: false }),

      // 4. Get rating distribution for better analytics
      db
        .select({
          rating: GameReview.Rating,
          count: count(GameReview.Id),
        })
        .from(GameReview)
        .where(baseWhereCondition)
        .groupBy(GameReview.Rating),
    ]);

  // Process rating distribution
  const distribution = ratingDistribution.reduce(
    (acc, item) => {
      acc[item.rating as keyof typeof acc] = item.count;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  const totalPages = Math.ceil(reviewStats.totalReviews / limit);

  // Safely handle the averageRating conversion
  const averageRatingValue =
    typeof reviewStats.averageRating === "string"
      ? reviewStats.averageRating
      : typeof reviewStats.averageRating === "number"
      ? reviewStats.averageRating
      : "0.0";

  return {
    reviews: reviews.map((review) => ({
      ...review,
      user: {
        id: review.user.id,
        fullName: review.user.fullName,
        imageUrl: review.user.imageUrl,
      },
    })),

    averageRating: {
      score: averageRatingValue,
      totalReviews: reviewStats.totalReviews,
      distribution,
    },

    gameLikes: {
      count: gameLikeInfo.likeCount,
      isLikedByCurrentUser: gameLikeInfo.isLikedByUser,
    },

    pagination: {
      page,
      limit,
      totalCount: reviewStats.totalReviews,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
