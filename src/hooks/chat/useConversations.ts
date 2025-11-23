// @/hooks/chat/useConversations.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationDataI, CreateConversationInput } from "@/types/Chat";

export const useConversations = () => {
    return useQuery<ConversationDataI[]>({
        queryKey: ["conversations"],
        queryFn: async () => {
            const response = await fetch("/api/chat/conversations");
            if (!response.ok) throw new Error("Failed to fetch conversations");
            const result = await response.json();
            return result.data;
        },
        refetchInterval: 5000, // Poll every 5 seconds
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateConversationInput) => {
            const response = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create conversation");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};