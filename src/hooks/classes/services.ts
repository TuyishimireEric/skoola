import { ClassesI } from "@/types/Classes";
import axios from "axios";
export const getClasses = async (): Promise<ClassesI[]> => {
  const response = await axios.get("/api/classes");
  return response.data.data;
};
