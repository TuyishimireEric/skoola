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
  Send,
  Sparkles,
  Bot,
  Users,
  RefreshCw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useStudentDetail } from "@/hooks/user/useStudentDetails";
import { useAIInsights } from "@/hooks/user/useAIInsights";

interface Recommendation {
  id: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  replies?: Array<{
    id: string;
    author: {
      name: string;
      role: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }>;
}

const StudentDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading, isError, error } = useStudentDetail(studentId);

  // Fetch AI insights automatically when student data is loaded
  const {
    data: aiInsightsData,
    isLoading: isLoadingInsights,
    isError: isInsightsError,
    refetch: refetchInsights,
  } = useAIInsights(studentId, !!student);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showAIInsights, setShowAIInsights] = useState(false);

  const attendanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const performanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const attendanceChartInstance = useRef<Chart | null>(null);
  const performanceChartInstance = useRef<Chart | null>(null);

  // Auto-show AI insights when they're loaded
  useEffect(() => {
    if (aiInsightsData && !isLoadingInsights) {
      setShowAIInsights(true);
    }
  }, [aiInsightsData, isLoadingInsights]);

  // Mock recommendations data - Replace with actual API call
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "1",
      author: {
        name: "Mrs. Johnson",
        role: "Math Teacher",
        avatar: "",
      },
      content: "Great improvement in algebra this term! Keep up the good work with homework consistency.",
      createdAt: "2024-11-08T10:30:00Z",
      replies: [
        {
          id: "r1",
          author: {
            name: "Mrs. Kalisa",
            role: "Parent",
            avatar: "",
          },
          content: "Thank you for the feedback! We'll continue to support at home.",
          createdAt: "2024-11-09T14:20:00Z",
        },
      ],
    },
  ]);

  useEffect(() => {
    if (!student) return;

    // Attendance Chart
    if (attendanceChartRef.current) {
      const ctx = attendanceChartRef.current.getContext("2d");
      if (ctx) {
        if (attendanceChartInstance.current) {
          attendanceChartInstance.current.destroy();
        }

        const attendanceData = calculateDailyAttendance(student.attendanceHistory);

        attendanceChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: attendanceData.labels,
            datasets: [
              {
                label: "Attendance",
                data: attendanceData.values,
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                pointRadius: 3,
                pointBackgroundColor: "#10b981",
                spanGaps: true,
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
                callbacks: {
                  label: function (context) {
                    if (context.parsed.y === 100) return "Present";
                    if (context.parsed.y === 0) return "Absent";
                    return "No Data";
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: function (value) {
                    if (value === 100) return "Present";
                    if (value === 0) return "Absent";
                    return "";
                  },
                },
                grid: { color: "rgba(0, 0, 0, 0.05)" },
              },
              x: {
                grid: { display: false },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: {
                    size: 10,
                  },
                },
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

        const coursesWithPerformance = student.courses
          .filter((c) => c.performance?.total !== null && c.performance?.total !== undefined)
          .slice(0, 8);

        performanceChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: coursesWithPerformance.map((c) => {
              const title = c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title;
              return title;
            }),
            datasets: [
              {
                label: "Total Score",
                data: coursesWithPerformance.map((c) => c.performance?.total || 0),
                backgroundColor: coursesWithPerformance.map((c) => {
                  const score = c.performance?.total || 0;
                  return score >= 85
                    ? "#10b981"
                    : score >= 70
                      ? "#3b82f6"
                      : score >= 50
                        ? "#f59e0b"
                        : "#ef4444";
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
                callbacks: {
                  title: function (context) {
                    const course = coursesWithPerformance[context[0].dataIndex];
                    return course.title;
                  },
                  label: function (context) {
                    return `Total: ${context.parsed.y}%`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                  callback: function (value) {
                    return value + "%";
                  },
                },
              },
              x: {
                grid: { display: false },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: {
                    size: 10,
                  },
                },
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

  type AttendanceStatus = "present" | "absent" | "late" | string;

  interface AttendanceEntry {
    date: string;
    status: AttendanceStatus;
  }

  interface AttendanceData {
    labels: string[];
    values: number[];
  }

  const calculateDailyAttendance = (history: AttendanceEntry[]): AttendanceData => {
    const days = 30;
    const labels: string[] = [];
    const values: number[] = [];

    const attendanceMap: Map<string, AttendanceStatus> = new Map();
    history.forEach((a: AttendanceEntry) => {
      const dateStr = new Date(a.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
      attendanceMap.set(dateStr, a.status);
    });

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });

      const status = attendanceMap.get(dateStr);
      let value = 0;

      if (status === "present" || status === "late") {
        value = 100;
      } else if (status === "absent") {
        value = 0;
      } else {
        value = 0;
      }

      if (i % 3 === 0 || i === 0) {
        labels.push(dateStr);
      } else {
        labels.push("");
      }
      values.push(value);
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
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const newRecommendation: Recommendation = {
      id: Date.now().toString(),
      author: {
        name: "Current User",
        role: "Teacher",
        avatar: "",
      },
      content: newComment,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setRecommendations([newRecommendation, ...recommendations]);
    setNewComment("");
  };

  const handlePostReply = (recommendationId: string) => {
    if (!replyContent.trim()) return;

    setRecommendations(
      recommendations.map((rec) => {
        if (rec.id === recommendationId) {
          return {
            ...rec,
            replies: [
              ...(rec.replies || []),
              {
                id: Date.now().toString(),
                author: {
                  name: "Current User",
                  role: "Parent",
                  avatar: "",
                },
                content: replyContent,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return rec;
      })
    );

    setReplyContent("");
    setReplyingTo(null);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "critical":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load student</h3>
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
            <h1 className="text-xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-sm text-gray-600">View and manage student information</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{student.fullName}</h2>
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h3>
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Parent/Guardian</h3>
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
                    <p className="text-sm text-gray-500">No parent information available</p>
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
            <p className="text-2xl font-bold text-green-600">{student.stats.attendanceRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              Last activity: {getTimeAgo(student.stats.lastActivity)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Performance Score</p>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{student.stats.performanceScore}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {student.stats.totalCourses} courses enrolled
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Total Stars</p>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{student.stats.totalStars}</p>
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

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="space-y-6">
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Trend</h3>
                  <div className="h-64">
                    <canvas ref={attendanceChartRef} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Course Performance</h3>
                  <div className="h-64">
                    <canvas ref={performanceChartRef} />
                  </div>
                </div>
              </div>

              {/* Performance Details Table */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Detailed Performance Scores
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">
                            Course
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
                          <th className="text-left p-3 text-xs font-semibold text-gray-700">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {student.courses.map((course) => {
                          const perf = course.performance;
                          const hasData = perf !== null;

                          return (
                            <tr key={course.id} className="hover:bg-gray-50">
                              <td className="p-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {course.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{course.subject}</p>
                                </div>
                              </td>
                              <td className="p-3 text-center text-sm text-gray-700">
                                {hasData && perf.assignment1 !== null ? (
                                  <span
                                    className={`font-medium ${perf.assignment1 >= 85
                                      ? "text-green-600"
                                      : perf.assignment1 >= 70
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                      }`}
                                  >
                                    {perf.assignment1}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-sm text-gray-700">
                                {hasData && perf.assignment2 !== null ? (
                                  <span
                                    className={`font-medium ${perf.assignment2 >= 85
                                      ? "text-green-600"
                                      : perf.assignment2 >= 70
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                      }`}
                                  >
                                    {perf.assignment2}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-sm text-gray-700">
                                {hasData && perf.cat !== null ? (
                                  <span
                                    className={`font-medium ${perf.cat >= 85
                                      ? "text-green-600"
                                      : perf.cat >= 70
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                      }`}
                                  >
                                    {perf.cat}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-sm text-gray-700">
                                {hasData && perf.exam !== null ? (
                                  <span
                                    className={`font-medium ${perf.exam >= 85
                                      ? "text-green-600"
                                      : perf.exam >= 70
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                      }`}
                                  >
                                    {perf.exam}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {hasData && perf.total !== null ? (
                                  <span
                                    className={`font-bold text-sm ${perf.total >= 85
                                      ? "text-green-600"
                                      : perf.total >= 70
                                        ? "text-blue-600"
                                        : "text-orange-600"
                                      }`}
                                  >
                                    {perf.total}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {hasData && perf.grade ? (
                                  <span
                                    className={`px-2 py-1 text-xs font-bold rounded ${perf.total && perf.total >= 85
                                      ? "bg-green-100 text-green-700"
                                      : perf.total && perf.total >= 70
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                      }`}
                                  >
                                    {perf.grade}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {hasData && perf.remarks ? (
                                  <span className="text-xs">{perf.remarks}</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">No remarks</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Courses Breakdown */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Courses & Performance</h3>
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
                          <h4 className="font-semibold text-sm text-gray-900">{course.title}</h4>
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
                        <p className="text-xs text-gray-600 mb-2">{course.subject}</p>
                        {hasPerformance ? (
                          <>
                            <div className="flex items-end gap-2 mb-2">
                              <p className="text-2xl font-bold text-gray-900">{score}%</p>
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
                          <p className="text-sm text-gray-500">No performance data yet</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations & Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recommendations & Comments</h3>
              <p className="text-sm text-gray-600">
                Teachers and parents can share feedback and recommendations
              </p>
            </div>
          </div>

          {/* New Comment Input */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback, recommendations, or observations about the student..."
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500">
                  Your comment will be visible to teachers and parents
                </p>
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No recommendations yet. Be the first to share feedback!
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {getInitials(rec.author.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{rec.author.name}</h4>
                        <span className="text-xs text-gray-500">• {rec.author.role}</span>
                        <span className="text-xs text-gray-400">• {getTimeAgo(rec.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{rec.content}</p>

                      {/* Replies */}
                      {rec.replies && rec.replies.length > 0 && (
                        <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-4 mb-3">
                          {rec.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {getInitials(reply.author.name)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-xs text-gray-900">
                                    {reply.author.name}
                                  </h5>
                                  <span className="text-xs text-gray-500">• {reply.author.role}</span>
                                  <span className="text-xs text-gray-400">
                                    • {getTimeAgo(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === rec.id ? (
                        <div className="ml-4 mt-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handlePostReply(rec.id)}
                              disabled={!replyContent.trim()}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              <Send className="w-3 h-3" />
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(rec.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI-Powered Insights</h3>
                <p className="text-sm text-gray-600">
                  {isLoadingInsights
                    ? "Generating personalized recommendations..."
                    : "Personalized recommendations powered by AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isLoadingInsights && (
                <button
                  onClick={() => refetchInsights()}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium text-purple-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              )}
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium text-purple-700"
              >
                <Sparkles className="w-4 h-4" />
                {showAIInsights ? "Hide" : "Show"} Insights
              </button>
            </div>
          </div>

          {isLoadingInsights && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Analyzing student performance...</p>
              </div>
            </div>
          )}

          {isInsightsError && !isLoadingInsights && (
            <div className="text-center py-6">
              <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">Failed to generate AI insights</p>
              <button
                onClick={() => refetchInsights()}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {showAIInsights && aiInsightsData && !isLoadingInsights && (
            <div className="space-y-4 mt-4">
              {/* Summary */}
              {aiInsightsData.summary && (
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-sm text-purple-900 mb-2">Overall Assessment</h4>
                  <p className="text-sm text-gray-700">{aiInsightsData.summary}</p>
                </div>
              )}

              {/* Insights */}
              {aiInsightsData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${insight.type === "positive"
                    ? "bg-green-50 border-green-200"
                    : insight.type === "warning"
                      ? "bg-orange-50 border-orange-200"
                      : insight.type === "critical"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 ${insight.type === "positive"
                        ? "text-green-600"
                        : insight.type === "warning"
                          ? "text-orange-600"
                          : insight.type === "critical"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                    >
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-semibold text-sm ${insight.type === "positive"
                            ? "text-green-900"
                            : insight.type === "warning"
                              ? "text-orange-900"
                              : insight.type === "critical"
                                ? "text-red-900"
                                : "text-blue-900"
                            }`}
                        >
                          {insight.title}
                        </h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${insight.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : insight.priority === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {insight.priority}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${insight.type === "positive"
                          ? "text-green-700"
                          : insight.type === "warning"
                            ? "text-orange-700"
                            : insight.type === "critical"
                              ? "text-red-700"
                              : "text-blue-700"
                          }`}
                      >
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
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