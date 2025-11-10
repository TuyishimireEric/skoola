// @/app/(dashboard)/courses/[id]/page.tsx
"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Award,
  Calendar,
  User,
  BarChart3,
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  ChevronRight,
  GraduationCap,
  Plus,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

interface CourseDetail {
  Id: string;
  Title: string;
  Description?: string;
  ImageUrl?: string;
  Grade: string;
  Subject?: string;
  Status: "Draft" | "Published" | "Archived";
  Order: number;
  IsActive: boolean;
  OrganizationId: string;
  CreatedOn: string;
  UpdatedOn: string;
  CreatorName?: string;
  CreatorImage?: string;
  TotalStudents?: number;
  AveragePerformance?: number;
}

interface PerformanceData {
  Id: string;
  StudentId: string;
  StudentName: string;
  StudentGrade: string;
  StudentAvatar?: string;
  Assignment1?: number | null;
  Assignment2?: number | null;
  CAT?: number | null;
  Exam?: number | null;
  Total?: number | null;
  Grade?: string | null;
  Remarks?: string | null;
}

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "performance">("overview");
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1");
  const [selectedYear, setSelectedYear] = useState<string>("2024/2025");

  // Fetch course details
  const {
    data: courseData,
    isLoading: isLoadingCourse,
    isError: isCourseError,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch course");
      }
      return response.json();
    },
    enabled: !!courseId,
  });

  // Fetch course performance
  const {
    data: performanceData,
    isLoading: isLoadingPerformance,
    refetch: refetchPerformance,
  } = useQuery({
    queryKey: ["coursePerformance", courseId, selectedTerm, selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams({
        term: selectedTerm,
        academicYear: selectedYear,
      });
      const response = await fetch(
        `/api/courses/${courseId}/performance?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch performance");
      }
      return response.json();
    },
    enabled: !!courseId && activeTab === "performance",
  });

  const course: CourseDetail | null = courseData?.data || null;
  const performances: PerformanceData[] = performanceData?.data || [];

  const terms = ["Term 1", "Term 2", "Term 3"];
  const academicYears = ["2024/2025", "2023/2024", "2022/2023"];

  // Calculate performance statistics
  const performanceStats = React.useMemo(() => {
    if (!performances || performances.length === 0) {
      return {
        totalStudents: 0,
        avgAssignment1: 0,
        avgAssignment2: 0,
        avgCAT: 0,
        avgExam: 0,
        avgTotal: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
      };
    }

    const totals = performances.filter((p) => p.Total !== null && p.Total !== undefined);
    const assignment1s = performances.filter((p) => p.Assignment1 !== null);
    const assignment2s = performances.filter((p) => p.Assignment2 !== null);
    const cats = performances.filter((p) => p.CAT !== null);
    const exams = performances.filter((p) => p.Exam !== null);

    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    performances.forEach((p) => {
      if (p.Grade && p.Grade in gradeDistribution) {
        gradeDistribution[p.Grade as keyof typeof gradeDistribution]++;
      }
    });

    return {
      totalStudents: performances.length,
      avgAssignment1:
        assignment1s.length > 0
          ? Math.round(
              (assignment1s.reduce((sum, p) => sum + (p.Assignment1 || 0), 0) /
                assignment1s.length) *
                100
            ) / 100
          : 0,
      avgAssignment2:
        assignment2s.length > 0
          ? Math.round(
              (assignment2s.reduce((sum, p) => sum + (p.Assignment2 || 0), 0) /
                assignment2s.length) *
                100
            ) / 100
          : 0,
      avgCAT:
        cats.length > 0
          ? Math.round(
              (cats.reduce((sum, p) => sum + (p.CAT || 0), 0) / cats.length) * 100
            ) / 100
          : 0,
      avgExam:
        exams.length > 0
          ? Math.round(
              (exams.reduce((sum, p) => sum + (p.Exam || 0), 0) / exams.length) *
                100
            ) / 100
          : 0,
      avgTotal:
        totals.length > 0
          ? Math.round(
              (totals.reduce((sum, p) => sum + (p.Total || 0), 0) / totals.length) *
                100
            ) / 100
          : 0,
      gradeDistribution,
    };
  }, [performances]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete course");
      }

      alert("Course deleted successfully!");
      router.push("/courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete course. Please try again."
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700";
      case "Draft":
        return "bg-yellow-100 text-yellow-700";
      case "Archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-50";
      case "B":
        return "text-blue-600 bg-blue-50";
      case "C":
        return "text-yellow-600 bg-yellow-50";
      case "D":
        return "text-orange-600 bg-orange-50";
      case "E":
        return "text-red-600 bg-red-50";
      case "F":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (isCourseError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load course
          </h3>
          <button
            onClick={() => refetchCourse()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          {/* Course Hero */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-green-400 to-emerald-600">
              {course.ImageUrl ? (
                <Image
                  src={course.ImageUrl}
                  alt={course.Title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white opacity-50" />
                </div>
              )}

              {/* Overlay Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          course.Status
                        )}`}
                      >
                        {course.Status}
                      </span>
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-xs font-medium rounded-full">
                        {course.Grade}
                      </span>
                      {course.Subject && (
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-xs font-medium rounded-full">
                          {course.Subject}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{course.Title}</h1>
                    {course.Description && (
                      <p className="text-sm text-white/90 line-clamp-2">
                        {course.Description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Creator Info */}
                {course.CreatorName && (
                  <div className="flex items-center gap-2 mt-4">
                    {course.CreatorImage ? (
                      <Image
                        src={course.CreatorImage}
                        alt={course.CreatorName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="text-white/70">Created by</p>
                      <p className="font-medium">{course.CreatorName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              <div className="p-4 text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {course.TotalStudents || 0}
                </p>
                <p className="text-xs text-gray-600">Students</p>
              </div>

              <div className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {course.AveragePerformance
                    ? `${course.AveragePerformance}%`
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-600">Avg Performance</p>
              </div>

              <div className="p-4 text-center">
                <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(course.CreatedOn).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-600">Created</p>
              </div>

              <div className="p-4 text-center">
                <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {course.Status === "Published" ? "Active" : "Inactive"}
                </p>
                <p className="text-xs text-gray-600">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/courses/${courseId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Course
          </Link>

          <Link
            href={`/courses/${courseId}/performance`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Manage Performance
          </Link>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete Course
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "students"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Students ({course.TotalStudents || 0})
              </button>

              <button
                onClick={() => setActiveTab("performance")}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "performance"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Performance
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Course Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Course Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Grade Level</p>
                        <p className="text-sm text-gray-600">{course.Grade}</p>
                      </div>
                    </div>

                    {course.Subject && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <BookOpen className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Subject</p>
                          <p className="text-sm text-gray-600">{course.Subject}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created On</p>
                        <p className="text-sm text-gray-600">
                          {new Date(course.CreatedOn).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                        <p className="text-sm text-gray-600">
                          {new Date(course.UpdatedOn).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {course.Description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Description
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {course.Description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href={`/courses/${courseId}/performance`}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Add Performance
                          </p>
                          <p className="text-xs text-gray-600">
                            Record student scores
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                    </Link>

                    <Link
                      href={`/courses/${courseId}/edit`}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Edit className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Edit Course
                          </p>
                          <p className="text-xs text-gray-600">
                            Update course details
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </Link>

                    <button
                      onClick={() => {
                        // Export functionality
                        alert("Export functionality coming soon!");
                      }}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Download className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Export Data
                          </p>
                          <p className="text-xs text-gray-600">
                            Download reports
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Enrolled Students
                  </h3>
                  <p className="text-sm text-gray-600">
                    All students in {course.Grade} are automatically enrolled
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Auto-Enrollment
                      </p>
                      <p className="text-sm text-blue-700">
                        All students in {course.Grade} have access to this course.
                        No manual enrollment required.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {course.TotalStudents || 0} students have access to this course
                  </p>
                  <Link
                    href={`/students?grade=${encodeURIComponent(course.Grade)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    View Students
                  </Link>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term
                    </label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {terms.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {academicYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/courses/${courseId}/performance/manage?term=${selectedTerm}&year=${selectedYear}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                      <Edit className="w-4 h-4" />
                      Manage Scores
                    </Link>
                  </div>
                </div>

                {isLoadingPerformance ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading performance data...</p>
                  </div>
                ) : performances.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Performance Data
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No performance records found for {selectedTerm} {selectedYear}
                    </p>
                    <Link
                      href={`/courses/${courseId}/performance/manage?term=${selectedTerm}&year=${selectedYear}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Performance Data
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <p className="text-xs text-blue-700 mb-1">Assignment 1</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {performanceStats.avgAssignment1}%
                        </p>
                        <p className="text-xs text-blue-600">Average</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                        <p className="text-xs text-purple-700 mb-1">Assignment 2</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {performanceStats.avgAssignment2}%
                        </p>
                        <p className="text-xs text-purple-600">Average</p>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                        <p className="text-xs text-yellow-700 mb-1">CAT</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {performanceStats.avgCAT}%
                        </p>
                        <p className="text-xs text-yellow-600">Average</p>
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                        <p className="text-xs text-red-700 mb-1">Exam</p>
                        <p className="text-2xl font-bold text-red-900">
                          {performanceStats.avgExam}%
                        </p>
                        <p className="text-xs text-red-600">Average</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <p className="text-xs text-green-700 mb-1">Overall</p>
                        <p className="text-2xl font-bold text-green-900">
                          {performanceStats.avgTotal}%
                        </p>
                        <p className="text-xs text-green-600">Average</p>
                      </div>
                    </div>

                    {/* Grade Distribution */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Grade Distribution
                      </h4>
                      <div className="grid grid-cols-6 gap-3">
                        {Object.entries(performanceStats.gradeDistribution).map(
                          ([grade, count]) => (
                            <div
                              key={grade}
                              className={`p-3 rounded-lg text-center ${getGradeColor(
                                grade
                              )}`}
                            >
                              <p className="text-2xl font-bold">{count}</p>
                              <p className="text-xs font-medium">Grade {grade}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Performance Table */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Student Performance ({performances.length})
                        </h4>
                        <button
                          onClick={() => {
                            // Export to CSV functionality
                            alert("Export functionality coming soon!");
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-gray-700">
                                  Student
                                </th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-700">
                                  Assignment 1
                                </th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-700">
                                  Assignment 2
                                </th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-700">
                                  CAT
                                </th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-700">
                                  Exam
                                </th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-700">
                                  Total
                                </th>
                                <th className="text-center p-3 text-xs font-semibold text-gray-700">
                                  Grade
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {performances.map((performance) => (
                                <tr
                                  key={performance.Id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-3">
                                      {performance.StudentAvatar ? (
                                        <Image
                                          src={performance.StudentAvatar}
                                          alt={performance.StudentName}
                                          width={32}
                                          height={32}
                                          className="rounded-full"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                                          {performance.StudentName
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {performance.StudentName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {performance.StudentGrade}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="text-sm text-gray-900">
                                      {performance.Assignment1 !== null &&
                                      performance.Assignment1 !== undefined
                                        ? `${performance.Assignment1}%`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="text-sm text-gray-900">
                                      {performance.Assignment2 !== null &&
                                      performance.Assignment2 !== undefined
                                        ? `${performance.Assignment2}%`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="text-sm text-gray-900">
                                      {performance.CAT !== null &&
                                      performance.CAT !== undefined
                                        ? `${performance.CAT}%`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="text-sm text-gray-900">
                                      {performance.Exam !== null &&
                                      performance.Exam !== undefined
                                        ? `${performance.Exam}%`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {performance.Total !== null &&
                                      performance.Total !== undefined
                                        ? `${performance.Total}%`
                                        : "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    {performance.Grade ? (
                                      <span
                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getGradeColor(
                                          performance.Grade
                                        )}`}
                                      >
                                        {performance.Grade}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
