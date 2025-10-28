// @/hooks/useStudentDetail.ts
import { StudentDetailResponse } from "@/server/queries/student-details";
import { useQuery } from "@tanstack/react-query";

interface ApiResponse {
    status: "Success" | "Error";
    message: string;
    data: StudentDetailResponse | null;
}

export function useStudentDetail(studentId: string) {
    return useQuery({
        queryKey: ["student-detail", studentId],
        queryFn: async () => {
            const response = await fetch(`/api/students/${studentId}`);

            if (!response.ok) {
                const errorData: ApiResponse = await response.json();
                throw new Error(errorData.message || "Failed to fetch student details");
            }

            const result: ApiResponse = await response.json();

            if (result.status === "Error" || !result.data) {
                throw new Error(result.message || "Failed to fetch student details");
            }

            return result.data;
        },
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}