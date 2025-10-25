import { useQuery } from "@tanstack/react-query";
import { FC_getDailyRecommendations } from "./services";

export const useDailyRecommendations = (studentId: string) => {
  return useQuery({
    queryKey: ["dailyRecommendations", studentId],
    queryFn: async () => {
      const response = await FC_getDailyRecommendations(studentId);
      return response;
    },
    enabled: !!studentId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
