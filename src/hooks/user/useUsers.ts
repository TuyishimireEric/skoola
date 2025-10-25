import { useQuery } from "@tanstack/react-query";
import { getUserList } from "./services";

export interface UseUsersProps {
  page: number;
  pageSize: number;
  searchText: string;
  role?: string;
  sort:string,
  order:string
}

export const useUsers = ({
  page,
  pageSize,
  searchText,
  role,
  sort,
  order,
}: UseUsersProps) => {
  return useQuery({
    queryKey: ["users", page, pageSize,searchText, role,sort,order],
    queryFn: async () => {
      const response = await getUserList({ page, pageSize, searchText, role ,sort,order});
      return response;
    },
    staleTime: 1000 * 60 * 1, // 1 minute expected
  });
};
