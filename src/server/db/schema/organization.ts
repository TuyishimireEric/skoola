import {
  pgTable,
  uuid,
  jsonb,
  varchar,
  timestamp,
  pgEnum,
  numeric,
  serial,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { entityStatus, User } from ".";

export const organizationType = pgEnum("organization_type", [
  "School",
  "NGO",
  "Public",
]);

// Keep the old plan_type enum for existing subscriptions
export const planType = pgEnum("plan_type", ["Free", "Basic", "Pro"]);

// New plan types for the new structure
export const subscriptionPlanType = pgEnum("subscription_plan_type", ["Starter", "Professional", "Enterprise"]);

export const paymentStatus = pgEnum("payment_status", [
  "Pending",
  "Paid",
  "Failed",
]);

// New SubscriptionPlans table to store plan details
export const SubscriptionPlans = pgTable("SubscriptionPlans", {
  Id: serial("Id").primaryKey(),
  PlanType: subscriptionPlanType("PlanType").notNull(), // "Starter", "Professional", "Enterprise"
  PlanName: varchar("PlanName", { length: 100 }).notNull(), // "Starter Plan", etc.
  Description: text("Description"),
  AnnualPrice: numeric("AnnualPrice", { precision: 10, scale: 2 }).notNull(), // Annual price
  Currency: varchar("Currency", { length: 3 }).default("USD"),
  MaxStudents: integer("MaxStudents"), // null = unlimited
  MaxTeachers: integer("MaxTeachers"), // null = unlimited
  MaxAdminAccounts: integer("MaxAdminAccounts"), // null = unlimited
  PlanFeatures: jsonb("PlanFeatures").notNull(), 
  IsActive: boolean("IsActive").default(true),
  SortOrder: integer("SortOrder").default(0), // For display ordering
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const Organization = pgTable("Organization", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  Name: varchar("Name").notNull(),
  Email: varchar("Email").unique(),
  Phone: varchar("Phone"),
  Logo: varchar("Logo"),
  Address: jsonb("Address"),
  Status: entityStatus("Status").default("Active"),
  Type: organizationType("Type").notNull().default("Public"),
  CurrentStudents: integer("CurrentStudents").default(0),
  CurrentTeachers: integer("CurrentTeachers").default(0),
  CurrentAdmins: integer("CurrentAdmins").default(0),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// New OrganizationSubscription table (separate from old Subscription)
export const OrganizationSubscription = pgTable("OrganizationSubscription", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  OrganizationId: uuid("OrganizationId")
    .notNull()
    .references(() => Organization.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  SubscriptionPlanId: integer("SubscriptionPlanId")
    .notNull()
    .references(() => SubscriptionPlans.Id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  SubscriptionStatus: varchar("SubscriptionStatus").default("active"), // "active", "cancelled", "expired"
  PaymentStatus: paymentStatus("PaymentStatus").default("Pending"),
  PaymentMethod: varchar("PaymentMethod"),
  PaymentDate: timestamp("PaymentDate", { withTimezone: true }),
  PaymentAmount: numeric("PaymentAmount", { precision: 10, scale: 2 }),
  PaymentCurrency: varchar("PaymentCurrency").default("USD"),
  PaymentReceipt: varchar("PaymentReceipt"),
  SubscriptionStart: timestamp("SubscriptionStart", { withTimezone: true })
    .defaultNow()
    .notNull(),
  SubscriptionEnd: timestamp("SubscriptionEnd", { withTimezone: true }),
  IsTrialPeriod: boolean("IsTrialPeriod").default(false),
  TrialEndDate: timestamp("TrialEndDate", { withTimezone: true }),
  BillingCycle: varchar("BillingCycle").default("annual"), // "monthly", "annual"
  AutoRenew: boolean("AutoRenew").default(true),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const Role = pgTable("Role", {
  Id: serial("Id").primaryKey(),
  Name: varchar("Name", { length: 50 }).unique().notNull(),
  Description: text("Description"),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const OrganizationUser = pgTable("OrganizationUser", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  UserId: uuid("UserId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade", onUpdate: "cascade" }),
  OrganizationId: uuid("OrganizationId")
    .notNull()
    .references(() => Organization.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  RoleId: integer("RoleId")
    .notNull()
    .references(() => Role.Id, { onDelete: "cascade", onUpdate: "cascade" }),
  Grade: text("Grade"),
  Subjects: text("Subjects"),
  Status: entityStatus("Status").default("Active"),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const TeacherInvitations = pgTable("TeacherInvitations", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  Email: varchar("Email", { length: 255 }).notNull(),
  FullName: varchar("FullName", { length: 255 }).notNull(),
  OrganizationId: uuid("OrganizationId")
    .notNull()
    .references(() => Organization.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  InvitedBy: uuid("InvitedBy")
    .notNull()
    .references(() => User.Id, {
      onDelete: "cascade", 
      onUpdate: "cascade",
    }),
  Token: uuid("Token").notNull().unique(),
  Status: entityStatus("Status").default("Pending").notNull(),
  ExpiresAt: timestamp("ExpiresAt", { withTimezone: true }).notNull(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  AcceptedOn: timestamp("AcceptedOn", { withTimezone: true }),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
