import { useMutation } from "@tanstack/react-query";

import showToast from "@/utils/showToast";
import { contactUs } from "./services";

export const useContactUs = () => {
  return useMutation({
    mutationFn: contactUs,
    onSuccess: () => {
     
      showToast("Message sent successful", "success");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      showToast("Failed to send message", "error");
    },
  });
};
