import { z } from "zod";
import { passwordSchema } from "./passwords";

export const loginSchema = z.object({
  Email: z.string().email("Invalid Email"),
  parentssword: passwordSchema,
});

export const registerSchema = z.object({
  FullName: z.string().min(4, { message: "Must be 4 or more characters long" }),
  Email: z.string().email("Invalid Email"),
  Password: z
    .string()
    .min(3, { message: "Must be 4 or more characters long" })
    .optional(),
  Grade: z.string().optional(),
  ImageUrl: z.string().optional(),
  DateOfBirth: z.string().optional(),
  GoogleId: z.string().optional(),
  UserRole: z.enum(["student", "parent", "staff", "user"]),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerStudentSchema = z.object({
  FullName: z.string().min(4, { message: "Must be 4 or more characters long" }),
  Password: z
    .string()
    .min(3, { message: "Must be 4 or more characters long" })
    .optional(),
  DateOfBirth: z.string().optional(),
});

export type RegisterStudentSchema = z.infer<typeof registerStudentSchema>;

export const registerTeacherSchema = z.object({
  FullName: z.string().min(4, { message: "Must be 4 or more characters long" }),
  Email: z.string().email("Invalid Email"),
});

export type RegisterTeacherSchema = z.infer<typeof registerTeacherSchema>;
