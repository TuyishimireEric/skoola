import { useMutation } from "@tanstack/react-query";
import { sendVerification } from "./services";
import showToast from "@/utils/showToast";

export const useSendVerification = () => {
  return useMutation({
    mutationFn: sendVerification,
    onSuccess: (data) => {
      console.log("User role updated successfully:", data);
      showToast("Verification sent successful", "success");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      showToast("Failed to send verification code", "error");
    },
  });
};
