import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FC_updateOrganizationUser } from "./services";
import { updateOrganizationUserI } from "@/types";

export const useUpdateOrganizationUser = () => {
  const queryClient = useQueryClient();

  const updateOrganizationUser = useMutation({
    mutationFn: FC_updateOrganizationUser,
    onSuccess: async () => {
      showToast("Class updated successful", "success");
      queryClient.invalidateQueries({
        queryKey: ["organizationUser"],
      });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "Failed to update class";
        showToast(errorMessage, "error");
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  const onSubmit = (formData: updateOrganizationUserI) => {
    updateOrganizationUser.mutate(formData);
  };

  return {
    onSubmit,
    onSuccess: updateOrganizationUser.isSuccess,
    isPending: updateOrganizationUser.isPending,
  };
};
