// @/server/db/schema/chat.ts
import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { Organization, User } from ".";

export const messageStatus = pgEnum("message_status", [
    "sent",
    "delivered",
    "read",
]);

export const conversationType = pgEnum("conversation_type", [
    "direct",
    "group",
    "class",
]);

// Conversations table
export const Conversation = pgTable("Conversation", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    Name: text("Name"), // For group chats
    Type: conversationType("Type").default("direct").notNull(),
    OrganizationId: uuid("OrganizationId")
        .notNull()
        .references(() => Organization.Id, {
            onDelete: "cascade",
            onUpdate: "restrict",
        }),
    ClassId: uuid("ClassId"), // Optional, for class-based conversations
    ImageUrl: text("ImageUrl"),
    LastMessageAt: timestamp("LastMessageAt", {
        withTimezone: true,
        mode: "string",
    }),
    CreatedBy: uuid("CreatedBy")
        .notNull()
        .references(() => User.Id, { onDelete: "cascade" }),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});

// Conversation participants
export const ConversationParticipant = pgTable("ConversationParticipant", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    ConversationId: uuid("ConversationId")
        .notNull()
        .references(() => Conversation.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    UserId: uuid("UserId")
        .notNull()
        .references(() => User.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    IsAdmin: boolean("IsAdmin").default(false).notNull(),
    LastReadAt: timestamp("LastReadAt", {
        withTimezone: true,
        mode: "string",
    }),
    JoinedAt: timestamp("JoinedAt", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});

// Messages table
export const Message = pgTable("Message", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    ConversationId: uuid("ConversationId")
        .notNull()
        .references(() => Conversation.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    SenderId: uuid("SenderId")
        .notNull()
        .references(() => User.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    Content: text("Content").notNull(),
    Status: messageStatus("Status").default("sent").notNull(),
    IsEdited: boolean("IsEdited").default(false).notNull(),
    ReplyToId: uuid("ReplyToId"), // For threaded replies
    AttachmentUrl: text("AttachmentUrl"),
    AttachmentType: text("AttachmentType"), // image, file, etc.
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});

// Message reactions
export const MessageReaction = pgTable("MessageReaction", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    MessageId: uuid("MessageId")
        .notNull()
        .references(() => Message.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    UserId: uuid("UserId")
        .notNull()
        .references(() => User.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    Emoji: text("Emoji").notNull(),
    CreatedOn: timestamp("CreatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});

// Typing indicators (temporary, can use Redis in production)
export const TypingIndicator = pgTable("TypingIndicator", {
    Id: uuid("Id").defaultRandom().primaryKey().notNull(),
    ConversationId: uuid("ConversationId")
        .notNull()
        .references(() => Conversation.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    UserId: uuid("UserId")
        .notNull()
        .references(() => User.Id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    IsTyping: boolean("IsTyping").default(true).notNull(),
    UpdatedOn: timestamp("UpdatedOn", { withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});