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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useStudentDetail } from "@/hooks/user/useStudentDetails";
import { useAIInsights } from "@/hooks/user/useAIInsights";
import { getInitials, getStatusColor, formatStringDate, getTimeAgo } from "@/utils/functions";
import { QuickActions } from "./QuickActions";
import { useClientSession } from "@/hooks/user/useClientSession";

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
  const { userRoleId } = useClientSession();

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
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false);
  const [showCoursesBreakdown, setShowCoursesBreakdown] = useState(false);

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
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "info":
        return <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Failed to load student</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Student not found"}
          </p>
          <button
            onClick={() => router.push("/students")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => router.push("/students")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Student Profile</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">View and manage student information</p>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors hidden xs:block">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Edit</span>
            </button>
          </div>
        </div>

        {/* Student Header Card */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover mb-2 sm:mb-3"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3">
                  {displayAvatar}
                </div>
              )}
              <div
                className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                  riskLevel
                )}`}
              >
                <CheckCircle className="w-3 h-3" />
                <span className="capitalize">{riskLevel}</span>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">{student.fullName}</h2>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{student.grade}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {student.userName && `@${student.userName}`}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2">
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Contact Info */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Contact Information</h3>
                  {student.email && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">{student.phone}</span>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">{student.address}</span>
                    </div>
                  )}
                </div>

                {/* Parent Info */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Parent/Guardian</h3>
                  {student.parent ? (
                    <>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span className="truncate">{student.parent.name}</span>
                      </div>
                      {student.parent.phone && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          <span className="truncate">{student.parent.phone}</span>
                        </div>
                      )}
                      {student.dateOfBirth && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          <span className="truncate">
                            {formatStringDate(student.dateOfBirth)} ({student.age} years old)
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">No parent information available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 truncate">Attendance</p>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 truncate">{student.stats.attendanceRate}%</p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              Last: {getTimeAgo(student.stats.lastActivity)}
            </p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 truncate">Performance</p>
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">{student.stats.performanceScore}%</p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {student.stats.totalCourses} courses
            </p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 truncate">Total Stars</p>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 truncate">{student.stats.totalStars}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              Streak: {student.stats.currentStreak} days
            </p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 truncate">Dropout Risk</p>
              <AlertTriangle
                className={`w-3 h-3 sm:w-4 sm:h-4 ${student.stats.dropoutRisk >= 70
                  ? "text-red-600"
                  : student.stats.dropoutRisk >= 50
                    ? "text-orange-600"
                    : "text-green-600"
                  } flex-shrink-0`}
              />
            </div>
            <p
              className={`text-lg sm:text-xl lg:text-2xl font-bold ${student.stats.dropoutRisk >= 70
                ? "text-red-600"
                : student.stats.dropoutRisk >= 50
                  ? "text-orange-600"
                  : "text-green-600"
                } truncate`}
            >
              {student.stats.dropoutRisk}%
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {student.stats.dropoutRisk < 30
                ? "Low risk"
                : student.stats.dropoutRisk < 50
                  ? "Medium risk"
                  : student.stats.dropoutRisk < 70
                    ? "High risk"
                    : "Critical risk"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Attendance Trend</h3>
                  <div className="h-48 sm:h-56 lg:h-64">
                    <canvas ref={attendanceChartRef} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Course Performance</h3>
                  <div className="h-48 sm:h-56 lg:h-64">
                    <canvas ref={performanceChartRef} />
                  </div>
                </div>
              </div>

              {/* Performance Details Table - Collapsible on Mobile */}
              <div>
                <button
                  onClick={() => setShowPerformanceDetails(!showPerformanceDetails)}
                  className="flex items-center justify-between w-full text-left mb-3 sm:mb-4"
                >
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Detailed Performance Scores
                  </h3>
                  <div className="sm:hidden">
                    {showPerformanceDetails ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {(showPerformanceDetails) && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left p-2 sm:p-3 text-xs font-semibold text-gray-700">
                              Course
                            </th>
                            <th className="text-center p-2 sm:p-3 text-xs font-semibold text-gray-700 hidden xs:table-cell">
                              Asg 1
                            </th>
                            <th className="text-center p-2 sm:p-3 text-xs font-semibold text-gray-700 hidden sm:table-cell">
                              Asg 2
                            </th>
                            <th className="text-center p-2 sm:p-3 text-xs font-semibold text-gray-700">
                              CAT
                            </th>
                            <th className="text-center p-2 sm:p-3 text-xs font-semibold text-gray-700 hidden md:table-cell">
                              Exam
                            </th>
                            <th className="text-center p-2 sm:p-3 text-xs font-semibold text-gray-700">
                              Total
                            </th>
                            <th className="text-center p-2 sm:p-3 text-xs font-semibold text-gray-700">
                              Grade
                            </th>
                            <th className="text-left p-2 sm:p-3 text-xs font-semibold text-gray-700 hidden lg:table-cell">
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
                                <td className="p-2 sm:p-3">
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                      {course.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{course.subject}</p>
                                  </div>
                                </td>
                                <td className="p-2 sm:p-3 text-center text-xs sm:text-sm text-gray-700 hidden xs:table-cell">
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
                                <td className="p-2 sm:p-3 text-center text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
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
                                <td className="p-2 sm:p-3 text-center text-xs sm:text-sm text-gray-700">
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
                                <td className="p-2 sm:p-3 text-center text-xs sm:text-sm text-gray-700 hidden md:table-cell">
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
                                <td className="p-2 sm:p-3 text-center">
                                  {hasData && perf.total !== null ? (
                                    <span
                                      className={`font-bold text-xs sm:text-sm ${perf.total >= 85
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
                                <td className="p-2 sm:p-3 text-center">
                                  {hasData && perf.grade ? (
                                    <span
                                      className={`px-1 sm:px-2 py-1 text-xs font-bold rounded ${perf.total && perf.total >= 85
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
                                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                                  {hasData && perf.remarks ? (
                                    <span className="text-xs truncate max-w-[150px]">{perf.remarks}</span>
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
                )}
              </div>

              {/* Courses Breakdown - Collapsible on Mobile */}
              <div>
                <button
                  onClick={() => setShowCoursesBreakdown(!showCoursesBreakdown)}
                  className="flex items-center justify-between w-full text-left mb-3 sm:mb-4"
                >
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Courses & Performance</h3>
                  <div className="sm:hidden">
                    {showCoursesBreakdown ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {(showCoursesBreakdown) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {student.courses.map((course) => {
                      const hasPerformance = course.performance !== null;
                      const score = course.performance?.total || 0;
                      const grade = course.performance?.grade || "N/A";

                      return (
                        <div
                          key={course.id}
                          className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate flex-1 mr-2">
                              {course.title}
                            </h4>
                            {hasPerformance && (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${score >= 85
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
                          <p className="text-xs text-gray-600 mb-2 truncate">{course.subject}</p>
                          {hasPerformance ? (
                            <>
                              <div className="flex items-end gap-2 mb-2">
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{score}%</p>
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
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                  {course.performance.remarks}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500">No performance data yet</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations & Comments Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Recommendations & Comments</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Teachers and parents can share feedback and recommendations
              </p>
            </div>
          </div>

          {/* New Comment Input */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback, recommendations, or observations about the student..."
                className="w-full min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3">
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  Your comment will be visible to teachers and parents
                </p>
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm w-full sm:w-auto justify-center"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 sm:space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm">
                  No recommendations yet. Be the first to share feedback!
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {getInitials(rec.author.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{rec.author.name}</h4>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs text-gray-500 hidden xs:inline">• {rec.author.role}</span>
                          <span className="text-xs text-gray-400">• {getTimeAgo(rec.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">{rec.content}</p>

                      {/* Replies */}
                      {rec.replies && rec.replies.length > 0 && (
                        <div className="space-y-2 sm:space-y-3 ml-2 sm:ml-4 border-l-2 border-gray-200 pl-2 sm:pl-4 mb-2 sm:mb-3">
                          {rec.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {getInitials(reply.author.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                  <h5 className="font-medium text-xs text-gray-900 truncate">
                                    {reply.author.name}
                                  </h5>
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="text-xs text-gray-500 hidden xs:inline">• {reply.author.role}</span>
                                    <span className="text-xs text-gray-400">• {getTimeAgo(reply.createdAt)}</span>
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === rec.id ? (
                        <div className="ml-2 sm:ml-4 mt-2 sm:mt-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full min-h-[60px] sm:min-h-[80px] p-2 border border-gray-300 rounded-lg resize-none text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handlePostReply(rec.id)}
                              disabled={!replyContent.trim()}
                              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              <Send className="w-3 h-3" />
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                              className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(rec.id)}
                          className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
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
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg sm:rounded-xl shadow-sm border border-purple-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">AI-Powered Insights</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {isLoadingInsights
                    ? "Generating personalized recommendations..."
                    : "Personalized recommendations powered by AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isLoadingInsights && (
                <button
                  onClick={() => refetchInsights()}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-xs sm:text-sm font-medium text-purple-700"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Refresh</span>
                </button>
              )}
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-xs sm:text-sm font-medium text-purple-700"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{showAIInsights ? "Hide" : "Show"} Insights</span>
              </button>
            </div>
          </div>

          {isLoadingInsights && (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="text-center">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 animate-spin mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-gray-600">Analyzing student performance...</p>
              </div>
            </div>
          )}

          {isInsightsError && !isLoadingInsights && (
            <div className="text-center py-4 sm:py-6">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Failed to generate AI insights</p>
              <button
                onClick={() => refetchInsights()}
                className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {showAIInsights && aiInsightsData && !isLoadingInsights && (
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {/* Summary */}
              {aiInsightsData.summary && (
                <div className="p-3 sm:p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-xs sm:text-sm text-purple-900 mb-1 sm:mb-2">Overall Assessment</h4>
                  <p className="text-xs sm:text-sm text-gray-700">{aiInsightsData.summary}</p>
                </div>
              )}

              {/* Insights */}
              {aiInsightsData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg border ${insight.type === "positive"
                    ? "bg-green-50 border-green-200"
                    : insight.type === "warning"
                      ? "bg-orange-50 border-orange-200"
                      : insight.type === "critical"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`mt-0.5 flex-shrink-0 ${insight.type === "positive"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4
                          className={`font-semibold text-xs sm:text-sm ${insight.type === "positive"
                            ? "text-green-900"
                            : insight.type === "warning"
                              ? "text-orange-900"
                              : insight.type === "critical"
                                ? "text-red-900"
                                : "text-blue-900"
                            } truncate`}
                        >
                          {insight.title}
                        </h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${insight.priority === "high"
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
                        className={`text-xs sm:text-sm ${insight.type === "positive"
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
        {userRoleId !== 6 && (
          <QuickActions />
        )}
      </div>
    </div>
  );
};

export default StudentDetailPage;