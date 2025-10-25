import { useQuery } from "@tanstack/react-query";
import { FC_generateContent } from "./services";

export const useTestPrompt = (
  prompt: string,
  testPrompt: boolean = false
) => {
  return useQuery({
    queryKey: ["testPrompt", prompt],
    queryFn: () => FC_generateContent(prompt),
    enabled: testPrompt, // Enable when testPrompt is trues
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};