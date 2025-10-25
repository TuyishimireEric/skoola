import { useQuery } from "@tanstack/react-query";
import { FC_getStudentGamesSection } from "./services";

export interface UseCourseProps {
  GameId: string;
  studentId: string;
}

export const useCourseSection = ({ GameId, studentId }: UseCourseProps) => {
  return useQuery({
    queryKey: ["coursesSections", GameId, studentId],
    queryFn: async () => {
      const response = await FC_getStudentGamesSection(GameId, studentId);
      return response;
    },
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
    enabled: !!studentId,
  });
};
