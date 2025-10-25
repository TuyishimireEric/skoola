import { useQuery } from "@tanstack/react-query";
import { FC_getStudentGameReport } from "./services";

export const useStudentGameReport = (organizationId: string) => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await FC_getStudentGameReport({ organizationId });
      return response;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60, // 1 minutes
  });
};
