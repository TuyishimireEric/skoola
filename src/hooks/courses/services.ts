import axios from "axios";
import {
  GameDataI,
  CourseSectionI,
  GameTypeI,
  LeaderBoardI,
} from "@/types/Course";
import { CourseSectionReportI } from "@/types/reports";

export const FC_CreateCourse = async (formData: GameDataI) => {
  const response = await axios.post("/api/courses", formData);
  return response.data.data;
};

export const FC_GetGameTypes = async (): Promise<GameTypeI[]> => {
  const response = await axios.get("/api/courses/types");
  return response.data.data;
};

export const FC_GetCourses = async (
  page: number,
  pageSize: number,
  searchText: string,
  organizationId: string,
  classId: string
): Promise<GameDataI[]> => {
  const response = await axios.get("/api/courses", {
    params: {
      page,
      pageSize,
      searchText,
      organizationId,
      classId,
    },
  });
  return response.data.data;
};

export const FC_getCourseById = async (
  id: string
): Promise<{
  courseDetails: GameDataI;
  lastStudentGame: CourseSectionI;
}> => {
  const response = await axios.get(`/api/courses/details?GameId=${id}`);
  return response.data.data;
};

export const FC_generateContent = async (prompt: string): Promise<string> => {
  const response = await axios.post("/api/ai/openAi", { prompt });
  return response.data.data;
};

export const FC_getStudentGamesSection = async (
  GameId: string,
  studentId: string
): Promise<CourseSectionI[]> => {
  const response = await axios.get("/api/courses/studentSections", {
    params: {
      GameId,
      studentId,
    },
  });
  return response.data.data;
};

export const FC_recordCourseSection = async (formData: CourseSectionI) => {
  const response = await axios.post(`/api/courses/studentSections`, formData);
  return response.data.data;
};

export const FC_getCourseReport = async (
  GameId: string
): Promise<CourseSectionReportI> => {
  const response = await axios.get("/api/reports/course", {
    params: {
      GameId,
    },
  });
  return response.data.data;
};


export const FC_getLeaderBoard = async (
  GameId: string,
  range: string
): Promise<{
  leaderboard: LeaderBoardI[];
  userRank: number | null;
  userData: LeaderBoardI;
}> => {
  const response = await axios.get("/api/leaderboard", {
    params: {
      GameId,
      range,
    },
  });

  return response.data.data;
};