import { TextInterface } from "@/types/Text";
import axios from "axios";

export const FC_compareTexts = async (formData: TextInterface) => {
  try {
    const response = await axios.post<{
      message: string;
      data: number;
      reference: string;
    }>("/api/ai/similarity", formData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
