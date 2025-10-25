import { useQuery } from "@tanstack/react-query";
import { getTeachers } from "./services";

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await getTeachers();
      return response;
    },
    staleTime: 1000 * 60 * 60,
  });
};
