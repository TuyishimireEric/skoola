import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  numeric,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { Organization, User } from ".";

export const gameStatus = pgEnum("course_status", [
  "Draft",
  "Published",
  "Archived",
  "UnderReview",
]);

export const moderatorAccess = pgEnum("moderator_access", [
  "Teacher",
  "Reviewer",
  "Admin",
]);

export const difficultyType = pgEnum("difficulty_type", [
  "Easy",
  "Medium",
  "Hard",
]);

export const missedQuestionStatus = pgEnum("missed_question_status", [
  "Missed",
  "Passed",
  "Reviewing",
]);

export const GameType = pgTable("GameType", {
  Id: serial("Id").primaryKey(),
  Name: text("Name").notNull().unique(),
  gameFormat: text("gameFormat"),
  Subject: text("Subject"),
  AIGenerated: boolean("AIGenerated").default(true).notNull(),
  CreatedBy: uuid("CreatedBy")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  UpdatedBy: uuid("UpdatedBy")
    .notNull()
    .references(() => User.Id, { onDelete: "cascade" }),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const Game = pgTable("Game", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  Title: text("Title").notNull(),
  Description: text("Description"),
  Topic: text("Topic"),
  ImageUrl: text("ImageUrl").notNull(),
  Emoji: text("Emoji"),
  TutorialVideo: text("TutorialVideo"),
  Subject: text("Subject"),
  Prompt: text("Prompt"),
  Status: gameStatus("Status").default("Draft").notNull(),
  StartDate: timestamp("StartDate", { withTimezone: true }),
  EndDate: timestamp("EndDate", { withTimezone: true }),
  Duration: integer("Duration"),
  PassScore: integer("PassScore"),
  Retakes: integer("Retakes"),
  Tags: text("Tags"),
  NumberOfQuestions: integer("NumberOfQuestions"),
  Type: text("Type")
    .notNull()
    .references(() => GameType.Name, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  GameLevel: integer("GameLevel").default(1).notNull(),
  AgeGroup: text("AgeGroup"),
  OrganizationId: uuid("OrganizationId")
    .notNull()
    .references(() => Organization.Id, {
      onDelete: "cascade",
      onUpdate: "restrict",
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

export const GameModerator = pgTable("GameModerator", {
  Id: uuid("Id").defaultRandom().primaryKey(),
  GameId: uuid("GameId")
    .notNull()
    .references(() => Game.Id, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  UserId: uuid("UserId")
    .notNull()
    .references(() => User.Id, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
    .defaultNow()
    .notNull(),
  Access: moderatorAccess("Access").notNull(),
});

export const StudentGame = pgTable("StudentGame", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  GameId: uuid("GameId")
    .notNull()
    .references(() => Game.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  GameTitle: text("GameTitle").notNull(),
  GameType: text("GameType").notNull(),
  Score: numeric("Score", { precision: 5, scale: 2 }),
  Stars: integer("Stars").default(0),
  MissedQuestions: jsonb("MissedQuestions"),
  CurrentStreak: integer("CurrentStreak").default(0),
  StartedOn: timestamp("StartedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  CompletedOn: timestamp("CompletedOn", { withTimezone: true, mode: "string" }),
});

export const StudentMissedQuestion = pgTable("StudentMissedQuestion", {
  Id: uuid("Id").defaultRandom().primaryKey().notNull(),
  StudentId: uuid("StudentId")
    .notNull()
    .references(() => User.Id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  QuestionId: uuid("QuestionId").notNull(),
  Status: missedQuestionStatus("Status").default("Missed").notNull(),
  CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});
