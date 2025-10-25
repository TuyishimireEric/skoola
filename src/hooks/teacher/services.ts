import { NewTeacherInterface, UpdateUserInterface } from "@/types";
import { TeacherData, TeacherInvitation } from "@/types/teacher";
import axios from "axios";

export const updateTeacherProfile = async (formData: UpdateUserInterface) => {
  const response = await axios.patch("/api/teachers", formData);
  return response.data.data;
};

export const activateTeacher = async (formData: UpdateUserInterface) => {
  const response = await axios.post("/api/teachers", formData);
  return response.data.data;
};

export const getTeachers = async (): Promise<TeacherData[]> => {
  const response = await axios.get("/api/teachers");
  return response.data.data;
};

export const registerTeacher = async (formData: NewTeacherInterface) => {
  const response = await axios.post("/api/teachers/invitations", formData);
  return response.data.data;
};

export const getTeacherInvitation = async (
  token: string
): Promise<TeacherInvitation> => {
  const response = await axios.get("/api/teachers/invitations", {
    params: {
      token,
    },
  });
  return response.data.data;
};
