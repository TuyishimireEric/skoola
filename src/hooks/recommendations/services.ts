import { RecommendedCourseI, RecommendedCourseResultI } from "@/types/Course";
import axios from "axios";

export const FC_getDailyRecommendations = async (
  studentId: string
): Promise<RecommendedCourseI[]> => {
  const response = await axios.get(`/api/recommendations/${studentId}`);
  return response.data.data;
};

export const FC_UpdateRecommendations = async (data: {
  recommendations: string;
  recommendationId: string;
}) => {
  const response = await axios.patch(`/api/recommendations`, data);
  return response.data.data;
};

export const FC_getTodayCompletedCourseSections = async (
  recommendedGameIds: string[],
  studentId: string
): Promise<RecommendedCourseResultI[]> => {
  const response = await axios.post(`/api/recommendations/completed`, {
    recommendedGameIds,
    studentId,
  });
  return response.data.data;
};
