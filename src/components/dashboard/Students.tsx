import React, { useState, useMemo } from "react";
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
  Loader2,
} from "lucide-react";
import { useStudents } from "@/hooks/user/useStudents";
import { StudentListResponse } from "@/server/queries/students";
import { AddStudents } from "../users/AddStudents";
import Link from "next/link";

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "excellent" | "good" | "warning" | "critical";

const StudentsPage: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState<number>(1);

  // const [pageSize, setPageSize] = useState<number>(20);
  // const [sortBy, setSortBy] = useState<string>("name");
  // const [sortOrder, setSortOrder] = useState<string>("asc");
  // const [activeOnly, setActiveOnly] = useState<boolean>(false);

  const pageSize = 20;
  const sortBy = "name";
  const sortOrder = "asc";
  const activeOnly = false;

  const [addStudent, setAddStudent] = useState<boolean>(false);
  const grade =
    selectedGrade === "all" ? "" : selectedGrade.replace("Grade ", "");

  const {
    data: studentsData,
    isLoading,
    isError,
    refetch,
  } = useStudents({
    page,
    pageSize,
    searchText: searchQuery,
    sort: sortBy,
    order: sortOrder,
    activeOnly,
    grade,
  });

  const students = studentsData?.students || [];

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusFromScore = (score: number): "excellent" | "good" | "warning" | "critical" => {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "warning";
    return "critical";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const getAttendance = (student: StudentListResponse) => {
    return student.attendanceRate || 0;
  };

  const getDropoutRisk = (student: StudentListResponse) => {
    const attendance = student.attendanceRate || 0;
    const performance = student.performanceScore || 0;

    // Calculate risk score: 60% attendance + 40% performance
    const healthScore = (attendance * 0.6) + (performance * 0.4);

    // Invert to get risk (higher health score = lower risk)
    const riskScore = Math.max(0, 100 - healthScore);

    return Math.round(riskScore);
  };

  const getRiskLevel = (riskScore: number): {
    level: string;
    color: string;
    textColor: string;
  } => {
    if (riskScore >= 70) {
      return {
        level: 'Critical',
        color: 'bg-red-500',
        textColor: 'text-red-600'
      };
    } else if (riskScore >= 50) {
      return {
        level: 'High',
        color: 'bg-orange-500',
        textColor: 'text-orange-600'
      };
    } else if (riskScore >= 30) {
      return {
        level: 'Medium',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      };
    } else {
      return {
        level: 'Low',
        color: 'bg-green-500',
        textColor: 'text-green-600'
      };
    }
  };

  const grades = [
    "all",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
  ];

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesGrade =
        selectedGrade === "all" || student.grade === selectedGrade || !student.grade;
      const matchesSearch = student.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const studentStatus = getStatusFromScore(student.averageScore || 0);
      const matchesStatus =
        statusFilter === "all" || studentStatus === statusFilter;
      return matchesGrade && matchesSearch && matchesStatus;
    });
  }, [students, selectedGrade, searchQuery, statusFilter]);

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

  const stats = useMemo(() => {
    const attendances = filteredStudents.map(s => s.attendanceRate || 0);
    const avgAttendance = attendances.length > 0
      ? Math.round(attendances.reduce((acc, val) => acc + val, 0) / attendances.length)
      : 0;

    const avgGrade = filteredStudents.length > 0
      ? Math.round(
        filteredStudents.reduce((acc, s) => acc + (s.performanceScore || 0), 0) /
        filteredStudents.length
      )
      : 0;

    // Use new risk calculation: risk >= 50 (meaning health score <= 50)
    const atRisk = filteredStudents.filter((s) => {
      const riskScore = getDropoutRisk(s);
      return riskScore >= 50; // High or Critical risk
    }).length;

    return {
      total: filteredStudents.length,
      avgAttendance,
      atRisk,
      avgGrade,
    };
  }, [filteredStudents]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load students
          </h3>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {addStudent && (
        <AddStudents
          isOpen={addStudent}
          onClose={() => setAddStudent(false)}
          myClassId={null}
        />
      )}

      <div className="py-6 max-w-7xl mx-auto pr-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.total}
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
                  {isLoading ? "..." : `${stats.avgAttendance}%`}
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
                  {isLoading ? "..." : `${stats.avgGrade}%`}
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
                  {isLoading ? "..." : stats.atRisk}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
                  className={`p-2 rounded transition-colors ${viewMode === "grid"
                    ? "bg-green-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list"
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

              <button onClick={() => setAddStudent(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {grades.map((gradeOption) => (
                      <button
                        key={gradeOption}
                        onClick={() => setSelectedGrade(gradeOption)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedGrade === gradeOption
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {gradeOption === "all" ? "All Grades" : gradeOption}
                      </button>
                    ))}
                  </div>
                </div>

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
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${statusFilter === status
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

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading students...</p>
          </div>
        )}

        <div className="max-w-full">
          {/* Students Display - Grid View */}
          {!isLoading && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-full">
              {filteredStudents.map((student) => {
                const studentStatus = getStatusFromScore(student.performanceScore || 0);
                const attendance = getAttendance(student);
                const dropoutRisk = getDropoutRisk(student);
                const displayAvatar = student.avatar || getInitials(student.fullName);

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {displayAvatar}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition-colors">
                            {student.fullName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {student.grade || "Not Assigned"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                          studentStatus
                        )}`}
                      >
                        {getStatusIcon(studentStatus)}
                        <span className="capitalize">{studentStatus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Attendance</p>
                        <p
                          className={`text-sm font-bold ${attendance >= 90
                            ? "text-green-600"
                            : attendance >= 80
                              ? "text-yellow-600"
                              : "text-red-600"
                            }`}
                        >
                          {attendance}%
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Performance</p>
                        <p className="text-sm font-bold text-gray-900">
                          {student.performanceScore || 0}%
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Risk</p>
                        <p
                          className={`text-sm font-bold ${dropoutRisk >= 70
                            ? "text-red-600"
                            : dropoutRisk >= 50
                              ? "text-orange-600"
                              : "text-green-600"
                            }`}
                        >
                          {dropoutRisk}%
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/students/${student.id}`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all">
                        View Profile
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Students Display - List View */}
          {!isLoading && viewMode === "list" && (
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
                        Performance
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700">
                        Risk Level
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const studentStatus = getStatusFromScore(student.performanceScore || 0);
                      const attendance = getAttendance(student);
                      const dropoutRisk = getDropoutRisk(student);
                      const displayAvatar = student.avatar || getInitials(student.fullName);

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {student.avatar ? (
                                <img
                                  src={student.avatar}
                                  alt={student.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                                  {displayAvatar}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm text-gray-900">
                                  {student.fullName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {student.email || student.userName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-gray-700">
                            {student.grade || "Not Assigned"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                                studentStatus
                              )}`}
                            >
                              {getStatusIcon(studentStatus)}
                              <span className="capitalize">{studentStatus}</span>
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${attendance >= 90
                                    ? "bg-green-500"
                                    : attendance >= 80
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                    }`}
                                  style={{ width: `${attendance}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {attendance}%
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-semibold text-gray-900">
                            {student.performanceScore || 0}%
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-sm font-bold ${dropoutRisk >= 70
                                ? "text-red-600"
                                : dropoutRisk >= 50
                                  ? "text-orange-600"
                                  : "text-green-600"
                                }`}
                            >
                              {dropoutRisk}%
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Mail className="w-4 h-4 text-gray-600" />
                              </button>
                              <Link href={`/students/${student.id}`} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {studentsData && studentsData.totalPages > 1 && (
                <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing page {page} of {studentsData.totalPages} ({studentsData.totalCount} total students)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(studentsData.totalPages, p + 1))}
                      disabled={page === studentsData.totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredStudents.length === 0 && (
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