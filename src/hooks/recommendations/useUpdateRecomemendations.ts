import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_UpdateRecommendations } from "./services";
import axios from "axios";

export const useUpdateRecommendations = () => {
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: FC_UpdateRecommendations,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyRecommendations"],
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

  const onSubmit = (data: {
    recommendations: string;
    recommendationId: string;
  }) => {
    updateCourseMutation.mutate(data);
  };

  return {
    onSubmit,
    onSuccess: updateCourseMutation.isSuccess,
    isPending: updateCourseMutation.isPending,
  };
};
