import { useQuery } from "@tanstack/react-query";
import { getStudentList } from "./services";

export interface useStudentsProps {
  page: number;
  pageSize: number;
  searchText: string;
  sort: string;
  order: string;
  activeOnly: boolean;
  grade: string;
}

export const useStudents = ({
  page,
  pageSize,
  searchText,
  sort,
  order,
  activeOnly,
  grade,
}: useStudentsProps) => {
  return useQuery({
    queryKey: [
      "students",
      page,
      pageSize,
      searchText,
      sort,
      order,
      activeOnly,
      grade,
    ],
    queryFn: async () => {
      const response = await getStudentList({
        page,
        pageSize,
        searchText,
        sort,
        order,
        activeOnly,
        grade,
      });
      return response;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    enabled: true,
  });
};
