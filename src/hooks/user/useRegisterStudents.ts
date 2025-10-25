import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStudents } from "./services";
import showToast from "@/utils/showToast";
import axios from "axios";

export const useRegisterStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStudents,
    onSuccess: async() => {
      showToast("Student Registered successful", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        queryClient.invalidateQueries({ queryKey: ["users"] }),
      ]);
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
};
