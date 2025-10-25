import { z } from "zod";

export const organizationSchema = z.object({
  Name: z.string().min(3, "Name is required"),
  Address: z.object({
    country: z.string().min(2, "Country is required"),
    city: z.string().min(2, "City is required"),
    sector: z.string().min(2, "Sector is required"),
    street: z.string().min(2, "Street is required"),
  }),
  Description: z.string().min(5, "Description is required"),
  OrganizationTypeId: z.string().min(3, "Organization Type is required"),
  SubscriptionPlanId: z.string().min(3, "Subscription Plan is required"),
  ContactEmail: z
    .string()
    .email("Invalid Email")
    .min(5, "Contact Email is required"),
  ImageUrl: z.string().min(5, "Image is required"),
  AdminId: z.string().min(5, "Admin is required"),
  CreatedBy: z.string().min(1, "Created By is required").optional(),
  UpdatedBy: z.string().min(1, "Updated By is required").optional(),
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;

export const subscriptionPlanSchema = z.object({
  PlanName: z.string().min(3, "Name is required"),
  MaxStudents: z.number(),
  AIEnabled: z.boolean(),
  SSOEnabled: z.boolean(),
  Description: z.string().min(3, "Description is required"),
});

export type SubscriptionPlanSchema = z.infer<typeof subscriptionPlanSchema>;

export const organizationTypeSchema = z.object({
  TypeName: z.string().min(3, "Type Name is required"),
  Description: z.string().min(3, "Description is required"),
});

export type OrganizationTypeSchema = z.infer<typeof organizationTypeSchema>;

export const userOrganizationRoleSchema = z.object({
  UserId: z.string().min(3, "User is required"),
  OrganizationId: z.string().min(3, "Organization is required"),
  RoleId: z.string().min(3, "Role is required"),
  Status: z.enum(["Active", "Inactive", "Pending", "Suspended"], {
    required_error: "Status is required",
    invalid_type_error:
      "Status must be one of 'active', 'inactive', or 'pending'",
  }),
  CreatedBy: z.string().min(1, "Created By is required").optional(),
  UpdatedBy: z.string().min(1, "Updated By is required").optional(),
});

export type UserOrganizationRoleSchema = z.infer<typeof userOrganizationRoleSchema>;