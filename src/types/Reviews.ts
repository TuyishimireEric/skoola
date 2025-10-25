import { z } from "zod";

export const addReviewSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const queryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  sortBy: z
    .enum(["newest", "oldest", "rating_high", "rating_low", "helpful"])
    .optional(),
  includeUnApproved: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export const toggleLikeSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
});

export const toggleGameLikeSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
});

export interface LikeResponse {
  action: "liked" | "unliked";
}

export interface ApiResponse<T> {
  status: "Success" | "Error";
  message: string;
  data: T;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "rating_high"
  | "rating_low"
  | "helpful";

export interface GetGameReviewsOptions {
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  userId?: string;
  includeUnApproved?: boolean; // For admin views
}

export interface ReviewUser {
  id: string;
  fullName: string | null;
  imageUrl: string | null;
}

export interface GameReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  helpfulCount: number;
  createdOn: Date;
  updatedOn: Date | null;
  isApproved: boolean;
  isFlagged: boolean;
  user: ReviewUser;
  isLikedByCurrentUser: boolean;
}

export interface GameRatingStats {
  score: string;
  totalReviews: number;
  distribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface GameLikesInfo {
  count: number;
  isLikedByCurrentUser: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GameReviewsResponse {
  reviews: GameReviewItem[];
  averageRating: GameRatingStats;
  gameLikes: GameLikesInfo;
  pagination: PaginationInfo;
}
