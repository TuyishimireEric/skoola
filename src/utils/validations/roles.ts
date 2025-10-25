import { z } from "zod";

export const roleSchema = z.object({
  Name: z.string().min(3, "Name is required"),
  IsActive: z.boolean().optional(),
});

export type RoleSchema = z.infer<typeof roleSchema>;

export const roleAccessSchema = z.object({
  RoleId: z.string().min(1, "Role is required"),
  Access: z.string().min(1, "Access is required"),
});

export type RoleAccessSchema = z.infer<typeof roleAccessSchema>;
