import { useMutation } from "@tanstack/react-query";
import { sendForgotPassword } from "./services";
import showToast from "@/utils/showToast";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: sendForgotPassword,
    onSuccess: () => {
      showToast("Verification sent successful", "success");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      showToast("Failed to send verification code", "error");
    },
  });
};
