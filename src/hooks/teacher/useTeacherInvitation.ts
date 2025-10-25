import { useQuery } from "@tanstack/react-query";
import { getTeacherInvitation } from "./services";

export interface UseCourseProps {
  token: string;
}

export const useTeacherInvitation = ({ token }: UseCourseProps) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const response = await getTeacherInvitation(token);
      return response;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60 * 5,
    retry: 1,
  });
};
