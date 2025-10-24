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
  Clock,
  Award,
  BookOpen,
  MessageSquare,
  Bell,
  Download,
  Edit,
  MoreVertical,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  attendance: number;
  lastActive: string;
  email: string;
  phone: string;
  gradeAverage: number;
  behaviorScore: number;
  dropoutRisk: number;
  status: "excellent" | "good" | "warning" | "critical";
  parentName: string;
  parentContact: string;
  dateOfBirth: string;
  address: string;
}

interface Activity {
  id: string;
  name: string;
  type: string;
  score: string;
  date: string;
  status: "completed" | "pending" | "late";
}

const StudentDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "activities" | "progress"
  >("overview");
  const attendanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const performanceChartRef = useRef<HTMLCanvasElement | null>(null);
  const attendanceChartInstance = useRef<Chart | null>(null);
  const performanceChartInstance = useRef<Chart | null>(null);

  // Sample student data
  const student: Student = {
    id: "1",
    name: "Aisha Kalisa",
    grade: "Grade 10",
    avatar: "AK",
    attendance: 95,
    lastActive: "2 hours ago",
    email: "aisha.k@school.com",
    phone: "+250 788 123 456",
    gradeAverage: 88,
    behaviorScore: 92,
    dropoutRisk: 15,
    status: "excellent",
    parentName: "Mrs. Kalisa",
    parentContact: "+250 788 654 321",
    dateOfBirth: "May 15, 2008",
    address: "Kigali, Rwanda",
  };

  const activities: Activity[] = [
    {
      id: "1",
      name: "Math Quiz - Algebra",
      type: "Quiz",
      score: "85/100",
      date: "2 days ago",
      status: "completed",
    },
    {
      id: "2",
      name: "Science Homework - Chemistry",
      type: "Homework",
      score: "92/100",
      date: "3 days ago",
      status: "completed",
    },
    {
      id: "3",
      name: "English Essay - Literature",
      type: "Assignment",
      score: "Pending",
      date: "Due in 2 days",
      status: "pending",
    },
    {
      id: "4",
      name: "History Test - World War II",
      type: "Test",
      score: "78/100",
      date: "5 days ago",
      status: "completed",
    },
    {
      id: "5",
      name: "Biology Lab Report",
      type: "Lab",
      score: "Not Submitted",
      date: "1 week ago",
      status: "late",
    },
  ];

  const subjects = [
    { name: "Mathematics", score: 85, trend: "up", change: "+5%" },
    { name: "Science", score: 92, trend: "up", change: "+8%" },
    { name: "English", score: 88, trend: "down", change: "-2%" },
    { name: "History", score: 78, trend: "up", change: "+3%" },
    { name: "Biology", score: 90, trend: "up", change: "+6%" },
  ];

  useEffect(() => {
    // Attendance Chart
    if (attendanceChartRef.current) {
      const ctx = attendanceChartRef.current.getContext("2d");
      if (ctx) {
        if (attendanceChartInstance.current) {
          attendanceChartInstance.current.destroy();
        }

        attendanceChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Current"],
            datasets: [
              {
                label: "Attendance %",
                data: [98, 96, 94, 93, 95],
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
                min: 80,
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

        performanceChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Math", "Science", "English", "History", "Biology"],
            datasets: [
              {
                label: "Score",
                data: [85, 92, 88, 78, 90],
                backgroundColor: [
                  "#10b981",
                  "#10b981",
                  "#10b981",
                  "#f59e0b",
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
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-700 border-green-300";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "critical":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl mb-3">
                {student.avatar}
              </div>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                  student.status
                )}`}
              >
                <CheckCircle className="w-3 h-3" />
                <span className="capitalize">{student.status}</span>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {student.name}
                  </h2>
                  <p className="text-gray-600">{student.grade}</p>
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>{student.address}</span>
                  </div>
                </div>

                {/* Parent Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Parent/Guardian
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-green-600" />
                    <span>{student.parentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{student.parentContact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>{student.dateOfBirth}</span>
                  </div>
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
              {student.attendance}%
            </p>
            <p className="text-xs text-gray-500 mt-1">+2% from last month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Grade Average</p>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {student.gradeAverage}%
            </p>
            <p className="text-xs text-gray-500 mt-1">+5% improvement</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Behavior Score</p>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {student.behaviorScore}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Excellent conduct</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Dropout Risk</p>
              <AlertTriangle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {student.dropoutRisk}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Low risk level</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "activities"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "progress"
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
                      Subject Performance
                    </h3>
                    <div className="h-64">
                      <canvas ref={performanceChartRef} />
                    </div>
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Subject Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {subject.name}
                          </h4>
                          <div
                            className={`flex items-center gap-1 ${
                              subject.trend === "up"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {subject.trend === "up" ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span className="text-xs font-medium">
                              {subject.change}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-bold text-gray-900">
                            {subject.score}%
                          </p>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              subject.score >= 85
                                ? "bg-green-500"
                                : subject.score >= 70
                                ? "bg-blue-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${subject.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activities" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent Activities
                  </h3>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === "completed"
                            ? "bg-green-100"
                            : activity.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        {activity.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : activity.status === "pending" ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {activity.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {activity.type} • {activity.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">
                          {activity.score}
                        </p>
                        <span
                          className={`text-xs font-medium capitalize ${
                            activity.status === "completed"
                              ? "text-green-600"
                              : activity.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Academic Progress
                  </h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900">
                          Strong Academic Performance
                        </h4>
                        <p className="text-sm text-green-700">
                          Student is excelling in most subjects
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-green-700 mb-1">
                          Current GPA
                        </p>
                        <p className="text-2xl font-bold text-green-900">3.8</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 mb-1">
                          Class Rank
                        </p>
                        <p className="text-2xl font-bold text-green-900">5th</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 mb-1">
                          Credits Earned
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          24/30
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Areas of Improvement
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-sm text-orange-900">
                          History Performance
                        </h4>
                      </div>
                      <p className="text-sm text-orange-700">
                        Consider additional tutoring to improve understanding of
                        historical concepts
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <Award className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-sm text-purple-900">
                          Perfect Attendance
                        </h4>
                        <p className="text-xs text-purple-700">Last 2 months</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-sm text-blue-900">
                          Top Performer
                        </h4>
                        <p className="text-xs text-blue-700">Science class</p>
                      </div>
                    </div>
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
            <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <Phone className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                Call Parent
              </span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                Add Activity
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
