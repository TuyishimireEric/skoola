import { SubmitHandler, FieldValues } from "react-hook-form";
import showToast from "@/utils/showToast";
import { useMutation } from "@tanstack/react-query";
import { verifyUser } from "./services";
import axios from "axios";
import { signIn } from "next-auth/react";

interface RegisterFormData extends FieldValues {
  UserId: string;
  Token: string;
}

export const useVerify = ({
  email,
  password,
  onClose,
  setCurrentStep,
}: {
  email: string;
  password: string;
  onClose: () => void;
  setCurrentStep: (step: number) => void;
}) => {
  const verifyUsersMutation = useMutation({
    mutationFn: verifyUser,
    onSuccess: async () => {
      showToast("Verified successful", "success");
      setCurrentStep(5);

      try {
        let result = null;

        result = await signIn("credentials", {
          redirect: false,
          identifier: email,
          password: password,
          authType: "regular",
        });

        if (result?.error) {
          showToast(
            "Login failed after registration: " + result.error,
            "error"
          );
          return;
        }

        if (result?.ok) {
          onClose();
        }
      } catch (error) {
        console.log(`Error: ${error}`);
        showToast("Account verification failed", "error");
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

  const onVerify: SubmitHandler<RegisterFormData> = (data) => {
    verifyUsersMutation.mutate(data);
  };

  return {
    onVerify,
    isPending: verifyUsersMutation.isPending,
    verifyError: verifyUsersMutation.error,
  };
};
