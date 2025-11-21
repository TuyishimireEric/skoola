// @/types/Chat.ts
import { z } from "zod";

export interface ConversationDataI {
    Id: string;
    Name: string | null;
    Type: "direct" | "group" | "class";
    OrganizationId: string;
    ClassId?: string | null;
    ImageUrl: string | null;
    LastMessageAt: string | null;
    CreatedBy: string;
    CreatedOn: string;
    UpdatedOn: string;
    // Computed fields
    participants?: ParticipantDataI[];
    lastMessage?: MessageDataI;
    unreadCount?: number;
}

export interface ParticipantDataI {
    Id: string;
    ConversationId: string;
    UserId: string;
    IsAdmin: boolean;
    LastReadAt: string | null;
    JoinedAt: string;
    // User info
    userName?: string;
    userAvatar?: string;
    userRole?: string;
}

export interface MessageDataI {
    Id: string;
    ConversationId: string;
    SenderId: string;
    Content: string;
    Status: "sent" | "delivered" | "read";
    IsEdited: boolean;
    ReplyToId?: string | null;
    AttachmentUrl?: string | null;
    AttachmentType?: string | null;
    CreatedOn: string;
    UpdatedOn: string;
    // Sender info
    senderName?: string;
    senderAvatar?: string;
    // Reply info
    replyToMessage?: MessageDataI;
    // Reactions
    reactions?: ReactionDataI[];
}

export interface ReactionDataI {
    Id: string;
    MessageId: string;
    UserId: string;
    Emoji: string;
    CreatedOn: string;
    userName?: string;
}

export interface TypingIndicatorDataI {
    ConversationId: string;
    UserId: string;
    userName: string;
    IsTyping: boolean;
}

// Validation schemas
export const createConversationSchema = z.object({
    Name: z.string().optional(),
    Type: z.enum(["direct", "group", "class"]),
    participantIds: z.array(z.string()).min(1),
    ClassId: z.string().optional(),
});

export const sendMessageSchema = z.object({
    ConversationId: z.string().uuid(),
    Content: z.string().min(1).max(5000),
    ReplyToId: z.string().uuid().optional(),
    AttachmentUrl: z.string().url().optional(),
    AttachmentType: z.string().optional(),
});

export const updateMessageSchema = z.object({
    Content: z.string().min(1).max(5000),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;