import { useQuery } from "@tanstack/react-query";
import { FC_getRoleAccess } from "./services";

export const useRoleAccess = (roleId: string) => {
  return useQuery({
    queryKey: ["Workflows", roleId],
    queryFn: () => FC_getRoleAccess(roleId),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false, 
    retry: 2
  });
};