import { useQuery } from "@tanstack/react-query";
import { getSubscriptions } from "./services";

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await getSubscriptions();
      return response;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};
