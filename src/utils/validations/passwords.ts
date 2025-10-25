import { z } from "zod";

const passwordStrength = (Password: string) => {
  const messages = [];
  if (!/[a-z]/.test(Password)) {
    messages.push("at least one lowercase letter");
  }
  if (!/[A-Z]/.test(Password)) {
    messages.push("at least one uppercase letter");
  }
  if (!/\d/.test(Password)) {
    messages.push("at least one number");
  }
  if (!/[@$!%*?&#]/.test(Password)) {
    messages.push("at least one special character");
  }
  if (Password.length < 8) {
    messages.push("at least 8 characters");
  }
  if (messages.length > 0) {
    return `Password must contain ${messages.join(", ")}`;
  }
  return null;
};

export const passwordSchema = z.string().superRefine((Password, ctx) => {
  const errorMessage = passwordStrength(Password);
  if (errorMessage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMessage,
    });
  }
});

export const changePasswordValidationSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters long"),
    newPassword: passwordSchema,
  })
  .refine(
    (data) =>
      !data.currentPassword || data.newPassword !== data.currentPassword,
    {
      message: "New password must be different from the current password",
      path: ["NewPassword"],
    }
  );

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
