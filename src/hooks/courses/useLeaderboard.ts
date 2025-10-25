import { useQuery } from "@tanstack/react-query";
import { FC_getLeaderBoard } from "./services";

export interface UseLeaderBoardProps {
  range: string;
  GameId: string;
}

export const useLeaderBoard = ({ range, GameId }: UseLeaderBoardProps) => {
  return useQuery({
    queryKey: ["leaderboard", range, GameId],
    queryFn: async () => {
      const response = await FC_getLeaderBoard(GameId, range);
      return response.leaderboard;
    },
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
  });
};
