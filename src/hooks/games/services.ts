import axios from "axios";
import { GameDataI, GameTypeI } from "@/types/Course";
import {
  AddMissedQuestionsData,
  AddMissedQuestionsResponseI,
  GameMissedQuestionsI,
  GetMissedQuestionsParams,
} from "@/types/MissedQuestions";

export const FC_GetGames = async (
  page: number,
  pageSize: number,
  searchText: string,
  subject?: string,
  grade?: string
): Promise<GameDataI[]> => {
  const response = await axios.get("/api/games", {
    params: {
      page,
      pageSize,
      searchText,
      subject,
      grade,
    },
  });
  return response.data.data;
};

export const FC_GetGame = async (gameId: string): Promise<GameDataI> => {
  const response = await axios.get(`/api/games/${gameId}`);
  return response.data.data;
};

export const FC_GetAdminGames = async (
  page: number,
  pageSize: number,
  searchText: string,
  subject?: string,
  grade?: string
): Promise<GameDataI[]> => {
  const response = await axios.get("/api/games/admin", {
    params: {
      page,
      pageSize,
      searchText,
      subject,
      grade,
    },
  });
  return response.data.data;
};

export const FC_CreateGame = async (formData: GameDataI) => {
  const response = await axios.post("/api/games", formData);
  return response.data.data;
};

export const FC_UpdateGame = async ({
  formData,
  GameId,
}: {
  formData: GameDataI;
  GameId: string;
}) => {
  const response = await axios.put(`/api/games/${GameId}`, formData);
  return response.data.data;
};

export const FC_GetGameTypes = async (): Promise<GameTypeI[]> => {
  const response = await axios.get("/api/courses/types");
  return response.data.data;
};

export const FC_AddMissedQuestions = async (
  formData: AddMissedQuestionsData
): Promise<AddMissedQuestionsResponseI> => {
  const response = await axios.post("/api/games/missed-questions", {
    data: formData,
  });
  return response.data.data;
};

export const FC_GetMissedQuestions = async (
  params: GetMissedQuestionsParams = {}
): Promise<GameMissedQuestionsI[]> => {
  const response = await axios.get("/api/games/missed-questions", {
    params,
  });
  return response.data.data;
};

export interface UpdatePassedQuestionsData {
  studentId: string;
  questionIds: string[];
}

export const FC_UpdatePassedQuestions = async (
  formData: UpdatePassedQuestionsData
): Promise<{ updated: boolean }> => {
  const response = await axios.patch("/api/games/missed-questions", formData);
  return response.data.data;
};
