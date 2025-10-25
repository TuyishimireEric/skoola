import { useQuery } from "@tanstack/react-query";
import { FC_generateContent } from "./services";
import { GameDataI } from "@/types/Course";

export const useExplanation = (course: GameDataI, question: string) => {
  const prompt = `Explain the question: "${question}" to a primary school student. Use simple and easy-to-understand language suitable for young learners. The explanation should be based on the course titled "${course.Title}" under the subject "${course.Subject}".
  Use a fun, friendly tone with emojis and small icons that can be rendered in a string to make learning engaging for kids. Summarize the explanation clearly without adding an introduction.`;
  
  return useQuery({
    queryKey: ["explanation", question],
    queryFn: () => FC_generateContent(prompt),
    enabled: !!prompt,
    staleTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
