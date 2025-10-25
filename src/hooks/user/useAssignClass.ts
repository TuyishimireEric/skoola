import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignClass } from "./services";
import showToast from "@/utils/showToast";

export const useAssignClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      UserId,
      ClassId,
    }: {
      UserId: string;
      ClassId: string;
    }) => assignClass({ UserId, ClassId }),

    onError: (error) => {
      console.error("Error verifying user:", error);
      showToast("Failed to assign class", "error");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast("Class Assigned successful", "success");
    },
  });
};
