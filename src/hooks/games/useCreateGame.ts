import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_CreateGame } from "./services";
import axios from "axios";
import { GameDataI } from "@/types/Course";

export const useCreateGame = () => {
  const queryClient = useQueryClient();

  const createCourseMutation = useMutation({
    mutationFn: FC_CreateGame,
    onSuccess: async () => {
      showToast("Games Created successful", "success");
      queryClient.invalidateQueries({
        queryKey: ["games"],
      });
      queryClient.invalidateQueries({
        queryKey: ["adminGames"],
      });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "Registration failed";
        showToast(errorMessage, "error");
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  const onSubmit = (data: GameDataI) => {
    createCourseMutation.mutate(data);
  };

  return {
    onSubmit,
    onSuccess: createCourseMutation.isSuccess,
    isPending: createCourseMutation.isPending,
  };
};
