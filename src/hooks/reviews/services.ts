import axios from "axios";
import {
  GameReviewsResponse,
  GetGameReviewsOptions,
  GameReviewItem,
  LikeResponse,
  ApiResponse,
} from "@/types/Reviews";

export const FC_GetGameReviews = async (
  gameId: string,
  options: GetGameReviewsOptions = {}
): Promise<GameReviewsResponse> => {
  const { page = 1, limit = 10, sortBy, includeUnApproved } = options;

  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (sortBy) {
    params.append("sortBy", sortBy);
  }

  if (includeUnApproved !== undefined) {
    params.append("includeUnApproved", includeUnApproved.toString());
  }

  const response = await axios.get(
    `/api/games/${gameId}/reviews?${params.toString()}`
  );
  return response.data.data;
};

export const FC_AddReview = async (
  gameId: string,
  reviewData: {
    rating: number;
    comment?: string;
  }
): Promise<GameReviewItem> => {
  const response = await axios.post(`/api/games/${gameId}/reviews`, reviewData);
  return response.data.data;
};

export const FC_ToggleReviewLike = async (
  reviewId: string,
  gameId: string
): Promise<LikeResponse> => {
  const response = await axios.post<ApiResponse<LikeResponse>>(
    `/api/games/${gameId}/reviews/${reviewId}`
  );
  return response.data.data;
};

export const FC_ToggleGameLike = async (
  gameId: string
): Promise<LikeResponse> => {
  const response = await axios.post<ApiResponse<LikeResponse>>(
    `/api/games/${gameId}/like`
  );
  return response.data.data;
};
