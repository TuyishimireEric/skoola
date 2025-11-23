// @/hooks/chat/useMessages.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageDataI, SendMessageInput } from "@/types/Chat";

export const useMessages = (conversationId: string | null) => {
    return useQuery<MessageDataI[]>({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const response = await fetch(
                `/api/chat/conversations/${conversationId}/messages`
            );
            if (!response.ok) throw new Error("Failed to fetch messages");
            const result = await response.json();
            return result.data;
        },
        enabled: !!conversationId,
        refetchInterval: 2000, // Poll every 2 seconds
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: SendMessageInput) => {
            const response = await fetch(
                `/api/chat/conversations/${data.ConversationId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to send message");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.ConversationId],
            });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await fetch(
                `/api/chat/conversations/${conversationId}/messages`,
                {
                    method: "PATCH",
                }
            );

            if (!response.ok) throw new Error("Failed to mark as read");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (messageId: string) => {
            const response = await fetch(`/api/chat/messages/${messageId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete message");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};

export const useUpdateMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            content,
        }: {
            messageId: string;
            content: string;
        }) => {
            const response = await fetch(`/api/chat/messages/${messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Content: content }),
            });

            if (!response.ok) throw new Error("Failed to update message");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
};

export const useAddReaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            messageId,
            emoji,
        }: {
            messageId: string;
            emoji: string;
        }) => {
            const response = await fetch(
                `/api/chat/messages/${messageId}/reactions`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ emoji }),
                }
            );

            if (!response.ok) throw new Error("Failed to add reaction");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
};