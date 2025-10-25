"use clients";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BookOpen,
  Activity,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Award,
  Plus,
  Bell,
  ChevronRight,
} from "lucide-react";

// Chart Components
const AttendanceTrendChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Current"],
        datasets: [
          {
            label: "Class Attendance %",
            data: [92, 90, 89, 87, 88],
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
            data: [2, 3, 3, 4, 5],
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
            min: 80,
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
  }, []);

  return <canvas ref={chartRef} />;
};

const PerformanceDistributionChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["0-40%", "41-60%", "61-75%", "76-85%", "86-100%"],
        datasets: [
          {
            label: "Number of Students",
            data: [3, 8, 12, 6, 3],
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
  }, []);

  return <canvas ref={chartRef} />;
};

const BehaviorIncidentsChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Positive Behavior",
          "Late Arrivals",
          "Disruptive",
          "Sleeping",
          "Incomplete Work",
        ],
        datasets: [
          {
            data: [45, 15, 8, 5, 12],
            backgroundColor: [
              "#10b981",
              "#f59e0b",
              "#ef4444",
              "#8b5cf6",
              "#ec4899",
            ],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.parsed;
                const dataset = context.dataset;
                const total = dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} />;
};

const DropoutRiskChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Emmanuel N.",
          "Grace U.",
          "Jean-Paul M.",
          "Aline K.",
          "Patrick N.",
        ],
        datasets: [
          {
            label: "Dropout Risk %",
            data: [72, 65, 58, 55, 52],
            backgroundColor: (context) => {
              const value = context.parsed?.y;
              if (!value) return "#eab308";
              if (value >= 70) return "#ef4444";
              if (value >= 60) return "#f97316";
              return "#eab308";
            },
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
  }, []);

  return <canvas ref={chartRef} />;
};

interface AtRiskStudent {
  id: number;
  name: string;
  dropoutRisk: number;
  avatar: string;
  concerns: string[];
  status: string;
  lastIncident: string;
}

interface ClassStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  student: string;
  activity: string;
  score: string;
  time: string;
  type: "success" | "warning" | "alert";
}

interface AIRecommendation {
  priority: "high" | "medium";
  student: string;
  message: string;
  action: string;
}

const SkoolaSyncDashboard: React.FC = () => {
  // Mock data for students at risk
  const atRiskStudents: AtRiskStudent[] = [
    {
      id: 1,
      name: "Emmanuel Nkurunziza",
      dropoutRisk: 72,
      avatar: "EN",
      concerns: [
        "Attendance decreased 25%",
        "Late 8 times this month",
        "Math grade dropped to 45%",
      ],
      status: "critical",
      lastIncident: "2 days ago",
    },
    {
      id: 2,
      name: "Grace Uwase",
      dropoutRisk: 65,
      avatar: "GU",
      concerns: [
        "Sleeping in class (5 incidents)",
        "Incomplete homework (6/10)",
        "Withdrawn behavior",
      ],
      status: "warning",
      lastIncident: "1 day ago",
    },
    {
      id: 3,
      name: "Jean-Paul Mugabo",
      dropoutRisk: 58,
      avatar: "JM",
      concerns: ["Disruptive behavior", "Failing Science", "Peer conflicts"],
      status: "warning",
      lastIncident: "3 days ago",
    },
  ];

  // Class statistics
  const classStats: ClassStat[] = [
    {
      label: "Total Students",
      value: "32",
      change: "+2 this term",
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "At Risk",
      value: "5",
      change: "+2 from last week",
      trend: "up",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "from-red-500 to-orange-600",
    },
    {
      label: "Average Attendance",
      value: "88%",
      change: "-3% this week",
      trend: "down",
      icon: <Calendar className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Class Average",
      value: "74%",
      change: "+5% improvement",
      trend: "up",
      icon: <Award className="w-5 h-5" />,
      color: "from-purple-500 to-pink-600",
    },
  ];

  // Recent activities
  const recentActivities: RecentActivity[] = [
    {
      student: "Aisha Kalisa",
      activity: "Completed Math Quiz",
      score: "85/100",
      time: "2 hours ago",
      type: "success",
    },
    {
      student: "Emmanuel N.",
      activity: "Absent from class",
      score: "N/A",
      time: "3 hours ago",
      type: "warning",
    },
    {
      student: "Jean-Pierre M.",
      activity: "Late arrival (30 mins)",
      score: "N/A",
      time: "5 hours ago",
      type: "alert",
    },
    {
      student: "Fatima Senghor",
      activity: "Submitted Homework",
      score: "Completed",
      time: "1 day ago",
      type: "success",
    },
  ];

  // AI Recommendations
  const aiRecommendations: AIRecommendation[] = [
    {
      priority: "high",
      student: "Emmanuel Nkurunziza",
      message:
        "Schedule urgent parent meeting - attendance dropped 25% with declining grades",
      action: "Contact Parent",
    },
    {
      priority: "medium",
      student: "Grace Uwase",
      message:
        "Consider peer support program - showing signs of social withdrawal",
      action: "View Details",
    },
  ];

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

  return (
    <div className="min-h-screen">
      <main className="py-6 max-w-7xl mx-auto">
        {/* AI Alert Banner */}
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-1">
                AI Early Warning: 3 Students Require Immediate Attention
              </h3>
              <p className="text-sm text-red-800">
                Our predictive model has identified students showing multiple
                dropout risk indicators. Review recommendations below.
              </p>
            </div>
            <button className="text-red-600 hover:text-red-800 font-medium text-sm whitespace-nowrap">
              View All →
            </button>
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
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <div className="text-white">{stat.icon}</div>
                </div>
                {stat.trend === "up" ? (
                  <TrendingUp
                    className={`w-4 h-4 ${
                      stat.label === "At Risk"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p
                className={`text-xs font-medium ${
                  stat.trend === "up" && stat.label !== "At Risk"
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
              <AttendanceTrendChart />
            </div>
          </div>

          {/* Dropout Risk Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Top 5 Students at Risk
            </h2>
            <div className="h-64">
              <DropoutRiskChart />
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Class Performance Distribution
            </h2>
            <div className="h-64">
              <PerformanceDistributionChart />
            </div>
          </div>

          {/* Behavior Incidents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Behavioral Patterns (This Month)
            </h2>
            <div className="h-64">
              <BehaviorIncidentsChart />
            </div>
          </div>
        </div>

        {/* Students At Risk Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Students at Risk of Dropout
            </h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View Full Report <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {atRiskStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-amber-500 flex items-center justify-center text-white font-bold">
                      {student.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {student.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {student.lastIncident}
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
                      className={`h-2 rounded-full ${
                        student.dropoutRisk >= 70
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
                  <p className="text-xs font-medium text-gray-700">
                    Key Concerns:
                  </p>
                  {student.concerns.map((concern, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">{concern}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-amber-500 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all">
                    Contact Parent
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            AI-Powered Recommendations
          </h2>
          <div className="space-y-3">
            {aiRecommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      rec.priority === "high" ? "bg-red-100" : "bg-orange-100"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        rec.priority === "high"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          rec.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {rec.student}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.message}</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <Calendar className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Record Attendance
                </span>
              </button>
              <button className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <BookOpen className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Add Activity
                </span>
              </button>
              <button className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <Activity className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Log Behavior
                </span>
              </button>
              <button className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Message Parent
                </span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "success"
                        ? "bg-green-100"
                        : activity.type === "warning"
                        ? "bg-orange-100"
                        : "bg-red-100"
                    }`}
                  >
                    {activity.type === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : activity.type === "warning" ? (
                      <XCircle className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.student}
                    </p>
                    <p className="text-xs text-gray-600">{activity.activity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">
                      {activity.score}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkoolaSyncDashboard;
