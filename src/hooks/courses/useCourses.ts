import { useQuery } from "@tanstack/react-query";
import { FC_GetCourses } from "./services";

export interface UseCourseProps {
  page: number;
  pageSize: number;
  searchText: string;
  organizationId: string;
  classId: string;
}

export const useCourses = ({
  page,
  pageSize,
  searchText,
  organizationId,
  classId,
}: UseCourseProps) => {
  return useQuery({
    queryKey: ["courses", page, pageSize, searchText, organizationId, classId],
    queryFn: async () => {
      const response = await FC_GetCourses(page, pageSize, searchText, organizationId, classId);
      return response;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 60 * 1, // 1 hours expected
    retry: 1,
  });
};
