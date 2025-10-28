"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Award,
  BookOpen,
  MessageSquare,
  Bell,
  Download,
  Edit,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useStudentDetail } from "@/hooks/user/useStudentDetails";

const StudentDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading, isError, error } = useStudentDetail(studentId);

  const [activeTab, setActiveTab] = useState<"overview" | "progress">("overview");
  const attendanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const performanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const attendanceChartInstance = useRef<Chart | null>(null);
  const performanceChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!student) return;

    // Attendance Chart
    if (attendanceChartRef.current) {
      const ctx = attendanceChartRef.current.getContext("2d");
      if (ctx) {
        if (attendanceChartInstance.current) {
          attendanceChartInstance.current.destroy();
        }

        // Calculate weekly attendance trend
        const attendanceData = calculateWeeklyAttendance(student.attendanceHistory);

        attendanceChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: attendanceData.labels,
            datasets: [
              {
                label: "Attendance %",
                data: attendanceData.values,
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "#10b981",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
              },
            },
            scales: {
              y: {
                beginAtZero: false,
                min: 0,
                max: 100,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        });
      }
    }

    // Performance Chart
    if (performanceChartRef.current) {
      const ctx = performanceChartRef.current.getContext("2d");
      if (ctx) {
        if (performanceChartInstance.current) {
          performanceChartInstance.current.destroy();
        }

        // Get courses with performance data
        const coursesWithPerformance = student.courses
          .filter((c) => c.performance?.total !== null)
          .slice(0, 5);

        performanceChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: coursesWithPerformance.map((c) => c.subject || c.title.substring(0, 10)),
            datasets: [
              {
                label: "Score",
                data: coursesWithPerformance.map((c) => c.performance?.total || 0),
                backgroundColor: coursesWithPerformance.map((c) => {
                  const score = c.performance?.total || 0;
                  return score >= 85
                    ? "#10b981"
                    : score >= 70
                      ? "#3b82f6"
                      : "#f59e0b";
                }),
                borderWidth: 0,
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        });
      }
    }

    return () => {
      if (attendanceChartInstance.current) {
        attendanceChartInstance.current.destroy();
      }
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy();
      }
    };
  }, [student]);

  // Helper function to calculate weekly attendance
  const calculateWeeklyAttendance = (history: any[]) => {
    const weeks = 5;
    const labels = [];
    const values = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i - 1) * 7);

      const weekAttendance = history.filter((a) => {
        const date = new Date(a.date);
        return date >= weekStart && date < weekEnd;
      });

      const presentCount = weekAttendance.filter(
        (a) => a.status === "present" || a.status === "late"
      ).length;

      const rate =
        weekAttendance.length > 0
          ? (presentCount / weekAttendance.length) * 100
          : 0;

      labels.push(i === 0 ? "Current" : `Week ${weeks - i}`);
      values.push(Math.round(rate));
    }

    return { labels, values };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "excellent":
        return "bg-green-100 text-green-700 border-green-300";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "critical":
      case "inactive":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load student
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Student not found"}
          </p>
          <button
            onClick={() => router.push("/students")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const displayAvatar = student.avatar || getInitials(student.fullName);
  const riskLevel =
    student.stats.dropoutRisk >= 70
      ? "critical"
      : student.stats.dropoutRisk >= 50
        ? "warning"
        : student.stats.dropoutRisk >= 30
          ? "good"
          : "excellent";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/students")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-1xl font-bold text-gray-900">
              Student Profile
            </h1>
            <p className="text-sm text-gray-600">
              View and manage student information
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Student Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.fullName}
                  className="w-24 h-24 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl mb-3">
                  {displayAvatar}
                </div>
              )}
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                  riskLevel
                )}`}
              >
                <CheckCircle className="w-3 h-3" />
                <span className="capitalize">{riskLevel}</span>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {student.fullName}
                  </h2>
                  <p className="text-gray-600">{student.grade}</p>
                  <p className="text-sm text-gray-500">
                    {student.userName && `@${student.userName}`}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Contact Information
                  </h3>
                  {student.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span>{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{student.address}</span>
                    </div>
                  )}
                </div>

                {/* Parent Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Parent/Guardian
                  </h3>
                  {student.parent ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-green-600" />
                        <span>{student.parent.name}</span>
                      </div>
                      {student.parent.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span>{student.parent.phone}</span>
                        </div>
                      )}
                      {student.dateOfBirth && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span>
                            {formatDate(student.dateOfBirth)} ({student.age} years old)
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No parent information available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Attendance Rate</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {student.stats.attendanceRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last activity: {getTimeAgo(student.stats.lastActivity)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Performance Score</p>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {student.stats.performanceScore}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {student.stats.totalCourses} courses enrolled
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Total Stars</p>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {student.stats.totalStars}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current streak: {student.stats.currentStreak} days
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Dropout Risk</p>
              <AlertTriangle
                className={`w-4 h-4 ${student.stats.dropoutRisk >= 70
                  ? "text-red-600"
                  : student.stats.dropoutRisk >= 50
                    ? "text-orange-600"
                    : "text-green-600"
                  }`}
              />
            </div>
            <p
              className={`text-2xl font-bold ${student.stats.dropoutRisk >= 70
                ? "text-red-600"
                : student.stats.dropoutRisk >= 50
                  ? "text-orange-600"
                  : "text-green-600"
                }`}
            >
              {student.stats.dropoutRisk}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {student.stats.dropoutRisk < 30
                ? "Low risk level"
                : student.stats.dropoutRisk < 50
                  ? "Medium risk level"
                  : student.stats.dropoutRisk < 70
                    ? "High risk level"
                    : "Critical risk level"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "overview"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "progress"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                Progress
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Attendance Trend
                    </h3>
                    <div className="h-64">
                      <canvas ref={attendanceChartRef} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Course Performance
                    </h3>
                    <div className="h-64">
                      <canvas ref={performanceChartRef} />
                    </div>
                  </div>
                </div>

                {/* Courses Breakdown */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Courses & Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {student.courses.map((course) => {
                      const hasPerformance = course.performance !== null;
                      const score = course.performance?.total || 0;
                      const grade = course.performance?.grade || "N/A";

                      return (
                        <div
                          key={course.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {course.title}
                            </h4>
                            {hasPerformance && (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${score >= 85
                                  ? "bg-green-100 text-green-700"
                                  : score >= 70
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                  }`}
                              >
                                {grade}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {course.subject}
                          </p>
                          {hasPerformance ? (
                            <>
                              <div className="flex items-end gap-2 mb-2">
                                <p className="text-2xl font-bold text-gray-900">
                                  {score}%
                                </p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${score >= 85
                                    ? "bg-green-500"
                                    : score >= 70
                                      ? "bg-blue-500"
                                      : "bg-orange-500"
                                    }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              {course.performance?.remarks && (
                                <p className="text-xs text-gray-600 mt-2">
                                  {course.performance.remarks}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No performance data yet
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Academic Progress
                  </h3>
                  <div
                    className={`border rounded-xl p-6 ${student.stats.performanceScore >= 80
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : student.stats.performanceScore >= 60
                        ? "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200"
                        : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
                      }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${student.stats.performanceScore >= 80
                          ? "bg-green-500"
                          : student.stats.performanceScore >= 60
                            ? "bg-blue-500"
                            : "bg-orange-500"
                          }`}
                      >
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4
                          className={`font-bold ${student.stats.performanceScore >= 80
                            ? "text-green-900"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-900"
                              : "text-orange-900"
                            }`}
                        >
                          {student.stats.performanceScore >= 80
                            ? "Strong Academic Performance"
                            : student.stats.performanceScore >= 60
                              ? "Good Academic Progress"
                              : "Needs Improvement"}
                        </h4>
                        <p
                          className={`text-sm ${student.stats.performanceScore >= 80
                            ? "text-green-700"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-700"
                              : "text-orange-700"
                            }`}
                        >
                          {student.stats.performanceScore >= 80
                            ? "Student is excelling in most subjects"
                            : student.stats.performanceScore >= 60
                              ? "Student is making steady progress"
                              : "Student may need additional support"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p
                          className={`text-sm mb-1 ${student.stats.performanceScore >= 80
                            ? "text-green-700"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-700"
                              : "text-orange-700"
                            }`}
                        >
                          Performance
                        </p>
                        <p
                          className={`text-2xl font-bold ${student.stats.performanceScore >= 80
                            ? "text-green-900"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-900"
                              : "text-orange-900"
                            }`}
                        >
                          {student.stats.performanceScore}%
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-sm mb-1 ${student.stats.performanceScore >= 80
                            ? "text-green-700"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-700"
                              : "text-orange-700"
                            }`}
                        >
                          Total Courses
                        </p>
                        <p
                          className={`text-2xl font-bold ${student.stats.performanceScore >= 80
                            ? "text-green-900"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-900"
                              : "text-orange-900"
                            }`}
                        >
                          {student.stats.totalCourses}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-sm mb-1 ${student.stats.performanceScore >= 80
                            ? "text-green-700"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-700"
                              : "text-orange-700"
                            }`}
                        >
                          Total Stars
                        </p>
                        <p
                          className={`text-2xl font-bold ${student.stats.performanceScore >= 80
                            ? "text-green-900"
                            : student.stats.performanceScore >= 60
                              ? "text-blue-900"
                              : "text-orange-900"
                            }`}
                        >
                          {student.stats.totalStars}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Areas of Improvement */}
                {student.stats.performanceScore < 70 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Areas of Improvement
                    </h3>
                    <div className="space-y-3">
                      {student.courses
                        .filter((c) => c.performance && c.performance.total && c.performance.total < 70)
                        .map((course) => (
                          <div
                            key={course.id}
                            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                              <h4 className="font-semibold text-sm text-orange-900">
                                {course.title} - {course.performance?.total}%
                              </h4>
                            </div>
                            <p className="text-sm text-orange-700">
                              Consider additional support to improve understanding
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.stats.attendanceRate >= 95 && (
                      <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <Award className="w-8 h-8 text-purple-600" />
                        <div>
                          <h4 className="font-semibold text-sm text-purple-900">
                            Excellent Attendance
                          </h4>
                          <p className="text-xs text-purple-700">
                            {student.stats.attendanceRate}% attendance rate
                          </p>
                        </div>
                      </div>
                    )}
                    {student.stats.currentStreak >= 7 && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-sm text-blue-900">
                            Active Learner
                          </h4>
                          <p className="text-xs text-blue-700">
                            {student.stats.currentStreak} day streak
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                Send Message
              </span>
            </button>
            {student.parent && (
              <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <Phone className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Call Parent
                </span>
              </button>
            )}
            <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                View Courses
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <Download className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                Generate Report
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;