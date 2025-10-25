import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { updateUser, updateUserProfile } from "./services";
import showToast from "@/utils/showToast";

export const useUpdateUser = (onClose?: () => void) => {
  const { update } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async (data) => {
      console.log("User role updated successfully:", data);
      showToast("Profile Updated Successfully... 🎉", "success");

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      // Update the session to reflect the new user role
      // This will refresh the session on both client and server side
      await update();

      if (onClose) {
        onClose();
      }

      // The update() function will:
      // 1. Trigger a new session fetch from the server
      // 2. Update the client-side session state
      // 3. Ensure server-side session reflects the database changes
    },
    onError: (error) => {
      showToast("Failed to Update Profile 🎉", "error");
      console.error("Error updating user role:", error);
    },
  });
};

export const useUpdateUserProfile = (onClose?: () => void) => {
  const { update } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: async (data) => {
      console.log("User role updated successfully:", data);
      showToast("Profile Updated Successfully... 🎉", "success");

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      // Update the session to reflect the new user role
      // This will refresh the session on both client and server side
      await update();

      if (onClose) {
        onClose();
      }

      // The update() function will:
      // 1. Trigger a new session fetch from the server
      // 2. Update the client-side session state
      // 3. Ensure server-side session reflects the database changes
    },
    onError: (error) => {
      showToast("Failed to Update Profile 🎉", "error");
      console.error("Error updating user role:", error);
    },
  });
};

