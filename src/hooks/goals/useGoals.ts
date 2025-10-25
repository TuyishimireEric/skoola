import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_createGoals, FC_getGoals } from "./services";
import { CreateGoalInputI } from "@/types/Goals";

export const useGoals = (year: number, month: number, studentId: string) => {
  return useQuery({
    queryKey: ["goals", year, month, studentId],
    queryFn: async () => {
      const response = await FC_getGoals(year, month, studentId);
      return response;
    },
    enabled: !!studentId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Create goal mutation
export const useCreateGoal = (studentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fromData: CreateGoalInputI) => {
      const response = await FC_createGoals(fromData, studentId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["goals"],
      });
    },
  });
};
