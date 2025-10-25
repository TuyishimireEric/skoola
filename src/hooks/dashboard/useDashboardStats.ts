import { useQuery } from "@tanstack/react-query";
import { FC_getDashboardStats, FC_getDashboardLists } from "./services";
import { DashboardFiltersI } from "@/types/dashboard";

export const useDashboardStats = (filters: DashboardFiltersI) => {
  return useQuery({
    queryKey: ["dashboard-enhanced-stats", filters],
    queryFn: () => FC_getDashboardStats(filters),
    enabled: !!filters.organizationId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useDashboardLists = (filters: DashboardFiltersI) => {
  return useQuery({
    queryKey: ["dashboard-lists", filters],
    queryFn: () => FC_getDashboardLists(filters),
    enabled: !!filters.organizationId,
    staleTime: 1000 * 60, // 1 minute
  });
};
