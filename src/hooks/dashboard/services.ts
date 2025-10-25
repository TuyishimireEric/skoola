import {
  AdminDashboardStatsI,
  EnhancedDashboardStatsI,
  DashboardListsI,
  DashboardFiltersI,
} from "@/types/dashboard";
import axios from "axios";

// Enhanced dashboard stats with filters (stats + trends only)
export const FC_getDashboardStats = async (
  filters: DashboardFiltersI
): Promise<EnhancedDashboardStatsI> => {
  const response = await axios.get("/api/dashboard/stats", {
    params: filters,
  });
  return response.data.data;
};

// Dashboard lists (all charts, rankings, activities data)
export const FC_getDashboardLists = async (
  filters: DashboardFiltersI
): Promise<DashboardListsI> => {
  const response = await axios.get("/api/dashboard/lists", {
    params: filters,
  });
  return response.data.data;
};

// Student game report (existing - keep as is)
export const FC_getStudentGameReport = async (data: {
  organizationId: string;
}): Promise<AdminDashboardStatsI> => {
  const response = await axios.get("/api/dashboard/course", { params: data });
  return response.data.data;
};
