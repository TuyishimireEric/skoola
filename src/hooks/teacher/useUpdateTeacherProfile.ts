import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { updateTeacherProfile } from "./services";
import showToast from "@/utils/showToast";

export const useUpdateTeacher = () => {
  const { update } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeacherProfile,
    onSuccess: async () => {
      showToast("Profile Updated Successfully... 🎉", "success");

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      // Update the session to reflect the new user role
      // This will refresh the session on both client and server side
      await update();
    },
    onError: (error) => {
      showToast("Failed to Update Profile 🎉", "error");
      console.error("Error updating user role:", error);
    },
  });
};
