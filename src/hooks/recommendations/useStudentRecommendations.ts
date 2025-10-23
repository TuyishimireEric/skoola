// /hooks/recommendations/useStudentRecommendations.ts
import showToast from "@/utils/showToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface RecommendationAuthor {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
}

export interface RecommendationReply {
    id: string;
    recommendationId: string;
    content: string;
    createdAt: string;
    author: RecommendationAuthor;
}

export interface Recommendation {
    id: string;
    studentId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: RecommendationAuthor;
    replies: RecommendationReply[];
}

export function useRecommendations(studentId: string) {
    return useQuery({
        queryKey: ["recommendations", studentId],
        queryFn: async () => {
            const response = await axios.get(
                `/api/students/${studentId}/recommendations`
            );
            return response.data.data as Recommendation[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useCreateRecommendation(studentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (content: string) => {
            const response = await axios.post(
                `/api/students/${studentId}/recommendations`,
                { content }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["recommendations", studentId],
            });
            showToast("Recommendation posted successfully", "success");
        },
        onError: () => {
            showToast(
                "Failed to post recommendation", "error"
            );
        },
    });
}

// Generic reply mutation that can be used for any recommendation
export function useCreateReplyMutation(studentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            recommendationId,
            content,
        }: {
            recommendationId: string;
            content: string;
        }) => {
            const response = await axios.post(
                `/api/students/${studentId}/recommendations/${recommendationId}/reply`,
                { content }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["recommendations", studentId],
            });
            showToast("Reply posted successfully", "success");
        },
        onError: () => {
            showToast("Failed to post reply", "error");
        },
    });
}