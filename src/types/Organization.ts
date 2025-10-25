import { z } from "zod";

export type OrganizationTypeI = {
  Id?: string;
  TypeName: string;
  Description: string;
  CreatedOn?: string;
  UpdatedOn?: string;
};

export type OrganizationI = {
  Id?: string;
  Name: string;
  Address: string;
  Description: string;
  CreatedOn?: string;
  UpdatedOn?: string;
  OrganizationTypeId: string;
  SubscriptionPlanId: string;
  ContactEmail?: string;
  ImageUrl?: string;
  AdminId: string;
  CreatedBy: string;
  UpdatedBy: string;
};

export enum UserStatusI {
  Active = "Active",
  Inactive = "Inactive",
  Pending = "Pending",
  Suspended = "Suspended",
}

export interface UserOrganizationRoleI {
  Id?: string;
  UserId: string;
  OrganizationId: string;
  RoleId: string;
  CreatedBy: string;
  UpdatedBy: string;
  Status: UserStatusI;
}

export interface newOrganizationUserI {
  UserId: string;
  OrganizationId: string;
  RoleId: number;
  Subjects?: string;
  Status?: string;
}

export interface updateOrganizationUserI {
  Id: string;
  RoleId: number;
  Subjects?: string;
  Status?: "Active" | "Inactive" | "Pending" | "Suspended" | null;
}

export const organizationUserSchema = z.object({
  Id: z.string(),
  CurrentClass: z.number(),
  RoleId: z.number(),
});

export interface UserOrgI {
  Id: string;
  Status: "Active" | "Inactive" | "Pending" | "Suspended" | null;
  Type: "School" | "NGO" | "Public" | null;
  Name: string | null;
  Logo?: string | null;
  Address?: string;
  CurrentClass?: number | null;
  RoleId: number;
  Role: string | null;
  OrganizationId: string | null;
}

export interface PlanFeatures {
  library_access: boolean;
  upload_content: boolean;
  basic_analytics: boolean;
  advanced_analytics: boolean;
  school_branding: "logo_only" | "full";
  custom_domain: boolean;
  custom_subdomain: boolean;
  parent_portal: boolean;
  api_access: boolean;
  priority_support: boolean;
  support_response_time: "standard" | "24h" | "4h";
  dedicated_manager: boolean;
  onsite_training: boolean;
  weekly_reports: boolean;
  custom_categories: boolean;
}

export interface SubscriptionPlanI {
  Id: number;
  PlanType: string;
  PlanName: string;
  Description: string;
  AnnualPrice: string;
  Currency: string;
  MaxStudents: number | null;
  MaxTeachers: number | null;
  MaxAdminAccounts: number | null;
  PlanFeatures: PlanFeatures;
  IsActive: boolean;
  SortOrder: number;
  CreatedOn: string; // ISO date string
  UpdatedOn: string; // ISO date string
}

export interface CreateOrganizationInput {
  Name: string;
  Email?: string;
  Phone?: string;
  Logo?: string;
  Address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  Type?: "School" | "NGO" | "Public";
}

export interface CreateOrganizationResponse {
  Id: string;
  Name: string;
  Email?: string;
  Phone?: string;
  Logo?: string;
  Address?: string;
  Type: "School" | "NGO" | "Public";
  Status: string;
  CreatedOn: string;
  UpdatedOn: string;
}

export type CreateSubscriptionData = {
  organizationId: string;
  subscriptionPlanId: number;
  paymentMethod: "stripe" | "paypal" | "bank" | string;
  paymentAmount: number;
  paymentCurrency: "USD" | "EUR" | "RWF" | string;
  paymentReceipt: string;
  billingCycle: string;
  autoRenew: boolean;
};
