import { useQuery } from "@tanstack/react-query";
import { FC_getCourseById } from "./services";

export const useCourseDetails = (GameId: string) => {
  return useQuery({
    queryKey: ["courseDetails", GameId],
    queryFn: async () => {
      const response = await FC_getCourseById(GameId as string);
      return response;
    },
    enabled: !!GameId,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
