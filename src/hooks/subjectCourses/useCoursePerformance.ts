// @/hooks/courses/useCoursePerformance.ts
import { useQuery } from "@tanstack/react-query";

interface UseCoursePerformanceParams {
    courseId: string;
    term?: string;
    academicYear?: string;
}

export const useCoursePerformance = (params: UseCoursePerformanceParams) => {
    return useQuery({
        queryKey: ["coursePerformance", params],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                ...(params.term && { term: params.term }),
                ...(params.academicYear && { academicYear: params.academicYear }),
            });

            const response = await fetch(
                `/api/courses/${params.courseId}/performance?${searchParams.toString()}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch course performance");
            }

            return response.json();
        },
        staleTime: 30000,
        enabled: !!params.courseId,
    });
};
