// @/hooks/attendance/useAttendance.ts
import { useQuery } from "@tanstack/react-query";

interface UseAttendanceParams {
  date: string;
  grade?: string;
}

interface AttendanceRecord {
  Id: string;
  StudentId: string;
  Date: string;
  Status: "present" | "late" | "absent" | "excused";
  Notes: string | null;
  StudentName?: string;
  StudentGrade?: string;
  StudentAvatar?: string;
}

interface AttendanceStats {
  date: string;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

interface AttendanceResponse {
  status: string;
  message: string;
  data: {
    attendance: AttendanceRecord[];
    stats: AttendanceStats | null;
    totalRecords: number;
  };
}

export const useAttendance = ({ date, grade }: UseAttendanceParams) => {
  return useQuery({
    queryKey: ["attendance", date, grade],
    queryFn: async (): Promise<AttendanceResponse> => {
      const params = new URLSearchParams({
        date,
        ...(grade && grade !== "" ? { grade } : {}),
      });

      const response = await fetch(`/api/attendance?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch attendance");
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
    enabled: !!date, // Only fetch when date is provided
  });
};