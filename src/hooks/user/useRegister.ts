import { SubmitHandler, FieldValues } from "react-hook-form";
import showToast from "@/utils/showToast";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "./services";
import axios from "axios";
import { UserType } from "@/types";
import { useState } from "react";

interface RegisterFormData extends FieldValues {
  FullName: string;
  Email?: string;
  Password?: string;
  Grade?: string;
  UserRole?: UserType;
  DateOfBirth?: string;
}

export const useRegister = () => {
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const addUsersMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async (data, variables) => {
      showToast("Registration successful", "success");

      try {
        console.log("Attempting auto-login after registration");
        console.log("Data:", data, variables);
        setUserId(data);
        setVerifyEmail(true);

      } catch (error) {
        console.log(`Error: ${error}`);
        showToast("Auto-login failed", "error");
      }
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

  const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
    addUsersMutation.mutate(data);
  };

  return {
    onSubmit,
    userId,
    isPending: addUsersMutation.isPending,
    registerError: addUsersMutation.error,
    verifyEmail,
  };
};
