// hooks/questions/useCreateQuestion.ts
import { QuestionDataI } from "@/types/Questions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// API function to create questions
const createQuestions = async (
  questionsData: QuestionDataI[]
) => {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questions: questionsData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create questions");
  }

  return response.json();
};

interface UseCreateQuestionReturn {
  onSubmit: (questionsData: QuestionDataI[]) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  onSuccess?: () => void;
}

export const useCreateQuestion = (): UseCreateQuestionReturn => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createQuestionsMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: createQuestions,
    onSuccess: () => {
      // Show success message
      toast.success(
        `Successfully created questions! 🎉`,
        {
          duration: 4000,
          position: "top-right",
        }
      );

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(
        error.message || "Failed to create questions. Please try again.",
        {
          duration: 4000,
          position: "top-right",
        }
      );
    },
  });

  const onSubmit = async (questionsData: QuestionDataI[]): Promise<void> => {
    try {
      // Validate questions data
      if (!questionsData || questionsData.length === 0) {
        throw new Error("No questions to create");
      }

      // Validate each question
      for (const question of questionsData) {
        if (!question.QuestionText?.trim()) {
          throw new Error("Question text is required");
        }
        if (!question.GameId?.trim()) {
          throw new Error("Course ID is required");
        }
      }

      await createQuestionsMutation(questionsData);
    } catch (error) {
      throw error;
    }
  };

  const onSuccess = () => {
    // Additional success handling can be added here
    console.log("Questions created successfully");
  };

  return {
    onSubmit,
    isPending,
    error,
    onSuccess,
  };
};
