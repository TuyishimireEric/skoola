import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "./services";

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await getUserProfile(userId);
      return response;
    },
    enabled: !!userId,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
