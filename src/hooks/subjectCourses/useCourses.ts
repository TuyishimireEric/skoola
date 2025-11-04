// @/hooks/courses/useCourses.ts
import { useQuery } from "@tanstack/react-query";

interface UseCoursesParams {
    page: number;
    pageSize: number;
    searchText?: string;
    grade?: string;
    subject?: string;
    status?: string;
    isActive?: boolean;
}

export const useCourses = (params: UseCoursesParams) => {
    return useQuery({
        queryKey: ["courses", params],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page.toString(),
                pageSize: params.pageSize.toString(),
                ...(params.searchText && { searchText: params.searchText }),
                ...(params.grade && { grade: params.grade }),
                ...(params.subject && { subject: params.subject }),
                ...(params.status && { status: params.status }),
                ...(params.isActive !== undefined && {
                    isActive: params.isActive.toString(),
                }),
            });

            const response = await fetch(`/api/courses?${searchParams.toString()}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch courses");
            }

            return response.json();
        },
        staleTime: 30000,
    });
};
