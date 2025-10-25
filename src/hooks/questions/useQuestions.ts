import { useQuery } from "@tanstack/react-query";
import { FC_getQuestionsByGame } from "./services";

export interface UseCourseProps {
  GameId: string;
  limit: number;
  questionIds?: string[];
}

export const useQuestions = ({
  GameId,
  limit,
  questionIds,
}: UseCourseProps) => {
  return useQuery({
    queryKey: ["questions", GameId, limit, questionIds],
    queryFn: async () => {
      const response = await FC_getQuestionsByGame(GameId, limit, questionIds);
      return response;
    },
    enabled: !!GameId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};
