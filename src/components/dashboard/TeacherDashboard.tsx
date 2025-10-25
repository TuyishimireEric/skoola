"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Star,
  Trophy,
  Users,
  Brain,
  Download,
  Calendar,
  MessageCircle,
  FileText,
  CheckCircle,
  AlertTriangle,
  Activity,
  Clock,
  LucideIcon,
  Filter,
  ChevronDown,
  TrendingUp,
  Video,
  PenTool,
  BarChart3,
  Eye,
  ThumbsUp,
  AlertCircle,
  Zap,
  HelpCircle,
  Lightbulb,
  Medal,
  Send,
  ClipboardList,
  Play,
} from "lucide-react";
import StatsCard from "./StatsCard";
import FunChart from "../charts/FunChart";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

// Mock data
const mockData = {
  studentProgress: [
    {
      name: "Emma Wilson",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      progress: 92,
      completedLessons: 23,
      totalLessons: 25,
      lastActive: "2 hours ago",
      grade: "A+",
      trending: "up" as const,
    },
    {
      name: "James Chen",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      progress: 78,
      completedLessons: 18,
      totalLessons: 25,
      lastActive: "1 day ago",
      grade: "B+",
      trending: "up" as const,
    },
    {
      name: "Sophie Taylor",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      progress: 65,
      completedLessons: 16,
      totalLessons: 25,
      lastActive: "3 hours ago",
      grade: "B",
      trending: "down" as const,
    },
    {
      name: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      progress: 45,
      completedLessons: 11,
      totalLessons: 25,
      lastActive: "2 days ago",
      grade: "C",
      trending: "down" as const,
      needsAttention: true,
    },
    {
      name: "Olivia Davis",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      progress: 88,
      completedLessons: 22,
      totalLessons: 25,
      lastActive: "5 hours ago",
      grade: "A",
      trending: "stable" as const,
    },
  ],
  recentSubmissions: [
    {
      student: "Emma Wilson",
      assignment: "Chapter 5 Quiz",
      submittedAt: "10:30 AM",
      status: "graded",
      score: 95,
    },
    {
      student: "James Chen",
      assignment: "Essay: Climate Change",
      submittedAt: "Yesterday",
      status: "pending",
    },
    {
      student: "Sophie Taylor",
      assignment: "Math Problem Set",
      submittedAt: "2 days ago",
      status: "graded",
      score: 82,
    },
  ],
  upcomingClasses: [
    {
      title: "Advanced Mathematics",
      time: "10:00 AM - 11:30 AM",
      students: 28,
      type: "live",
      room: "Room 204",
    },
    {
      title: "Physics Lab Session",
      time: "2:00 PM - 3:30 PM",
      students: 24,
      type: "lab",
      room: "Lab 3",
    },
    {
      title: "Online Tutorial",
      time: "4:00 PM - 5:00 PM",
      students: 15,
      type: "online",
      platform: "Zoom",
    },
  ],
  coursePerformance: [
    { name: "Mathematics", students: 32, avgScore: 87, completion: 78 },
    { name: "Physics", students: 28, avgScore: 82, completion: 72 },
    { name: "Chemistry", students: 30, avgScore: 85, completion: 80 },
    { name: "Biology", students: 25, avgScore: 90, completion: 85 },
  ],
};

interface PerformanceAlertProps {
  type: "warning" | "success" | "info" | "danger";
  message: string;
  count: number;
  icon: LucideIcon;
}

const PerformanceAlert: React.FC<PerformanceAlertProps> = ({
  type,
  message,
  count,
  icon: Icon,
}) => {
  const colors: Record<string, string> = {
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    success: "bg-green-50 border-green-300 text-green-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
    danger: "bg-red-50 border-red-300 text-red-800",
  };

  return (
    <div className={`p-3 rounded-xl border-2 ${colors[type]} font-comic`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm truncate">
            {message}
          </span>
        </div>
        <span className="font-bold text-lg flex-shrink-0">{count}</span>
      </div>
    </div>
  );
};

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  options,
  onChange,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative font-comic">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 bg-white border-2 border-purple-300 rounded-full px-2 sm:px-4 py-1 sm:py-2 hover:bg-purple-50 transition-colors min-w-[100px] sm:min-w-[140px]"
      >
        {Icon && (
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
        )}
        <span className="text-xs sm:text-sm font-medium text-purple-700 truncate">
          {value}
        </span>
        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border-2 border-purple-300 rounded-xl shadow-lg z-10 min-w-[100px] sm:min-w-[140px]">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-2 sm:px-4 py-1 sm:py-2 hover:bg-purple-50 text-xs sm:text-sm font-medium text-purple-700 first:rounded-t-xl last:rounded-b-xl"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherDashboard: React.FC = () => {
  // Filter states
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedDateRange, setSelectedDateRange] = useState("This Week");
  const [selectedStudentGroup, setSelectedStudentGroup] =
    useState("All Students");

  // Filter options
  const courseOptions = [
    "All Courses",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
  ];
  const dateRangeOptions = [
    "Today",
    "This Week",
    "This Month",
    "This Semester",
  ];
  const studentGroupOptions = [
    "All Students",
    "Top Performers",
    "Need Support",
    "Recent Active",
  ];

  const ProgressBar = ({
    progress,
    color,
    showLabel = false,
  }: {
    progress: number;
    color: string;
    showLabel?: boolean;
  }) => (
    <div className="relative w-full">
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute -top-6 right-0 text-xs font-bold text-gray-600">
          {progress}%
        </span>
      )}
    </div>
  );

  // Mock enhanced teacher data
  const teacherStats = {
    totalStudents: 115,
    activeCourses: 4,
    avgEngagement: 87,
    assignmentsGraded: 234,
    pendingGrading: 12,
    studentSatisfaction: 4.8,
    lessonsCompleted: 156,
    upcomingClasses: 3,
  };

  const alerts = [
    {
      type: "warning" as const,
      message: "Assignments to grade",
      count: 12,
      icon: ClipboardList,
    },
    {
      type: "success" as const,
      message: "Students online now",
      count: 23,
      icon: Activity,
    },
    {
      type: "info" as const,
      message: "Messages unread",
      count: 5,
      icon: MessageCircle,
    },
    {
      type: "danger" as const,
      message: "Students need help",
      count: 7,
      icon: AlertCircle,
    },
  ];

  const engagementData = [
    { date: "Mon", value: 85 },
    { date: "Tue", value: 92 },
    { date: "Wed", value: 78 },
    { date: "Thu", value: 89 },
    { date: "Fri", value: 95 },
    { date: "Sat", value: 67 },
    { date: "Sun", value: 72 },
  ];

  const topicMastery = [
    { topic: "Algebra", mastery: 92, students: 28 },
    { topic: "Geometry", mastery: 85, students: 26 },
    { topic: "Calculus", mastery: 78, students: 24 },
    { topic: "Statistics", mastery: 88, students: 27 },
    { topic: "Trigonometry", mastery: 72, students: 22 },
  ];

  const isLoading = false;

  return (
    <div className="flex flex-col gap-2 justify-between w-full h-full p-2 sm:p-4">
      <div className="flex flex-col items-center gap-2 justify-between">
        <div className="flex flex-col h-full w-full gap-3 sm:gap-6 overflow-y-auto relative pb-6 overflow-x-hidden">
          {/* Top stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4 w-full animate__animated animate__bounceIn">
            <StatsCard
              label="Total Students"
              value={teacherStats.totalStudents}
              icon={FaUserGraduate}
              color="border-purple-300"
              isLoading={isLoading}
            />
            <StatsCard
              label="Active Courses"
              value={teacherStats.activeCourses}
              icon={BookOpen}
              color="border-blue-300"
              isLoading={isLoading}
            />
            <StatsCard
              label="Avg Engagement"
              value={`${teacherStats.avgEngagement}%`}
              icon={Activity}
              color="border-green-300"
              isLoading={isLoading}
            />
            <StatsCard
              label="Satisfaction"
              value={`${teacherStats.studentSatisfaction}⭐`}
              icon={Star}
              color="border-yellow-300"
              isLoading={isLoading}
            />
          </div>

          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-3 sm:p-4 py-2 sm:py-1 gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="text-sm sm:text-lg font-bold text-purple-700 font-comic">
                  Filters:
                </span>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                <FilterDropdown
                  label="Course"
                  value={selectedCourse}
                  options={courseOptions}
                  onChange={setSelectedCourse}
                  icon={BookOpen}
                />

                <FilterDropdown
                  label="Date Range"
                  value={selectedDateRange}
                  options={dateRangeOptions}
                  onChange={setSelectedDateRange}
                  icon={Calendar}
                />

                <FilterDropdown
                  label="Students"
                  value={selectedStudentGroup}
                  options={studentGroupOptions}
                  onChange={setSelectedStudentGroup}
                  icon={Users}
                />
              </div>
            </div>

            {/* Generate Report button */}
            <button className="bg-purple-400 border-2 sm:border-4 flex items-center justify-center border-purple-50 text-white rounded-full px-3 sm:px-6 py-2 sm:py-3 hover:bg-purple-500 transition-colors font-comic font-bold text-sm w-full sm:w-auto">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {alerts.map((alert, index) => (
              <PerformanceAlert key={index} {...alert} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Student Engagement Chart */}
            <div className="lg:col-span-2 bg-purple-50 rounded-2xl sm:rounded-3xl">
              <FunChart
                data={engagementData}
                title="Weekly Student Engagement"
                customConfig={{
                  barSize: 40,
                }}
                showLegend={false}
                type="area"
                xKey="date"
                yKey="value"
                color="#9333ea"
                valueLabel="%"
                height={250}
                showGrid={true}
                isLoading={isLoading}
              />
            </div>

            {/* Today&apos;s Schedule */}
            <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <h2 className="text-sm sm:text-lg font-bold text-purple-700 mb-3 sm:mb-4 flex items-center font-comic">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                Today&apos;s Schedule
              </h2>

              <div className="space-y-3">
                {mockData.upcomingClasses.map((class_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-3 shadow-sm border border-purple-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-purple-800">
                        {class_.title}
                      </h3>
                      {class_.type === "live" && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                          Live
                        </span>
                      )}
                      {class_.type === "online" && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                          Online
                        </span>
                      )}
                      {class_.type === "lab" && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                          Lab
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 space-x-3">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {class_.time}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {class_.students} students
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {class_.room || class_.platform}
                    </div>
                    <button className="mt-2 w-full bg-purple-100 text-purple-700 rounded-lg py-1.5 text-xs font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>Start Class</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Progress & Recent Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Student Progress */}
            <div className="lg:col-span-2 bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-lg font-bold text-purple-700 flex items-center font-comic">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                  Student Progress Tracker
                </h2>
                <button className="text-purple-600 hover:text-purple-800 text-xs font-medium">
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {mockData.studentProgress.map((student, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-xl p-3 shadow-sm border ${
                      student.needsAttention
                        ? "border-red-300"
                        : "border-purple-200"
                    } hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-sm text-purple-800">
                            {student.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {student.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold text-lg ${
                            student.grade.startsWith("A")
                              ? "text-green-600"
                              : student.grade.startsWith("B")
                              ? "text-blue-600"
                              : student.grade.startsWith("C")
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {student.grade}
                        </span>
                        {student.trending === "up" && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {student.trending === "down" && (
                          <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                        )}
                        {student.needsAttention && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Course Progress</span>
                        <span>
                          {student.completedLessons}/{student.totalLessons}{" "}
                          lessons
                        </span>
                      </div>
                      <ProgressBar
                        progress={student.progress}
                        color={
                          student.progress >= 80
                            ? "bg-green-500"
                            : student.progress >= 60
                            ? "bg-blue-500"
                            : student.progress >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      />
                    </div>

                    {student.needsAttention && (
                      <button className="w-full bg-red-100 text-red-700 rounded-lg py-1.5 text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>Send Support Message</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <h2 className="text-sm sm:text-lg font-bold text-purple-700 mb-3 sm:mb-4 flex items-center font-comic">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                Recent Submissions
              </h2>

              <div className="space-y-3">
                {mockData.recentSubmissions.map((submission, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-3 shadow-sm border border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-purple-800 truncate flex-1 mr-2">
                        {submission.assignment}
                      </h4>
                      {submission.status === "graded" ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Graded
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <p className="font-medium">{submission.student}</p>
                      <p>Submitted: {submission.submittedAt}</p>
                      {submission.score && (
                        <p className="font-semibold text-purple-700 mt-1">
                          Score: {submission.score}%
                        </p>
                      )}
                    </div>
                    {submission.status === "pending" && (
                      <button className="mt-2 w-full bg-purple-100 text-purple-700 rounded-lg py-1.5 text-xs font-medium hover:bg-purple-200 transition-colors">
                        Grade Now
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button className="mt-3 w-full bg-purple-200 text-purple-700 rounded-lg py-2 text-sm font-medium hover:bg-purple-300 transition-colors">
                View All Submissions
              </button>
            </div>
          </div>

          {/* Course Performance Overview */}
          <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
            <h2 className="text-sm sm:text-lg font-bold text-purple-700 mb-3 sm:mb-4 flex items-center font-comic">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
              Course Performance Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockData.coursePerformance.map((course, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-purple-200 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-purple-800 mb-3">
                    {course.name}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Students</span>
                        <span className="font-medium">{course.students}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Avg Score</span>
                        <span className="font-medium">{course.avgScore}%</span>
                      </div>
                      <ProgressBar
                        progress={course.avgScore}
                        color="bg-green-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Completion</span>
                        <span className="font-medium">
                          {course.completion}%
                        </span>
                      </div>
                      <ProgressBar
                        progress={course.completion}
                        color="bg-blue-500"
                      />
                    </div>
                  </div>

                  <button className="mt-3 w-full bg-purple-100 text-purple-700 rounded-lg py-1.5 text-xs font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>View Details</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Mastery & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Topic Mastery */}
            <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <h2 className="text-sm sm:text-lg font-bold text-purple-700 mb-3 sm:mb-4 flex items-center font-comic">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                Topic Mastery Levels
              </h2>

              <div className="space-y-3">
                {topicMastery.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-3 shadow-sm border border-purple-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-purple-800">
                        {topic.topic}
                      </h4>
                      <span className="text-xs text-gray-600">
                        {topic.students} students
                      </span>
                    </div>
                    <ProgressBar
                      progress={topic.mastery}
                      color={
                        topic.mastery >= 85
                          ? "bg-green-500"
                          : topic.mastery >= 70
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }
                      showLabel={true}
                    />
                    {topic.mastery < 70 && (
                      <button className="mt-2 w-full bg-yellow-100 text-yellow-700 rounded-lg py-1 text-xs font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center space-x-1">
                        <Lightbulb className="w-3 h-3" />
                        <span>Create Practice Set</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Teaching Resources & Quick Actions */}
            <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <h2 className="text-sm sm:text-lg font-bold text-purple-700 mb-3 sm:mb-4 flex items-center font-comic">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white border-2 border-purple-300 rounded-xl p-4 hover:bg-purple-100 transition-colors group">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <PenTool className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-700">
                      Create Assignment
                    </span>
                  </div>
                </button>

                <button className="bg-white border-2 border-purple-300 rounded-xl p-4 hover:bg-purple-100 transition-colors group">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Video className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-700">
                      Start Live Class
                    </span>
                  </div>
                </button>

                <button className="bg-white border-2 border-purple-300 rounded-xl p-4 hover:bg-purple-100 transition-colors group">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-700">
                      Send Announcement
                    </span>
                  </div>
                </button>

                <button className="bg-white border-2 border-purple-300 rounded-xl p-4 hover:bg-purple-100 transition-colors group">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-700">
                      Upload Resources
                    </span>
                  </div>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="bg-white rounded-xl p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-purple-700">
                        Achievement Unlocked!
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Your class average improved by 15%!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Questions & Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Pending Questions */}
            <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-lg font-bold text-purple-700 flex items-center font-comic">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                  Student Questions
                </h2>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                  5 pending
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  {
                    student: "Emma Wilson",
                    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
                    question:
                      "I&apos;m having trouble understanding the quadratic formula. Can you explain it differently?",
                    subject: "Mathematics",
                    time: "10 min ago",
                  },
                  {
                    student: "James Chen",
                    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
                    question:
                      "What&apos;s the difference between mitosis and meiosis?",
                    subject: "Biology",
                    time: "1 hour ago",
                  },
                  {
                    student: "Sophie Taylor",
                    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
                    question:
                      "Can we have extra practice problems for tomorrow&apos;s test?",
                    subject: "Physics",
                    time: "2 hours ago",
                  },
                ].map((q, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-3 shadow-sm border border-purple-200"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={q.avatar}
                        alt={q.student}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-purple-800">
                            {q.student}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {q.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">
                          {q.question}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {q.subject}
                          </span>
                          <button className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center space-x-1">
                            <Send className="w-3 h-3" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-purple-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-lg font-bold text-purple-700 flex items-center font-comic">
                  <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                  Student Feedback
                </h2>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-purple-700">4.8</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    student: "Michael Brown",
                    rating: 5,
                    comment:
                      "Amazing teacher! Makes complex topics easy to understand.",
                    course: "Mathematics",
                    date: "Yesterday",
                  },
                  {
                    student: "Olivia Davis",
                    rating: 5,
                    comment:
                      "Love the interactive teaching methods. Very engaging!",
                    course: "Physics",
                    date: "2 days ago",
                  },
                  {
                    student: "Alex Johnson",
                    rating: 4,
                    comment:
                      "Great explanations, but would love more practice problems.",
                    course: "Chemistry",
                    date: "3 days ago",
                  },
                ].map((feedback, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-3 shadow-sm border border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-purple-800">
                        {feedback.student}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < feedback.rating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mb-2">
                      {feedback.comment}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {feedback.course}
                      </span>
                      <span className="text-xs text-gray-500">
                        {feedback.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-3 w-full bg-purple-200 text-purple-700 rounded-lg py-2 text-sm font-medium hover:bg-purple-300 transition-colors">
                View All Feedback
              </button>
            </div>
          </div>

          {/* Teaching Insights */}
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border-2 sm:border-4 border-purple-200 font-comic">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-purple-700 mb-2 flex items-center">
                  <Medal className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                  Teaching Insights & Achievements
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Your teaching impact this semester
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      156
                    </div>
                    <div className="text-xs text-gray-600">Lessons Taught</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-200">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-xs text-gray-600">Pass Rate</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-200">
                    <div className="text-2xl font-bold text-blue-600">
                      4.8⭐
                    </div>
                    <div className="text-xs text-gray-600">Student Rating</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-200">
                    <div className="text-2xl font-bold text-orange-600">28</div>
                    <div className="text-xs text-gray-600">Awards Given</div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="bg-white/70 rounded-xl p-3 mb-4">
                  <h3 className="font-bold text-purple-700 text-sm mb-2">
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-purple-700">
                          Top Teacher of the Month
                        </p>
                        <p className="text-xs text-gray-600">
                          Achieved 95% student satisfaction
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-purple-700">
                          100% Assignment Completion
                        </p>
                        <p className="text-xs text-gray-600">
                          All students completed their assignments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teaching Tips */}
                <div className="bg-purple-200/50 rounded-xl p-3">
                  <h3 className="font-bold text-purple-700 text-sm mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1 text-yellow-500" />
                    AI Teaching Assistant Tip
                  </h3>
                  <p className="text-xs text-purple-700">
                    &quot;Based on your class performance, try incorporating more
                    visual aids in your Geometry lessons. Students with visual
                    learning preferences showed 23% better retention with
                    diagrams.&quot;
                  </p>
                  <button className="mt-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
                    Get More Tips
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <FaChalkboardTeacher className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <span className="text-sm font-bold text-purple-700 mt-2">
                  Teacher Excellence
                </span>
                <div className="flex items-center space-x-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
