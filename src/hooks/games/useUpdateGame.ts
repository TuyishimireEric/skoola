import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GameDataI } from "@/types/Course";
import { FC_UpdateGame } from "./services";

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: FC_UpdateGame,
    onSuccess: async (_, variables) => {
      showToast("Game Updated successfully", "success");
      queryClient.invalidateQueries({
        queryKey: ["games"],
      });

      queryClient.invalidateQueries({
        queryKey: ["adminGames"],
      });
      queryClient.invalidateQueries({
        queryKey: ["game", variables.GameId],
      });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || "Update failed";
        showToast(errorMessage, "error");
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  const onSubmit = (formData: GameDataI, GameId: string) => {
    updateCourseMutation.mutate({ formData, GameId });
  };

  return {
    onSubmit,
    onSuccess: updateCourseMutation.isSuccess,
    isPending: updateCourseMutation.isPending,
  };
};
