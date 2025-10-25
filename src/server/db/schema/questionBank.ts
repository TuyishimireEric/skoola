import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean
} from "drizzle-orm/pg-core";
import { Game, GameType, User } from ".";

export const questionMediaType = pgEnum("questionMediaType", [
  "text",
  "image",
  "audio",
  "video",
]);

export const questionDifficulty = pgEnum("questionDifficulty", [
  "easy",
  "medium",
  "hard",
]);

export const QuestionBank = pgTable("QuestionBank", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  QuestionText: text("QuestionText"),
  QuestionType: text("Type")
    .notNull()
    .references(() => GameType.Name, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  MediaType: questionMediaType("MediaType").default("text").notNull(),
  MediaUrl: text("MediaUrl"),
  Options: text("Options"),
  CorrectAnswer: text("CorrectAnswer"),
  Explanation: text("Explanation"),
  Difficulty: questionDifficulty("Difficulty").notNull(),
  Language: text("Language").notNull().default("en"), // ISO language code (en, es, fr, etc.)
  GameId: uuid("GameId").references(() => Game.Id, {
    onDelete: "cascade",
  }),
  IsApproved: boolean("IsApproved").default(false).notNull(),
  ApprovedBy: uuid("ApprovedBy").references(() => User.Id, {
    onDelete: "set null",
  }),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  CreatedBy: uuid("CreatedBy")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  UpdatedBy: uuid("UpdatedBy")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
});
