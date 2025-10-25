import { useCourses } from "@/hooks/courses/useCourses";
import { useClientSession } from "@/hooks/user/useClientSession";
import {
  BookOpen,
  Clock,
  ChevronRight,
  Sparkles,
  Users,
  Search,
  FileQuestion,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const CourseSummary = () => {
  const [searchText, setSearchText] = useState("");
  const { organizationId, currentClass } = useClientSession();

  const { data: courses, isLoading } = useCourses({
    page: 1,
    pageSize: 5,
    searchText,
    organizationId,
    classId: currentClass?.toString() ?? "",
  });

  const getProgressEmoji = (attendance: number) => {
    if (attendance < 25) return "🌱";
    if (attendance < 50) return "🌿";
    if (attendance < 75) return "🌳";
    return "🌟";
  };

  const SkeletonLoading = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-3 shadow-md border border-primary-200 animate-pulse"
        >
          <div className="flex items-center space-x-3">
            <div className="w-20 h-20 rounded-xl bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="flex items-center space-x-3 mt-1">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="mt-2">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mr-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full">
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <div className="h-2 w-6 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const NotFoundComponent = () => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-primary-200 flex flex-col items-center justify-center text-center">
      <div className="bg-primary-100 p-3 rounded-full mb-3">
        <FileQuestion className="w-12 h-12 text-primary-500" />
      </div>
      <h3 className="font-bold text-primary-800 mb-2">No courses found</h3>
      <p className="text-primary-600 text-sm mb-4">
        {searchText
          ? `We couldn't find any courses matching "${searchText}".`
          : "No courses are available at the moment."}
      </p>
      {searchText && (
        <button
          onClick={() => {
            setSearchText("");
          }}
          className="text-primary-600 text-sm flex items-center hover:text-primary-800"
        >
          <span>Clear search</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="col-span-3 bg-primary-50 rounded-3xl p-4 shadow-lg border-2 border-primary-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary-700 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
          Courses Attendance
        </h2>
        <div className="relative">
          <div className="flex items-center bg-white border-2 border-primary-300 rounded-full px-3 py-1 focus-within:border-primary-500">
            <Search className="w-4 h-4 text-primary-500" />
            <input
              type="text"
              placeholder="Search courses..."
              className="ml-2 text-sm focus:outline-none text-primary-700 bg-transparent w-36"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoading />
      ) : courses?.length == 0 && searchText ? (
        <NotFoundComponent />
      ) : (
        <div className="space-y-4">
          {courses?.map((course, index) => {
            const attendanceRate = course.CourseAverageAttendance ?? 0;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-3 shadow-md border border-primary-200 hover:border-primary-400 hover:shadow-lg cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-20 rounded-xl bg-primary-200 overflow-hidden relative">
                    <Image
                      src={course.ImageUrl}
                      alt={course.Title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-primary-800">
                      {course.Title}
                    </h3>

                    <div className="flex items-center space-x-3 text-xs text-primary-700 mt-1">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-primary-500" />
                        {(course.Duration ?? 0) / 60} min
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1 text-primary-500" />
                        {course.NumberOfLevels} levels
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center mb-1">
                        <Users className="w-3 h-3 mr-1 text-primary-500" />
                        <span className="text-xs font-medium text-primary-700">
                          {course.TotalStudents} Attended students
                        </span>
                      </div>

                      <div className="relative h-3 bg-green-100 rounded-full">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all duration-500 flex items-center"
                          style={{ width: `${attendanceRate}%` }}
                        >
                          {attendanceRate > 0 && (
                            <span className="absolute text-xs ml-1">
                              {getProgressEmoji(attendanceRate)}
                            </span>
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-xs font-bold text-primary-800">
                            {attendanceRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-center">
        <Link
          href="/courses"
          className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 w-max rounded-xl flex items-center space-x-2 text-sm font-bold mx-auto transition-all border-2 border-primary-400 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          <span>See All Courses</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
