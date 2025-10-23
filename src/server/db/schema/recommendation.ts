import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { Organization, User } from ".";

export const DailyRecommendation = pgTable("DailyRecommendation", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  Recommendations: jsonb("Recommendations").notNull(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ExpiresOn: timestamp("ExpiresOn", { withTimezone: true }).notNull(),
});

export const StudentRecommendation = pgTable("StudentRecommendation", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  OrganizationId: uuid("OrganizationId")
    .notNull()
    .references(() => Organization.Id, { onDelete: "cascade" }),
  AuthorId: uuid("AuthorId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  Content: text("Content").notNull(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const RecommendationReply = pgTable("RecommendationReply", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  RecommendationId: uuid("RecommendationId")
    .notNull()
    .references(() => StudentRecommendation.Id, { onDelete: "cascade" }),
  AuthorId: uuid("AuthorId")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  Content: text("Content").notNull(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
});