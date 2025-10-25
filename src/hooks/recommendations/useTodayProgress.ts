import { useQuery } from "@tanstack/react-query";
import { FC_getTodayCompletedCourseSections } from "./services";

export const useDailyProgress = (
  recommendedGameIds: string[],
  studentId: string
) => {
  return useQuery({
    queryKey: ["todayProgress", studentId],
    queryFn: async () => {
      const response = await FC_getTodayCompletedCourseSections(
        recommendedGameIds,
        studentId
      );
      return response;
    },
    enabled: recommendedGameIds.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
