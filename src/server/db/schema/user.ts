import {
  pgTable,
  uuid,
  jsonb,
  date,
  boolean,
  varchar,
  timestamp,
  pgEnum,
  text,
  integer,
} from "drizzle-orm/pg-core";

export const entityStatus = pgEnum("entity_status", [
  "Active",
  "Inactive",
  "Pending",
  "Suspended",
]);

export const User = pgTable("User", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  FullName: varchar("FullName").notNull(),
  Email: varchar("Email").unique(),
  UserNumber: integer("UserNumber").unique(),
  ParentName: varchar("ParentName"),
  ParentEmail: varchar("ParentEmail"),
  Phone: varchar("Phone"),
  Gender: varchar("Gender"),
  ImageUrl: varchar("ImageUrl"),
  DateOfBirth: date("DateOfBirth"),
  Address: jsonb("Address"),
  AboutMe: text("AboutMe"),
  IsVerified: boolean("IsVerified").notNull().default(false),
  Password: varchar("Password"),
  GoogleId: varchar("GoogleId").unique(),
  LoginCode: varchar("LoginCode"),
  Status: entityStatus("Status").default("Active"),
  LastLogin: timestamp("LastLogin", { withTimezone: true }),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ParentStudent = pgTable("ParentStudent", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  ParentId: uuid("ParentId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  Relationship: varchar("Relationship"),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ParentStudentInvite = pgTable("ParentStudentInvite", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  InviteCode: varchar("InviteCode", { length: 5 }).notNull().unique(),
  IsUsed: boolean("IsUsed").default(false).notNull(),
  UsedByParentId: uuid("UsedByParentId").references(() => User.Id, {
    onDelete: "set null",
  }),
  ExpiresAt: timestamp("ExpiresAt", { withTimezone: true }).notNull(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const Session = pgTable("Session", {
  SessionToken: varchar("SessionToken").primaryKey(),
  UserId: uuid("UserId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  Expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const VerificationToken = pgTable("VerificationToken", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  UserId: uuid("UserId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  Token: text("Token").notNull(),
  Valid: boolean("Valid").default(true),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  Expires: timestamp("Expires", { mode: "date" }).notNull(),
});
