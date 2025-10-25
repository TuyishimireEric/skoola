import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_ToggleReviewLike, FC_ToggleGameLike } from "./services";

export const useLikeReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      gameId,
    }: {
      reviewId: string;
      gameId: string;
    }) => {
      return await FC_ToggleReviewLike(reviewId, gameId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gameReviews", variables.gameId],
      });
    },
    onError: (error) => {
      console.error("Error toggling review like:", error);
    },
  });
};

export const useLikeGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      return await FC_ToggleGameLike(gameId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gameReviews", variables.gameId],
      });
    },
    onError: (error) => {
      console.error("Error toggling game like:", error);
    },
  });
};
