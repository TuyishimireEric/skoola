// @/server/queries/chat.ts
import { db } from "@/server/db";
import {
    Conversation,
    ConversationParticipant,
    Message,
    MessageReaction,
    User,
} from "@/server/db/schema";
import {
    ConversationDataI,
    MessageDataI,
    CreateConversationInput,
    SendMessageInput,
} from "@/types/Chat";
import { eq, and, desc, sql, inArray, or } from "drizzle-orm";

// Get user's conversations
export const getUserConversations = async (
    userId: string,
    organizationId: string,
    trx: typeof db = db
): Promise<ConversationDataI[]> => {
    const conversations = await trx
        .select({
            Id: Conversation.Id,
            Name: Conversation.Name,
            Type: Conversation.Type,
            OrganizationId: Conversation.OrganizationId,
            ClassId: Conversation.ClassId,
            ImageUrl: Conversation.ImageUrl,
            LastMessageAt: Conversation.LastMessageAt,
            CreatedBy: Conversation.CreatedBy,
            CreatedOn: Conversation.CreatedOn,
            UpdatedOn: Conversation.UpdatedOn,
            lastMessageContent: sql<string>`(
        SELECT ${Message.Content}
        FROM ${Message}
        WHERE ${Message.ConversationId} = ${Conversation.Id}
        ORDER BY ${Message.CreatedOn} DESC
        LIMIT 1
      )`,
            lastMessageSender: sql<string>`(
        SELECT ${User.FullName}
        FROM ${Message}
        INNER JOIN ${User} ON ${User.Id} = ${Message.SenderId}
        WHERE ${Message.ConversationId} = ${Conversation.Id}
        ORDER BY ${Message.CreatedOn} DESC
        LIMIT 1
      )`,
            unreadCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${Message}
        WHERE ${Message.ConversationId} = ${Conversation.Id}
          AND ${Message.CreatedOn} > COALESCE(
            (SELECT ${ConversationParticipant.LastReadAt}
             FROM ${ConversationParticipant}
             WHERE ${ConversationParticipant.ConversationId} = ${Conversation.Id}
               AND ${ConversationParticipant.UserId} = ${userId}),
            '1970-01-01'::timestamp
          )
          AND ${Message.SenderId} != ${userId}
      )`,
            otherParticipantName: sql<string>`(
        SELECT ${User.FullName}
        FROM ${ConversationParticipant}
        INNER JOIN ${User} ON ${User.Id} = ${ConversationParticipant.UserId}
        WHERE ${ConversationParticipant.ConversationId} = ${Conversation.Id}
          AND ${ConversationParticipant.UserId} != ${userId}
        LIMIT 1
      )`,
            otherParticipantAvatar: sql<string>`(
        SELECT ${User.ImageUrl}
        FROM ${ConversationParticipant}
        INNER JOIN ${User} ON ${User.Id} = ${ConversationParticipant.UserId}
        WHERE ${ConversationParticipant.ConversationId} = ${Conversation.Id}
          AND ${ConversationParticipant.UserId} != ${userId}
        LIMIT 1
      )`,
        })
        .from(Conversation)
        .innerJoin(
            ConversationParticipant,
            eq(ConversationParticipant.ConversationId, Conversation.Id)
        )
        .where(
            and(
                eq(ConversationParticipant.UserId, userId),
                eq(Conversation.OrganizationId, organizationId)
            )
        )
        .orderBy(desc(Conversation.LastMessageAt));

    return conversations.map((conv) => ({
        ...conv,
        // For direct chats, use other participant's name and avatar
        Name:
            conv.Type === "direct"
                ? conv.otherParticipantName || "Unknown User"
                : conv.Name || "Group Chat",
        ImageUrl:
            conv.Type === "direct"
                ? conv.otherParticipantAvatar || null
                : conv.ImageUrl,
        lastMessage: conv.lastMessageContent
            ? {
                Id: "",
                ConversationId: conv.Id,
                SenderId: "",
                Content: conv.lastMessageContent,
                Status: "sent" as const,
                IsEdited: false,
                CreatedOn: conv.LastMessageAt || "",
                UpdatedOn: conv.LastMessageAt || "",
                senderName: conv.lastMessageSender,
            }
            : undefined,
        unreadCount: Number(conv.unreadCount) || 0,
    })) as ConversationDataI[];
};

// Get conversation messages
export const getConversationMessages = async (
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
    trx: typeof db = db
): Promise<MessageDataI[]> => {
    // Verify user is participant
    const participant = await trx
        .select()
        .from(ConversationParticipant)
        .where(
            and(
                eq(ConversationParticipant.ConversationId, conversationId),
                eq(ConversationParticipant.UserId, userId)
            )
        )
        .limit(1);

    if (!participant[0]) {
        throw new Error("Unauthorized: Not a participant of this conversation");
    }

    const messages = await trx
        .select({
            Id: Message.Id,
            ConversationId: Message.ConversationId,
            SenderId: Message.SenderId,
            Content: Message.Content,
            Status: Message.Status,
            IsEdited: Message.IsEdited,
            ReplyToId: Message.ReplyToId,
            AttachmentUrl: Message.AttachmentUrl,
            AttachmentType: Message.AttachmentType,
            CreatedOn: Message.CreatedOn,
            UpdatedOn: Message.UpdatedOn,
            senderName: User.FullName,
            senderAvatar: User.ImageUrl,
        })
        .from(Message)
        .innerJoin(User, eq(User.Id, Message.SenderId))
        .where(eq(Message.ConversationId, conversationId))
        .orderBy(desc(Message.CreatedOn))
        .limit(limit)
        .offset(offset);

    // Get reactions for these messages
    const messageIds = messages.map((m) => m.Id);
    const reactions = messageIds.length
        ? await trx
            .select({
                Id: MessageReaction.Id,
                MessageId: MessageReaction.MessageId,
                UserId: MessageReaction.UserId,
                Emoji: MessageReaction.Emoji,
                CreatedOn: MessageReaction.CreatedOn,
                userName: User.FullName,
            })
            .from(MessageReaction)
            .innerJoin(User, eq(User.Id, MessageReaction.UserId))
            .where(inArray(MessageReaction.MessageId, messageIds))
        : [];

    // Attach reactions to messages
    return messages.map((msg) => ({
        ...msg,
        reactions: reactions.filter((r) => r.MessageId === msg.Id),
    })) as MessageDataI[];
};

// Create conversation
export const createConversation = async (
    data: CreateConversationInput,
    userId: string,
    organizationId: string,
    trx: typeof db = db
) => {
    // For direct conversations, check if one already exists
    if (data.Type === "direct" && data.participantIds.length === 1) {
        const existingConv = await trx
            .select({ Id: Conversation.Id })
            .from(Conversation)
            .innerJoin(
                ConversationParticipant,
                eq(ConversationParticipant.ConversationId, Conversation.Id)
            )
            .where(
                and(
                    eq(Conversation.Type, "direct"),
                    eq(Conversation.OrganizationId, organizationId),
                    or(
                        eq(ConversationParticipant.UserId, userId),
                        eq(ConversationParticipant.UserId, data.participantIds[0])
                    )
                )
            )
            .groupBy(Conversation.Id)
            .having(sql`COUNT(DISTINCT ${ConversationParticipant.UserId}) = 2`)
            .limit(1);

        if (existingConv[0]) {
            return existingConv[0];
        }
    }

    // Create new conversation
    const [conversation] = await trx
        .insert(Conversation)
        .values({
            Name: data.Name || null,
            Type: data.Type,
            OrganizationId: organizationId,
            ClassId: data.ClassId || null,
            CreatedBy: userId,
        })
        .returning({ Id: Conversation.Id });

    // Add participants
    const participantIds = [...new Set([userId, ...data.participantIds])];
    await trx.insert(ConversationParticipant).values(
        participantIds.map((pid) => ({
            ConversationId: conversation.Id,
            UserId: pid,
            IsAdmin: pid === userId,
        }))
    );

    return conversation;
};

// Send message
export const sendMessage = async (
    data: SendMessageInput,
    userId: string,
    trx: typeof db = db
) => {
    // Verify user is participant
    const participant = await trx
        .select()
        .from(ConversationParticipant)
        .where(
            and(
                eq(ConversationParticipant.ConversationId, data.ConversationId),
                eq(ConversationParticipant.UserId, userId)
            )
        )
        .limit(1);

    if (!participant[0]) {
        throw new Error("Unauthorized: Not a participant of this conversation");
    }

    // Insert message
    const [message] = await trx
        .insert(Message)
        .values({
            ConversationId: data.ConversationId,
            SenderId: userId,
            Content: data.Content,
            ReplyToId: data.ReplyToId || null,
            AttachmentUrl: data.AttachmentUrl || null,
            AttachmentType: data.AttachmentType || null,
        })
        .returning();

    // Update conversation last message time
    await trx
        .update(Conversation)
        .set({
            LastMessageAt: new Date().toISOString(),
            UpdatedOn: new Date().toISOString(),
        })
        .where(eq(Conversation.Id, data.ConversationId));

    return message;
};

// Mark messages as read
export const markMessagesAsRead = async (
    conversationId: string,
    userId: string,
    trx: typeof db = db
) => {
    await trx
        .update(ConversationParticipant)
        .set({
            LastReadAt: new Date().toISOString(),
        })
        .where(
            and(
                eq(ConversationParticipant.ConversationId, conversationId),
                eq(ConversationParticipant.UserId, userId)
            )
        );

    return { success: true };
};

// Delete message
export const deleteMessage = async (
    messageId: string,
    userId: string,
    trx: typeof db = db
) => {
    const message = await trx
        .select()
        .from(Message)
        .where(eq(Message.Id, messageId))
        .limit(1);

    if (!message[0]) {
        throw new Error("Message not found");
    }

    if (message[0].SenderId !== userId) {
        throw new Error("Unauthorized: You can only delete your own messages");
    }

    await trx.delete(Message).where(eq(Message.Id, messageId));

    return { success: true };
};

// Update message
export const updateMessage = async (
    messageId: string,
    content: string,
    userId: string,
    trx: typeof db = db
) => {
    const message = await trx
        .select()
        .from(Message)
        .where(eq(Message.Id, messageId))
        .limit(1);

    if (!message[0]) {
        throw new Error("Message not found");
    }

    if (message[0].SenderId !== userId) {
        throw new Error("Unauthorized: You can only edit your own messages");
    }

    const [updated] = await trx
        .update(Message)
        .set({
            Content: content,
            IsEdited: true,
            UpdatedOn: new Date().toISOString(),
        })
        .where(eq(Message.Id, messageId))
        .returning();

    return updated;
};

// Add reaction
export const addReaction = async (
    messageId: string,
    emoji: string,
    userId: string,
    trx: typeof db = db
) => {
    // Check if reaction already exists
    const existing = await trx
        .select()
        .from(MessageReaction)
        .where(
            and(
                eq(MessageReaction.MessageId, messageId),
                eq(MessageReaction.UserId, userId),
                eq(MessageReaction.Emoji, emoji)
            )
        )
        .limit(1);

    if (existing[0]) {
        // Remove reaction if it exists
        await trx
            .delete(MessageReaction)
            .where(eq(MessageReaction.Id, existing[0].Id));
        return { action: "removed" };
    }

    // Add new reaction
    await trx.insert(MessageReaction).values({
        MessageId: messageId,
        UserId: userId,
        Emoji: emoji,
    });

    return { action: "added" };
};