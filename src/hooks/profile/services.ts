import axios from "axios";
import { UserDataI } from "@/types";
import { KidProfileDataI } from "@/types/Student";

export const FC_kidProfile = async (
  userId: string
): Promise<KidProfileDataI> => {
  const response = await axios.get(`/api/profile/${userId}`);
  return response.data.data;
};

export const FC_kidsProfile = async (): Promise<KidProfileDataI[]> => {
  const response = await axios.get(`/api/profile`);
  return response.data.data;
};

export const getUserProfile = async (userId: string): Promise<UserDataI> => {
  const response = await axios.get(`/api/user/${userId}`);
  return response.data.data;
};
