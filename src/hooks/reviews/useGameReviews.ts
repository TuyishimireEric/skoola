import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_GetGameReviews, FC_AddReview } from "./services";
import { GetGameReviewsOptions, SortOption } from "@/types/Reviews";

export interface UseGameReviewsProps {
  gameId: string;
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  includeUnApproved?: boolean;
}

export const useGameReviews = ({
  gameId,
  page = 1,
  limit = 10,
  sortBy,
  includeUnApproved,
}: UseGameReviewsProps) => {
  return useQuery({
    queryKey: ["gameReviews", gameId, page, limit, sortBy, includeUnApproved],
    queryFn: async () => {
      const options: GetGameReviewsOptions = {
        page,
        limit,
        sortBy,
        includeUnApproved,
      };
      const response = await FC_GetGameReviews(gameId, options);
      return response;
    },
    enabled: !!gameId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      rating,
      comment,
    }: {
      gameId: string;
      rating: number;
      comment?: string;
    }) => {
      return await FC_AddReview(gameId, { rating, comment });
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch game reviews
      queryClient.invalidateQueries({
        queryKey: ["gameReviews", variables.gameId],
      });
    },
    onError: (error) => {
      console.error("Error adding review:", error);
    },
  });
};
