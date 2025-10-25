import { CreateGoalInputI, GoalDataI } from "@/types/Goals";
import axios from "axios";

import { format, startOfMonth, endOfMonth } from "date-fns";

export const FC_getGoals = async (
  year: number,
  month: number,
  studentId: string
): Promise<GoalDataI[]> => {
  const startDate = format(startOfMonth(new Date(year, month)), "yyyy-MM-dd");
  const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");
  const response = await axios.get(`/api/goals`, {
    params: { startDate, endDate, userId: studentId },
  });
  return response.data.data;
};

export const FC_createGoals = async (
  formData: CreateGoalInputI,
  studentId: string
): Promise<GoalDataI> => {
  // Fix: Pass userId as a query parameter in the URL
  const response = await axios.post(`/api/goals?userId=${studentId}`, formData);
  return response.data.data;
};
