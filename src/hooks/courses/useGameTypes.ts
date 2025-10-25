import { useQuery } from "@tanstack/react-query";
import { FC_GetGameTypes } from "./services";

export const useGameTypes = () => {
  return useQuery({
    queryKey: ["GameTypes"],
    queryFn: async () => {
      const response = await FC_GetGameTypes();
      return response;
    },  
    staleTime: 1000 * 60 * 60 * 24, 
  });
};
