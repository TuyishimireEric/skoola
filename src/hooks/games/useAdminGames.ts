import { useQuery } from "@tanstack/react-query";
import { FC_GetAdminGames } from "./services";

export interface UseGameProps {
  page: number;
  pageSize: number;
  searchText: string;
  subject?: string;
  grade?: string;
}

export const useAdminGames = ({
  page,
  pageSize,
  searchText,
  subject,
  grade,
}: UseGameProps) => {
  return useQuery({
    queryKey: ["adminGames", page, pageSize, searchText, subject, grade],
    queryFn: async () => {
      const response = await FC_GetAdminGames(
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
