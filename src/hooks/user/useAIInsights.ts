// @/hooks/user/useAIInsights.ts
import { useQuery } from "@tanstack/react-query";

interface AIInsight {
    type: "positive" | "warning" | "critical" | "info";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
}

interface AIInsightsResponse {
    insights: AIInsight[];
    summary: string;
}

export const useAIInsights = (studentId: string, enabled: boolean = true) => {
    return useQuery<AIInsightsResponse>({
        queryKey: ["ai-insights", studentId],
        queryFn: async () => {
            const response = await fetch(`/api/ai/ai-insights/${studentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch AI insights");
            }

            const result = await response.json();
            return result.data;
        },
        enabled: enabled && !!studentId,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1,
    });
};