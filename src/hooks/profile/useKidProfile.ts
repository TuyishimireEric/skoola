import { useQuery } from "@tanstack/react-query";
import { FC_kidProfile } from "./services";

export const useKidProfile = (userId: string) => {
  return useQuery({
    queryKey: ["kidProfile", userId],
    queryFn: async () => {
      const response = await FC_kidProfile(userId);
      return response;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
