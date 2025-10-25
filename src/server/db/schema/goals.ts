import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { User } from "./user"; // Import your existing User table
import { Game } from "./game";

// Goal type enum
export const goalTypeEnum = pgEnum("goal_type", [
  "study_time",
  "course",
  "stars",
  "custom",
]);

// Goals table with PascalCase columns
export const Goals = pgTable("Goals", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  CreatedBy: uuid("CreatedBy")
    .notNull()
    .references(() => User.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  Name: text("Name").notNull(),
  Type: goalTypeEnum("Type").notNull(),
  TargetValue: integer("TargetValue"), // For study_time (minutes) and stars
  TargetGameId: uuid("TargetGameId").references(() => Game.Id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }), // Reference to Game.Id for course type goals
  DateKey: text("DateKey").notNull(), // Format: YYYY-MM-DD
  Completed: boolean("Completed").default(false).notNull(),
  CreatedAt: timestamp("CreatedAt", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  UpdatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

// Relations
export const goalsRelations = relations(Goals, ({ one }) => ({
  creator: one(User, {
    fields: [Goals.CreatedBy],
    references: [User.Id],
  }),
}));
