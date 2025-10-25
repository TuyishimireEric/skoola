import { useQuery } from "@tanstack/react-query";
import { FC_GetGame, FC_GetGames } from "./services";

export interface UseGameProps {
  page: number;
  pageSize: number;
  searchText: string;
  subject?: string;
  grade?: string;
}

export const useGames = ({
  page,
  pageSize,
  searchText,
  subject,
  grade,
}: UseGameProps) => {
  return useQuery({
    queryKey: ["games", page, pageSize, searchText, subject, grade],
    queryFn: async () => {
      const response = await FC_GetGames(
        page,
        pageSize,
        searchText,
        subject,
        grade
      );
      return response;
    },
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
  });
};

export const useGameById = (gameId: string) => {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const response = await FC_GetGame(gameId);
      return response;
    },
    enabled: !!gameId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
  });
};
