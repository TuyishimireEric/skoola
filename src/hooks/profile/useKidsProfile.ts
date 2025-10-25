import { useQuery } from "@tanstack/react-query";
import { FC_kidsProfile } from "./services";

export const useKidsProfile = () => {
  return useQuery({
    queryKey: ["kidsProfile"],
    queryFn: async () => {
      const response = await FC_kidsProfile();
      return response;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
