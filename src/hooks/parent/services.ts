import { AnalyticsFilter, StudentAnalyticsData } from "@/types/dashboard";
import axios from "axios";

export const FC_getStudentAnalytics = async (
  filter: AnalyticsFilter = "7d"
): Promise<StudentAnalyticsData> => {
  const response = await axios.get(`/api/dashboard/parent?filter=${filter}`);
  return response.data.data;
};

export const FC_getCustomStudentAnalytics = async ({
  filter = "7d",
  customStudentIds,
}: {
  filter?: AnalyticsFilter;
  customStudentIds?: string[];
}): Promise<StudentAnalyticsData> => {
  const response = await axios.post("/api/dashboard/parent", {
    filter,
    customStudentIds,
  });
  return response.data.data;
};
