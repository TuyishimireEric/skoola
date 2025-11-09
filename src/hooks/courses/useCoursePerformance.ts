// @/hooks/courses/useCoursePerformance.ts
import { useQuery } from "@tanstack/react-query";
import { CoursePerformanceDataI } from "@/types/Course";

interface UseCoursePerformanceParams {
    courseId: string;
    term: string;
    academicYear: string;
}

interface CoursePerformanceResponse {
    status: string;
    message: string;
    data: CoursePerformanceDataI[];
}

export const useCoursePerformance = ({
    courseId,
    term,
    academicYear,
}: UseCoursePerformanceParams) => {
    return useQuery({
        queryKey: ["coursePerformance", courseId, term, academicYear],
        queryFn: async (): Promise<CoursePerformanceResponse> => {
            const params = new URLSearchParams({
                term,
                academicYear,
            });

            const response = await fetch(
                `/api/courses/${courseId}/performance?${params.toString()}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch performance");
            }

            return response.json();
        },
        staleTime: 30000,
        enabled: !!courseId && !!term && !!academicYear,
    });
};