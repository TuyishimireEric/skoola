import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { Game, User } from ".";

// Main review table with ratings and comments
export const GameReview = pgTable(
  "GameReview",
  {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
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
    // Rating from 1-5 stars
    Rating: integer("Rating").notNull(), // Should be between 1-5
    // Review comment/text content
    Comment: text("Comment"),
    // Whether the review is approved/moderated
    IsApproved: boolean("IsApproved").default(true).notNull(),
    // Whether the review is flagged for moderation
    IsFlagged: boolean("IsFlagged").default(false).notNull(),
    // Helpful votes count (cached for performance)
    HelpfulCount: integer("HelpfulCount").default(0).notNull(),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true })
      .defaultNow()
      .notNull(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Indexes for better query performance
    gameIdIdx: index("game_review_game_id_idx").on(table.GameId),
    userIdIdx: index("game_review_user_id_idx").on(table.UserId),
    ratingIdx: index("game_review_rating_idx").on(table.Rating),
    createdOnIdx: index("game_review_created_on_idx").on(table.CreatedOn),
  })
);

// Review likes/helpful votes table
export const GameReviewLike = pgTable(
  "GameReviewLike",
  {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    ReviewId: uuid("ReviewId")
      .notNull()
      .references(() => GameReview.Id, {
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
  },
  (table) => ({
    // Ensures one like per user per review
    reviewUserUnique: index("review_like_review_user_unique").on(
      table.ReviewId,
      table.UserId
    ),
    reviewIdIdx: index("review_like_review_id_idx").on(table.ReviewId),
    userIdIdx: index("review_like_user_id_idx").on(table.UserId),
  })
);

// Game likes table (separate from reviews)
export const GameLike = pgTable(
  "GameLike",
  {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
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
  },
  (table) => ({
    // Ensures one like per user per game
    gameUserUnique: index("game_like_game_user_unique").on(
      table.GameId,
      table.UserId
    ),
    gameIdIdx: index("game_like_game_id_idx").on(table.GameId),
    userIdIdx: index("game_like_user_id_idx").on(table.UserId),
  })
);
