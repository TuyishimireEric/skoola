import { db } from "../db";
import {
  Organization,
  OrganizationUser,
  User,
  Role,
  OrganizationSubscription,
  SubscriptionPlans,
} from "../db/schema";
import { eq, and, desc, ilike, count } from "drizzle-orm";
import { z } from "zod";

// Validation schemas
export const CreateOrganizationSchema = z.object({
  Name: z.string().min(1, "Organization name is required"),
  Email: z.string().email("Valid email is required").optional(),
  Phone: z.string().optional(),
  Logo: z.string().url("Logo must be a valid URL").optional(),
  Address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  Type: z.enum(["School", "NGO", "Public"]).default("Public"),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

type UserStatus = "Active" | "Inactive" | "Pending" | "Suspended" | null;

// Type definitions for the extended organization data
interface OrganizationWithExtras {
  // Base organization fields
  Id: string;
  Name: string;
  Email: string | null;
  Phone: string | null;
  Logo: string | null;
  Address: unknown;
  Status: "Pending" | "Active" | "Inactive" | "Suspended" | null;
  Type: "School" | "NGO" | "Public";
  CurrentStudents: number | null;
  CurrentTeachers: number | null;
  CurrentAdmins: number | null;
  CreatedOn: Date;
  UpdatedOn: Date;
  // Optional extended fields
  users?: Array<{
    id: string;
    userId: string;
    status: UserStatus;
    createdOn: Date;
    user: {
      id: string;
      email: string | null;
      fullName: string;
    } | null;
    role: {
      id: number;
      name: string;
      description: string | null;
    } | null;
  }>;
  subscription?: {
    id: string;
    subscriptionStatus: string | null;
    paymentStatus: string | null;
    subscriptionStart: Date | null;
    subscriptionEnd: Date | null;
    isTrialPeriod: boolean | null;
    trialEndDate: Date | null;
    billingCycle: string | null;
    autoRenew: boolean | null;
    plan: {
      id: number;
      planType: string | null;
      planName: string | null;
      description: string | null;
      annualPrice: string | null;
      currency: string | null;
      maxStudents: number | null;
      maxTeachers: number | null;
      maxAdminAccounts: number | null;
      planFeatures: unknown;
    } | null;
  } | null;
  stats?: {
    totalActiveUsers: number;
    currentStudents: number;
    currentTeachers: number;
    currentAdmins: number;
  };
}

// Organization Query Functions

/**
 * Create a new organization
 */
export async function createOrganization(data: CreateOrganizationInput) {
  const validatedData = CreateOrganizationSchema.parse(data);

  const [organization] = await db
    .insert(Organization)
    .values({
      ...validatedData,
      Address: validatedData.Address
        ? JSON.stringify(validatedData.Address)
        : null,
    })
    .returning();

  return organization;
}

/**
 * Get organization by ID with optional related data
 */
export async function getOrganizationById(
  id: string,
  options: {
    includeUsers?: boolean;
    includeSubscription?: boolean;
    includeStats?: boolean;
  } = {}
) {
  try {
    const organization = await db
      .select()
      .from(Organization)
      .where(eq(Organization.Id, id))
      .limit(1);

    if (!organization.length) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Create a new object with the base organization data
    const result: OrganizationWithExtras = { ...organization[0] };

    // Include users if requested
    if (options.includeUsers) {
      const users = await db
        .select({
          id: OrganizationUser.Id,
          userId: OrganizationUser.UserId,
          status: OrganizationUser.Status,
          createdOn: OrganizationUser.CreatedOn,
          user: {
            id: User.Id,
            email: User.Email,
            fullName: User.FullName,
          },
          role: {
            id: Role.Id,
            name: Role.Name,
            description: Role.Description,
          },
        })
        .from(OrganizationUser)
        .leftJoin(User, eq(OrganizationUser.UserId, User.Id))
        .leftJoin(Role, eq(OrganizationUser.RoleId, Role.Id))
        .where(eq(OrganizationUser.OrganizationId, id));

      result.users = users;
    }

    // Include subscription if requested
    if (options.includeSubscription) {
      const subscription = await db
        .select({
          id: OrganizationSubscription.Id,
          subscriptionStatus: OrganizationSubscription.SubscriptionStatus,
          paymentStatus: OrganizationSubscription.PaymentStatus,
          subscriptionStart: OrganizationSubscription.SubscriptionStart,
          subscriptionEnd: OrganizationSubscription.SubscriptionEnd,
          isTrialPeriod: OrganizationSubscription.IsTrialPeriod,
          trialEndDate: OrganizationSubscription.TrialEndDate,
          billingCycle: OrganizationSubscription.BillingCycle,
          autoRenew: OrganizationSubscription.AutoRenew,
          plan: {
            id: SubscriptionPlans.Id,
            planType: SubscriptionPlans.PlanType,
            planName: SubscriptionPlans.PlanName,
            description: SubscriptionPlans.Description,
            annualPrice: SubscriptionPlans.AnnualPrice,
            currency: SubscriptionPlans.Currency,
            maxStudents: SubscriptionPlans.MaxStudents,
            maxTeachers: SubscriptionPlans.MaxTeachers,
            maxAdminAccounts: SubscriptionPlans.MaxAdminAccounts,
            planFeatures: SubscriptionPlans.PlanFeatures,
          },
        })
        .from(OrganizationSubscription)
        .leftJoin(
          SubscriptionPlans,
          eq(OrganizationSubscription.SubscriptionPlanId, SubscriptionPlans.Id)
        )
        .where(eq(OrganizationSubscription.OrganizationId, id))
        .orderBy(desc(OrganizationSubscription.CreatedOn))
        .limit(1);

      result.subscription = subscription[0] || null;
    }

    // Include stats if requested
    if (options.includeStats) {
      const [userCounts] = await db
        .select({
          totalUsers: count(),
        })
        .from(OrganizationUser)
        .where(
          and(
            eq(OrganizationUser.OrganizationId, id),
            eq(OrganizationUser.Status, "Active")
          )
        );

      result.stats = {
        totalActiveUsers: userCounts.totalUsers,
        currentStudents: result.CurrentStudents || 0,
        currentTeachers: result.CurrentTeachers || 0,
        currentAdmins: result.CurrentAdmins || 0,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch organization",
    };
  }
}

/**
 * Get all organizations with pagination and filtering
 */
export async function getOrganizations(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    type?: "School" | "NGO" | "Public";
    status?: "Active" | "Inactive";
    sortBy?: "Name" | "CreatedOn" | "UpdatedOn";
    sortOrder?: "asc" | "desc";
  } = {}
) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(ilike(Organization.Name, `%${search}%`));
    }

    if (type) {
      conditions.push(eq(Organization.Type, type));
    }

    if (status) {
      conditions.push(eq(Organization.Status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get organizations with pagination
    const organizations = await db
      .select()
      .from(Organization)
      .where(whereClause)
      //   .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(Organization)
      .where(whereClause);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        organizations,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch organizations",
    };
  }
}

/**
 * Get all organizations with pagination and filtering
 */
export async function getSubscriptionPlans() {
  const subscriptions = await db.select().from(SubscriptionPlans);
  return subscriptions;
}

export async function getOrganizationUser(
  userId: string,
  organizationId: string
) {
  try {
    const [orgUser] = await db
      .select({
        Id: OrganizationUser.Id,
        UserId: OrganizationUser.UserId,
        OrganizationId: OrganizationUser.OrganizationId,
        RoleId: OrganizationUser.RoleId,
        Status: OrganizationUser.Status,
        CreatedOn: OrganizationUser.CreatedOn,
      })
      .from(OrganizationUser)
      .where(
        and(
          eq(OrganizationUser.UserId, userId),
          eq(OrganizationUser.OrganizationId, organizationId)
        )
      )
      .limit(1);

    return orgUser || null;
  } catch (error) {
    console.error("Error getting organization user:", error);
    return null;
  }
}

/**
 * Update organization user
 */
export async function updateOrganizationUserByUserId(data: {
  UserId: string;
  OrganizationId: string;
  RoleId: number;
  Status: "Active" | "Inactive" | "Pending" | "Suspended";
}) {
  try {
    const updatedOrgUser = await db
      .update(OrganizationUser)
      .set({
        RoleId: data.RoleId,
        Status: data.Status,
        UpdatedOn: new Date(),
      })
      .where(
        and(
          eq(OrganizationUser.UserId, data.UserId),
          eq(OrganizationUser.OrganizationId, data.OrganizationId)
        )
      )
      .returning();

    return updatedOrgUser;
  } catch (error) {
    console.error("Error updating organization user:", error);
    throw error;
  }
}
