import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { User } from ".";

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
