import { useMutation } from "@tanstack/react-query";
import { verifyUserOTP } from "./services";
import showToast from "@/utils/showToast";

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: verifyUserOTP,
    onSuccess: () => {
      showToast("Verified successful!", "success");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      showToast("Failed to verify email", "error");
    },
  });
};
