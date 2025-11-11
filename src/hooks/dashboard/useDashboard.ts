import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/server/queries/skoolaDashboard";

interface ApiResponse {
    status: "Success" | "Error";
    message: string;
    data: DashboardStats | null;
}

export function useDashboard(grade?: string) {
    return useQuery({
        queryKey: ["dashboard", grade],
        queryFn: async () => {
            const url = grade
                ? `/api/dashboard?grade=${encodeURIComponent(grade)}`
                : "/api/dashboard";

            const response = await fetch(url);

            if (!response.ok) {
                const errorData: ApiResponse = await response.json();
                throw new Error(errorData.message || "Failed to fetch dashboard data");
            }

            const result: ApiResponse = await response.json();

            if (result.status === "Error" || !result.data) {
                throw new Error(result.message || "Failed to fetch dashboard data");
            }

            return result.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });
}