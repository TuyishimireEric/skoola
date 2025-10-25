import { SubmitHandler, FieldValues } from "react-hook-form";
import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStudent } from "./services";
import axios from "axios";
import { useState } from "react";
import { NewUserInterface } from "@/types";

interface RegisterStudentFormData extends FieldValues {
  FullName: string;
  Password?: string;
  DateOfBirth?: string;
}

export const useRegisterStudent = () => {
  const [student, setStudent] = useState<NewUserInterface | null>(null);

  const queryClient = useQueryClient();

  const addUsersMutation = useMutation({
    mutationFn: registerStudent,
    onSuccess: async (data) => {
      showToast("Student Registered successful", "success");
      queryClient.invalidateQueries({
        queryKey: ["kidsProfile"],
      });
      setStudent(data);
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

  const onSubmit: SubmitHandler<RegisterStudentFormData> = (data) => {
    addUsersMutation.mutate(data);
  };

  return {
    onSubmit,
    student,
    isPending: addUsersMutation.isPending,
    registerError: addUsersMutation.error,
  };
};
