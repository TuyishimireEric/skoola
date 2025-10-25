import { useQuery } from "@tanstack/react-query";
import { FC_getOrganizationUser } from "./services";

export const useOrganizationUser = () => {
  return useQuery({
    queryKey: ["organizationUser"],
    queryFn: async () => {
      const response = await FC_getOrganizationUser();
      return response;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
