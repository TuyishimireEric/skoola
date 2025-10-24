import React, { useState } from "react";
import {
  Search,
  Grid,
  List,
  UserPlus,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

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
  recentActivity: string;
}

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "excellent" | "good" | "warning" | "critical";

const StudentsPage: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sample student data
  const students: Student[] = [
    {
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
      recentActivity: "Completed Math Quiz (85/100)",
    },
    {
      id: "2",
      name: "Jean-Pierre Mugabo",
      grade: "Grade 10",
      avatar: "JM",
      attendance: 88,
      lastActive: "5 hours ago",
      email: "jean.m@school.com",
      phone: "+250 788 234 567",
      gradeAverage: 76,
      behaviorScore: 78,
      dropoutRisk: 45,
      status: "warning",
      recentActivity: "Late arrival (30 mins)",
    },
    {
      id: "3",
      name: "Fatima Senghor",
      grade: "Grade 9",
      avatar: "FS",
      attendance: 92,
      lastActive: "1 day ago",
      email: "fatima.s@school.com",
      phone: "+250 788 345 678",
      gradeAverage: 82,
      behaviorScore: 88,
      dropoutRisk: 20,
      status: "good",
      recentActivity: "Submitted Homework",
    },
    {
      id: "4",
      name: "Emmanuel Nkurunziza",
      grade: "Grade 10",
      avatar: "EN",
      attendance: 72,
      lastActive: "3 days ago",
      email: "emmanuel.n@school.com",
      phone: "+250 788 456 789",
      gradeAverage: 45,
      behaviorScore: 62,
      dropoutRisk: 72,
      status: "critical",
      recentActivity: "Absent from class",
    },
    {
      id: "5",
      name: "Sarah Uwamahoro",
      grade: "Grade 9",
      avatar: "SU",
      attendance: 98,
      lastActive: "1 hour ago",
      email: "sarah.u@school.com",
      phone: "+250 788 567 890",
      gradeAverage: 94,
      behaviorScore: 96,
      dropoutRisk: 8,
      status: "excellent",
      recentActivity: "Top scorer in Science test",
    },
    {
      id: "6",
      name: "Michael Okonkwo",
      grade: "Grade 11",
      avatar: "MO",
      attendance: 85,
      lastActive: "4 hours ago",
      email: "michael.o@school.com",
      phone: "+250 788 678 901",
      gradeAverage: 79,
      behaviorScore: 82,
      dropoutRisk: 35,
      status: "good",
      recentActivity: "Participated in debate club",
    },
    {
      id: "7",
      name: "Grace Uwase",
      grade: "Grade 11",
      avatar: "GU",
      attendance: 78,
      lastActive: "1 day ago",
      email: "grace.u@school.com",
      phone: "+250 788 789 012",
      gradeAverage: 68,
      behaviorScore: 72,
      dropoutRisk: 58,
      status: "warning",
      recentActivity: "Sleeping in class (reported)",
    },
    {
      id: "8",
      name: "David Kimani",
      grade: "Grade 9",
      avatar: "DK",
      attendance: 87,
      lastActive: "6 hours ago",
      email: "david.k@school.com",
      phone: "+250 788 890 123",
      gradeAverage: 81,
      behaviorScore: 85,
      dropoutRisk: 25,
      status: "good",
      recentActivity: "Joined study group",
    },
  ];

  const grades = ["all", "Grade 9", "Grade 10", "Grade 11"];

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesGrade =
      selectedGrade === "all" || student.grade === selectedGrade;
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    return matchesGrade && matchesSearch && matchesStatus;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-4 h-4" />;
      case "good":
        return <TrendingUp className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const stats = {
    total: filteredStudents.length,
    avgAttendance: Math.round(
      filteredStudents.reduce((acc, s) => acc + s.attendance, 0) /
        filteredStudents.length
    ),
    atRisk: filteredStudents.filter((s) => s.dropoutRisk > 50).length,
    avgGrade: Math.round(
      filteredStudents.reduce((acc, s) => acc + s.gradeAverage, 0) /
        filteredStudents.length
    ),
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl py-6 mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgAttendance}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Grade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgGrade}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.atRisk}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grade Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {grades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          selectedGrade === grade
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {grade === "all" ? "All Grades" : grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "excellent", "good", "warning", "critical"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setStatusFilter(status as FilterStatus)
                          }
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                            statusFilter === status
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Students Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {student.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-xs text-gray-500">{student.grade}</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                      student.status
                    )}`}
                  >
                    {getStatusIcon(student.status)}
                    <span className="capitalize">{student.status}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Attendance</p>
                    <p
                      className={`text-sm font-bold ${
                        student.attendance >= 90
                          ? "text-green-600"
                          : student.attendance >= 80
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {student.attendance}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Grade Avg</p>
                    <p className="text-sm font-bold text-gray-900">
                      {student.gradeAverage}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Risk</p>
                    <p
                      className={`text-sm font-bold ${
                        student.dropoutRisk >= 70
                          ? "text-red-600"
                          : student.dropoutRisk >= 50
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {student.dropoutRisk}%
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Recent Activity</p>
                  <p className="text-xs font-medium text-gray-900">
                    {student.recentActivity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {student.lastActive}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all">
                    View Profile
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Grade
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Attendance
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Grade Avg
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Risk Level
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Last Active
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {student.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {student.grade}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {getStatusIcon(student.status)}
                          <span className="capitalize">{student.status}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                student.attendance >= 90
                                  ? "bg-green-500"
                                  : student.attendance >= 80
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${student.attendance}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {student.attendance}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-900">
                        {student.gradeAverage}%
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-sm font-bold ${
                            student.dropoutRisk >= 70
                              ? "text-red-600"
                              : student.dropoutRisk >= 50
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {student.dropoutRisk}%
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {student.lastActive}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </button>
                          <Link
                            href={`/students/${student.id}`}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGrade("all");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
