"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Award,
  AlertCircle,
  ChevronRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import Link from "next/link";

// Chart Components
interface AttendanceTrendChartProps {
  data: Array<{
    week: string;
    attendanceRate: number;
    atRiskCount: number;
  }>;
}

const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.week),
        datasets: [
          {
            label: "Class Attendance %",
            data: data.map((d) => d.attendanceRate),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "#10b981",
          },
          {
            label: "At-Risk Students",
            data: data.map((d) => d.atRiskCount),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "#ef4444",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11, weight: "bold" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: { size: 13, weight: "bold" },
            bodyFont: { size: 12 },
          },
        },
        scales: {
          y: {
            type: "linear",
            position: "left",
            beginAtZero: false,
            min: 0,
            max: 100,
            title: {
              display: true,
              text: "Attendance %",
              font: { size: 11, weight: "bold" },
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          y1: {
            type: "linear",
            position: "right",
            beginAtZero: true,
            title: {
              display: true,
              text: "At-Risk Count",
              font: { size: 11, weight: "bold" },
            },
            grid: { display: false },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

interface PerformanceDistributionChartProps {
  data: Array<{
    range: string;
    count: number;
  }>;
}

const PerformanceDistributionChart: React.FC<PerformanceDistributionChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.range),
        datasets: [
          {
            label: "Number of Students",
            data: data.map((d) => d.count),
            backgroundColor: [
              "#ef4444",
              "#f97316",
              "#eab308",
              "#22c55e",
              "#10b981",
            ],
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
              label: (context) => `Students: ${context.parsed.y}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 2 },
            title: {
              display: true,
              text: "Number of Students",
              font: { size: 11, weight: "bold" },
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          x: {
            title: {
              display: true,
              text: "Grade Range",
              font: { size: 11, weight: "bold" },
            },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

interface DropoutRiskChartProps {
  data: Array<{
    name: string;
    dropoutRisk: number;
  }>;
}

const DropoutRiskChart: React.FC<DropoutRiskChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          {
            label: "Dropout Risk %",
            data: data.map((d) => d.dropoutRisk),
            backgroundColor: data.map((d) => {
              if (d.dropoutRisk >= 70) return "#ef4444";
              if (d.dropoutRisk >= 60) return "#f97316";
              return "#eab308";
            }),
            borderWidth: 0,
            borderRadius: 8,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            callbacks: {
              label: (context) => `Risk Level: ${context.parsed.x}%`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Risk Percentage",
              font: { size: 11, weight: "bold" },
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          y: {
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

const Dashboard: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  const { data: dashboardData, isLoading, isError, error } = useDashboard(selectedGrade);

  const getRiskColor = (risk: number): string => {
    if (risk >= 70) return "text-red-600 bg-red-100";
    if (risk >= 60) return "text-orange-600 bg-orange-100";
    return "text-yellow-600 bg-yellow-100";
  };

  const getRiskLabel = (risk: number): string => {
    if (risk >= 70) return "Critical Risk";
    if (risk >= 60) return "High Risk";
    return "Moderate Risk";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Available grades for dropdown
  const availableGrades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  const classStats = [
    {
      label: "Total Students",
      value: dashboardData.totalStudents.toString(),
      change: selectedGrade ? `in ${selectedGrade}` : "across all grades",
      trend: "up" as const,
      icon: <Users className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "At Risk",
      value: dashboardData.atRiskCount.toString(),
      change: `${Math.round((dashboardData.atRiskCount / dashboardData.totalStudents) * 100)}% of students`,
      trend: "up" as const,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "from-red-500 to-orange-600",
    },
    {
      label: "Average Attendance",
      value: `${dashboardData.averageAttendance}%`,
      change: dashboardData.averageAttendance >= 90 ? "Excellent" : dashboardData.averageAttendance >= 80 ? "Good" : "Needs Improvement",
      trend: dashboardData.averageAttendance >= 85 ? ("up" as const) : ("down" as const),
      icon: <Calendar className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Class Average",
      value: `${dashboardData.classAverage}%`,
      change: dashboardData.classAverage >= 75 ? "Above target" : "Below target",
      trend: dashboardData.classAverage >= 75 ? ("up" as const) : ("down" as const),
      icon: <Award className="w-5 h-5" />,
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen ">
      <main className="py-6 max-w-7xl mx-auto px-4">
        {/* Grade Filter */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedGrade ? `Grade ${selectedGrade}` : "All Grades"} Overview
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowGradeDropdown(!showGradeDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedGrade ? `Grade ${selectedGrade}` : "All Grades"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showGradeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setSelectedGrade("");
                    setShowGradeDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                >
                  All Grades
                </button>
                {availableGrades.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => {
                      setSelectedGrade(grade.replace("Grade ", ""));
                      setShowGradeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg ${selectedGrade === grade.replace("Grade ", "") ? "font-bold bg-gray-100" : ""}`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {classStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                {stat.trend === "up" ? (
                  <TrendingUp
                    className={`w-4 h-4 ${stat.label === "At Risk" ? "text-red-500" : "text-green-500"
                      }`}
                  />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p
                className={`text-xs font-medium ${stat.trend === "up" && stat.label !== "At Risk"
                  ? "text-green-600"
                  : stat.trend === "up"
                    ? "text-red-600"
                    : "text-red-600"
                  }`}
              >
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Attendance & Risk Trend
            </h2>
            <div className="h-64">
              <AttendanceTrendChart data={dashboardData.attendanceTrend} />
            </div>
          </div>

          {/* Dropout Risk Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Top {dashboardData.topAtRiskStudents.length} Students at Risk
            </h2>
            <div className="h-64">
              <DropoutRiskChart
                data={dashboardData.topAtRiskStudents.map((s) => ({
                  name: s.name.split(" ")[0],
                  dropoutRisk: s.dropoutRisk,
                }))}
              />
            </div>
          </div>


          {/* Grade Breakdown (only if viewing all grades) */}
        </div>
        {/* Performance Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Class Performance Distribution
          </h2>
          <div className="h-64 max-w-3xl">
            <PerformanceDistributionChart data={dashboardData.performanceDistribution} />
          </div>
        </div>


        {/* Students At Risk Section */}
        {dashboardData.topAtRiskStudents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Students at Risk of Dropout
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {dashboardData.topAtRiskStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                          {getInitials(student.name)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{student.name}</h3>
                        <p className="text-xs text-gray-500">
                          Attendance: {student.attendanceRate}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Dropout Risk
                      </span>
                      <span
                        className={`text-sm font-bold px-2 py-1 rounded ${getRiskColor(
                          student.dropoutRisk
                        )}`}
                      >
                        {student.dropoutRisk}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${student.dropoutRisk >= 70
                          ? "bg-red-500"
                          : student.dropoutRisk >= 60
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                          }`}
                        style={{ width: `${student.dropoutRisk}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {getRiskLabel(student.dropoutRisk)}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-gray-700">Key Concerns:</p>
                    {student.concerns.length > 0 ? (
                      student.concerns.map((concern, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600">{concern}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No specific concerns recorded</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/students/${student.id}`} className="flex-1 px-auto py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all">
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedGrade && dashboardData.gradeBreakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Grade Breakdown</h2>
            <div className="space-y-3">
              {dashboardData.gradeBreakdown.map((grade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedGrade(grade.grade.replace("Grade ", ""))}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900">{grade.grade}</h3>
                      <span className="text-xs text-gray-600">
                        {grade.studentCount} students
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Avg: {grade.averagePerformance}%</span>
                      <span className="text-red-600">At Risk: {grade.atRiskCount}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;