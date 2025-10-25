import { db } from "../db";
import { OrganizationSubscription, SubscriptionPlans } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schema for adding subscription
export const AddOrganizationSubscriptionSchema = z.object({
  organizationId: z.string().uuid("Valid organization ID is required"),
  subscriptionPlanId: z.number().int("Valid subscription plan ID is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentAmount: z.number().positive("Payment amount must be positive"),
  paymentCurrency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
  paymentReceipt: z.string().optional(),
  subscriptionStart: z.date().optional(),
  subscriptionEnd: z.date().optional(),
  isTrialPeriod: z.boolean().default(false),
  trialEndDate: z.date().optional(),
  billingCycle: z.enum(["monthly", "annual"]).default("annual"),
  autoRenew: z.boolean().default(true),
});

export type AddOrganizationSubscriptionInput = z.infer<
  typeof AddOrganizationSubscriptionSchema
>;

/**
 * Add a subscription plan to an organization with payment details
 */
export async function addOrganizationSubscription(
  data: AddOrganizationSubscriptionInput
) {
  const validatedData = AddOrganizationSubscriptionSchema.parse(data);

  // Verify the subscription plan exists
  const [subscriptionPlan] = await db
    .select()
    .from(SubscriptionPlans)
    .where(eq(SubscriptionPlans.Id, validatedData.subscriptionPlanId))
    .limit(1);

  if (!subscriptionPlan) {
    return {
      success: false,
      error: "Subscription plan not found",
    };
  }

  // Check if the plan is active
  if (!subscriptionPlan.IsActive) {
    return {
      success: false,
      error: "Subscription plan is not active",
    };
  }

  // Calculate subscription end date if not provided
  let subscriptionEnd = validatedData.subscriptionEnd;
  if (!subscriptionEnd && validatedData.subscriptionStart) {
    const startDate = validatedData.subscriptionStart;
    subscriptionEnd = new Date(startDate);

    if (validatedData.billingCycle === "monthly") {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    } else {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    }
  }

  // If no start date provided, use current date
  const subscriptionStart = validatedData.subscriptionStart || new Date();

  // If still no end date, calculate from start date
  if (!subscriptionEnd) {
    subscriptionEnd = new Date(subscriptionStart);
    if (validatedData.billingCycle === "monthly") {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    } else {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    }
  }

  // Create the subscription record
  const newSubscription = await db
    .insert(OrganizationSubscription)
    .values({
      OrganizationId: validatedData.organizationId,
      SubscriptionPlanId: validatedData.subscriptionPlanId,
      SubscriptionStatus: "active",
      PaymentStatus: "Paid",
      PaymentMethod: validatedData.paymentMethod,
      PaymentDate: new Date(),
      PaymentAmount: validatedData.paymentAmount.toString(),
      PaymentCurrency: validatedData.paymentCurrency,
      PaymentReceipt: validatedData.paymentReceipt,
      SubscriptionStart: subscriptionStart,
      SubscriptionEnd: subscriptionEnd,
      IsTrialPeriod: validatedData.isTrialPeriod,
      TrialEndDate: validatedData.trialEndDate,
      BillingCycle: validatedData.billingCycle,
      AutoRenew: validatedData.autoRenew,
    })
    .returning();

  return newSubscription;
}
