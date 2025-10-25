import { useMutation } from "@tanstack/react-query";
import { updatePassword } from "./services";
import showToast from "@/utils/showToast";

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      showToast("Password reset successful! Logging you in... 🎉", "success");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      showToast("Failed to send verification code", "error");
    },
  });
};
