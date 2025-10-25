import axios from "axios";
import { QuestionDataI } from "@/types/Questions";

export const FC_CreateQuestion = async (formData: QuestionDataI) => {
  const response = await axios.post("/api/questions", formData);
  return response.data.data;
};

export const FC_getQuestionsByGame = async (
  GameId: string,
  limit: number = 10,
  questionIds?: string[]
): Promise<QuestionDataI[]> => {
  const response = await axios.get("/api/questions", {
    params: {
      GameId,
      limit,
      questionIds,
    },
  });
  return response.data.data;
};
