// @/hooks/chat/useRealtimeMessages.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MessageDataI } from "@/types/Chat";

export const useRealtimeMessages = (conversationId: string | null) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Message",
                    filter: `ConversationId=eq.${conversationId}`,
                },
                (payload) => {
                    // Add new message to cache
                    queryClient.setQueryData<MessageDataI[]>(
                        ["messages", conversationId],
                        (old) => {
                            if (!old) return [payload.new as MessageDataI];
                            return [payload.new as MessageDataI, ...old];
                        }
                    );

                    // Update conversations list
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "Message",
                    filter: `ConversationId=eq.${conversationId}`,
                },
                (payload) => {
                    // Update message in cache
                    queryClient.setQueryData<MessageDataI[]>(
                        ["messages", conversationId],
                        (old) => {
                            if (!old) return [];
                            return old.map((msg) =>
                                msg.Id === payload.new.Id
                                    ? (payload.new as MessageDataI)
                                    : msg
                            );
                        }
                    );
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "Message",
                    filter: `ConversationId=eq.${conversationId}`,
                },
                (payload) => {
                    // Remove message from cache
                    queryClient.setQueryData<MessageDataI[]>(
                        ["messages", conversationId],
                        (old) => {
                            if (!old) return [];
                            return old.filter((msg) => msg.Id !== payload.old.Id);
                        }
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);
};