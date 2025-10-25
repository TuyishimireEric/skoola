import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_recordCourseSection } from "./services";
import axios from "axios";
import { CourseSectionI } from "@/types/Course";

export const useRecordCourseSection = () => {
  const queryClient = useQueryClient();

  const recordCourseSection = useMutation({
    mutationFn: FC_recordCourseSection,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["coursesSections"] }),
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
        queryClient.invalidateQueries({ queryKey: ["todayProgress"] }),
        queryClient.invalidateQueries({ queryKey: ["kidProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["goals"] }),
        queryClient.invalidateQueries({ queryKey: ["missedQuestions"] }),
      ]);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || "Registration failed";
          console.error("Error:", errorMessage);
      }
    },
  });

  const onSubmit = (formData: CourseSectionI) => {
    recordCourseSection.mutate(formData);
  };

  return {
    onSubmit,
    onSuccess: recordCourseSection.isSuccess,
    isPending: recordCourseSection.isPending,
  };
};
