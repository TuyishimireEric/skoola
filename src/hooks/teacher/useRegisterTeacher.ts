import { SubmitHandler, FieldValues } from "react-hook-form";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { registerTeacher } from "./services";

interface RegisterTeacherFormData extends FieldValues {
  FullName: string;
  Email: string;
}

export const useRegisterTeacher = () => {
  const queryClient = useQueryClient();

  const addUsersMutation = useMutation({
    mutationFn: registerTeacher,
    onSuccess: async () => {
      showToast("Invitation sent successful!", "success");
      queryClient.invalidateQueries({
        queryKey: ["teachers"],
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

  const onSubmit: SubmitHandler<RegisterTeacherFormData> = (data) => {
    addUsersMutation.mutate(data);
  };

  return {
    onSubmit,
    onSuccess: addUsersMutation.isSuccess,
    isPending: addUsersMutation.isPending,
    registerError: addUsersMutation.error,
  };
};
