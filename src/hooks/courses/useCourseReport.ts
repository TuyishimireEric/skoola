import { useQuery } from "@tanstack/react-query";
import { FC_getCourseReport } from "./services";

export interface UseCourseProps {
  GameId: string;
}

export const useCourseReport = ({ GameId }: UseCourseProps) => {
  return useQuery({
    queryKey: ["courseDetails", GameId],
    queryFn: async () => {
      const response = await FC_getCourseReport(GameId);
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: !!GameId,
  });
};
