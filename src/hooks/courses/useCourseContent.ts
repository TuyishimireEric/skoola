import { useQuery } from "@tanstack/react-query";
import { FC_generateContent } from "./services";
import { GameDataI, CourseSectionI } from "@/types/Course";
import { useMemo, useRef, useState, useEffect } from "react";

export const useCourseContent = (
  course: GameDataI,
  lastSection: CourseSectionI | "none"
) => {
  // Track if we've already loaded content for this component instance
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const hasLoadedContent = useRef(false);
  
  // Generate the prompt based on course and lastSection
  const currentPrompt = useMemo(() => {
    if (!course) return "";
  
    if (!lastSection || lastSection === "none") {
      return `${course.Prompt} generate only content, no introduction.`;
    }
  
    const { Score = 0, MissedQuestions = "" } = lastSection; 
    const difficulty =
      Number(Score) > 80 ? "advanced" :
      Number(Score) > 60 ? "normal" : 
      "simple";
  
    return `${course.Prompt} Previous score: ${Score}. Missed questions: ${MissedQuestions}. Generate new ${difficulty} questions to help improve the score, only content, no introduction.`;
  }, [course, lastSection]);
  
  // Set the initial prompt only once
  useEffect(() => {
    if (currentPrompt && !initialPrompt && !hasLoadedContent.current) {
      setInitialPrompt(currentPrompt);
      hasLoadedContent.current = true;
    }
  }, [currentPrompt, initialPrompt]);
  
  const queryPrompt = initialPrompt || currentPrompt;
  
  const queryKey = useMemo(() => {
    return [
      "courseContent", 
      course?.Id,
      `instance-${Math.random().toString(36).substring(2, 9)}`
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useQuery({
    queryKey: queryKey,
    queryFn: () => FC_generateContent(queryPrompt),
    enabled: !!queryPrompt,
    staleTime: Infinity, 
    gcTime: Infinity, 
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};