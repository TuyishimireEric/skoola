import { useQuery } from "@tanstack/react-query";
import { getClasses } from "./services";

export const useClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const response = await getClasses();
      return response;
    },
    staleTime: 1000 * 60 * 60,
  });
};
