import { useQuery } from "@tanstack/react-query";

interface UseStudentPerformanceParams {
    studentId: string;
    term?: string;
    academicYear?: string;
}

export const useStudentPerformance = (params: UseStudentPerformanceParams) => {
    return useQuery({
        queryKey: ["studentPerformance", params],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                ...(params.term && { term: params.term }),
                ...(params.academicYear && { academicYear: params.academicYear }),
            });

            const response = await fetch(
                `/api/students/${params.studentId}/performance?${searchParams.toString()}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch student performance");
            }

            return response.json();
        },
        staleTime: 30000,
        enabled: !!params.studentId,
    });
};
