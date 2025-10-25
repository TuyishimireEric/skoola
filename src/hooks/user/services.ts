import axios from "axios";
import {
  NewUserInterface,
  StudentData,
  StudentResponseI,
  UpdateUserInterface,
  UserInterface,
} from "@/types/User";
import { StudentListResponse } from "@/server/queries/students";

interface UserListI {
  users: UserInterface[];
  total: number;
}

export const registerUser = async (formData: NewUserInterface) => {
  const response = await axios.post("/api/auth/register", formData);
  return response.data.data;
};

export const registerStudent = async (formData: NewUserInterface) => {
  const response = await axios.post("/api/auth/register/student", formData);
  return response.data.data;
};

export const updateUser = async (formData: UpdateUserInterface) => {
  const response = await axios.patch("/api/user", formData);
  return response.data.data;
};

export const updateUserProfile = async (formData: UpdateUserInterface) => {
  const response = await axios.patch("/api/profile", formData);
  return response.data.data;
};

export const verifyUser = async (formData: {
  UserId: string;
  Token: string;
}) => {
  const response = await axios.post("/api/auth/verify", formData);
  return response.data.data;
};

export const verifyUserOTP = async (formData: {
  email: string;
  Token: string;
}) => {
  const response = await axios.post("/api/auth/verify_otp", formData);
  return response.data.data;
};

export const assignClass = async (formData: {
  UserId: string;
  ClassId: string;
}) => {
  const response = await axios.patch("/api/user/classes", formData);
  return response.data.data;
};

export const getUserList = async (data: {
  page: number;
  pageSize: number;
  searchText?: string;
  sort?: string;
  order?: string;
  role?: string;
}): Promise<UserListI> => {
  const response = await axios.get("/api/user", { params: data });
  return response.data.data;
};

export const getStudentList = async (data: {
  page: number;
  pageSize: number;
  searchText: string;
  sort: string;
  order: string;
  activeOnly: boolean;
  grade: string;
}): Promise<{
  students: StudentListResponse[];
  totalCount: number;
  totalPages: number;
}> => {
  const response = await axios.get("/api/user/students", { params: data });
  return response.data.data;
};

export const addStudents = async (data: {
  Students: StudentData[];
  grade: number;
}): Promise<StudentResponseI> => {
  const response = await axios.post("/api/user/students", data);
  return response.data.data;
};

export const sendVerification = async ({ UserId }: { UserId: string }) => {
  const response = await axios.post("/api/auth/send_verification", {
    UserId,
  });
  return response.data.data;
};

export const sendForgotPassword = async ({ email }: { email: string }) => {
  const response = await axios.post("/api/auth/forgot_password", {
    email,
  });
  return response.data.data;
};

export const updatePassword = async ({
  email,
  Token,
  Password,
}: {
  email: string;
  Token: string;
  Password: string;
}) => {
  const response = await axios.post("/api/auth/forgot_password", {
    email,
    Token,
    Password,
  });
  return response.data.data;
};
