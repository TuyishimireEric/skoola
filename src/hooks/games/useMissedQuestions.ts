import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FC_AddMissedQuestions,
  FC_GetMissedQuestions,
  FC_UpdatePassedQuestions,
  UpdatePassedQuestionsData,
} from "./services";
import axios from "axios";
import {
  AddMissedQuestionsData,
  GameMissedQuestionsI,
  GetMissedQuestionsParams,
} from "@/types/MissedQuestions";

// Hook for adding missed questions
export const useAddMissedQuestions = () => {
  const queryClient = useQueryClient();

  const addMissedQuestions = useMutation({
    mutationFn: FC_AddMissedQuestions,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["missedQuestions"] }),
      ]);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "Failed to add missed questions";
        console.error("Error:", errorMessage);
      }
    },
  });

  const onSubmit = (formData: AddMissedQuestionsData) => {
    addMissedQuestions.mutate(formData);
  };

  return {
    onSubmit,
    onSuccess: addMissedQuestions.isSuccess,
    isPending: addMissedQuestions.isPending,
    isError: addMissedQuestions.isError,
    error: addMissedQuestions.error,
    data: addMissedQuestions.data,
  };
};

// Hook for getting missed questions
export const useGetMissedQuestions = (
  params: GetMissedQuestionsParams = {},
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) => {
  return useQuery<GameMissedQuestionsI[]>({
    queryKey: ["missedQuestions", params],
    queryFn: () => FC_GetMissedQuestions(params),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval,
  });
};

// Hook for getting missed questions with specific student ID
export const useGetStudentMissedQuestions = (
  studentId: string,
  dateRange: "7d" | "30d" | "last_month" = "7d",
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery<GameMissedQuestionsI[]>({
    queryKey: ["missedQuestions", studentId, dateRange],
    queryFn: () => FC_GetMissedQuestions({ studentId, dateRange }),
    enabled: (options?.enabled ?? true) && !!studentId,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdatePassedQuestions = () => {
  const queryClient = useQueryClient();

  const updatePassedQuestions = useMutation({
    mutationFn: FC_UpdatePassedQuestions,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["missedQuestions"] }),
      ]);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "Failed to update passed questions";
        console.error("Error:", errorMessage);
      }
    },
  });

  const onSubmit = (formData: UpdatePassedQuestionsData) => {
    updatePassedQuestions.mutate(formData);
  };

  return {
    onSubmit,
    onSuccess: updatePassedQuestions.isSuccess,
    isPending: updatePassedQuestions.isPending,
    isError: updatePassedQuestions.isError,
    error: updatePassedQuestions.error,
    data: updatePassedQuestions.data,
  };
};
