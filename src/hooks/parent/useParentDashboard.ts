import { AnalyticsFilter } from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import {
  FC_getCustomStudentAnalytics,
  FC_getStudentAnalytics,
} from "./services";

export const useStudentAnalytics = (filter: AnalyticsFilter = "7d") => {
  return useQuery({
    queryKey: ["studentAnalytics", filter],
    queryFn: async () => {
      const response = await FC_getStudentAnalytics(filter);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useCustomStudentAnalytics = (
  filter: AnalyticsFilter = "7d",
  customStudentIds?: string[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["customStudentAnalytics", filter, customStudentIds],
    queryFn: async () => {
      const response = await FC_getCustomStudentAnalytics({
        filter,
        customStudentIds,
      });
      return response;
    },
    enabled: enabled && !!customStudentIds?.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
