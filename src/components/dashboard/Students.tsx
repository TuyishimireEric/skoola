import React, { useState, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  UserPlus,
  Filter,
  Download,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useStudents } from "@/hooks/user/useStudents";
import { StudentListResponse } from "@/server/queries/students";
import { AddStudents } from "../users/AddStudents";
import Link from "next/link";
import { useClientSession } from "@/hooks/user/useClientSession";

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "excellent" | "good" | "warning" | "critical";

const StudentsPage: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState<number>(1);
  const { userRoleId } = useClientSession();

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
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "good":
        return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "warning":
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "critical":
        return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />;
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load students
          </h3>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors w-full sm:w-auto"
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

      <div className="py-4 px-3 max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Total Students</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? "..." : stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Avg Attendance</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? "..." : `${stats.avgAttendance}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Avg Grade</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? "..." : `${stats.avgGrade}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">At Risk</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? "..." : stats.atRisk}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        {userRoleId !== 6 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search and View Toggle Row */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 justify-between sm:justify-start">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none justify-center"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden xs:inline">Filters</span>
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
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 flex-wrap">
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none justify-center">
                  <Download className="w-4 h-4" />
                  <span className="hidden xs:inline">Export</span>
                </button>

                <button
                  onClick={() => setAddStudent(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex-1 sm:flex-none justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-2 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </label>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {grades.map((gradeOption) => (
                          <button
                            key={gradeOption}
                            onClick={() => setSelectedGrade(gradeOption)}
                            className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-shrink-0 ${selectedGrade === gradeOption
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            {gradeOption === "all" ? "All" : gradeOption.replace("Grade ", "G")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Status
                      </label>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {["all", "excellent", "good", "warning", "critical"].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                setStatusFilter(status as FilterStatus)
                              }
                              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize flex-shrink-0 ${statusFilter === status
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                              {status === "all" ? "All" : status}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">Loading students...</p>
          </div>
        )}

        <div className="w-full">
          {/* Students Display - Grid View */}
          {!isLoading && viewMode === "grid" && (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredStudents.map((student) => {
                const studentStatus = getStatusFromScore(student.performanceScore || 0);
                const attendance = getAttendance(student);
                const dropoutRisk = getDropoutRisk(student);
                const displayAvatar = student.avatar || getInitials(student.fullName);

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.fullName}
                            className="w-8 h-8 sm:w-10 sm:h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                            {displayAvatar}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-green-600 transition-colors truncate">
                            {student.fullName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {student.grade || "Not Assigned"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(
                          studentStatus
                        )}`}
                      >
                        {getStatusIcon(studentStatus)}
                        <span className="hidden xs:inline capitalize">{studentStatus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1 truncate">Attend</p>
                        <p
                          className={`text-xs sm:text-sm font-bold ${attendance >= 90
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
                        <p className="text-xs text-gray-600 mb-1 truncate">Perf</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          {student.performanceScore || 0}%
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1 truncate">Risk</p>
                        <p
                          className={`text-xs sm:text-sm font-bold ${dropoutRisk >= 70
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
                      <Link
                        href={`/students/${student.id}`}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all min-w-0"
                      >
                        <span className="truncate">View Profile</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      </Link>
                      <button className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Students Display - List View */}
          {!isLoading && viewMode === "list" && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700">
                        Student
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700 hidden sm:table-cell">
                        Grade
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700 hidden md:table-cell">
                        Status
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700">
                        Attendance
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700 hidden lg:table-cell">
                        Performance
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700">
                        Risk
                      </th>
                      <th className="text-left p-3 sm:p-4 text-xs font-semibold text-gray-700">
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
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              {student.avatar ? (
                                <img
                                  src={student.avatar}
                                  alt={student.fullName}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                                  {displayAvatar}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                                  {student.fullName}
                                </p>
                                <p className="text-xs text-gray-500 truncate hidden xs:block">
                                  {student.email || student.userName}
                                </p>
                                <p className="text-xs text-gray-500 sm:hidden">
                                  {student.grade || "Not Assigned"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-xs text-gray-700 hidden sm:table-cell">
                            {student.grade || "Not Assigned"}
                          </td>
                          <td className="p-3 sm:p-4 hidden md:table-cell">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                                studentStatus
                              )}`}
                            >
                              {getStatusIcon(studentStatus)}
                              <span className="capitalize">{studentStatus}</span>
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex-1 max-w-16 sm:max-w-20 bg-gray-200 rounded-full h-2 flex-shrink-0">
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
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {attendance}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">
                            {student.performanceScore || 0}%
                          </td>
                          <td className="p-3 sm:p-4">
                            <span
                              className={`text-xs sm:text-sm font-bold whitespace-nowrap ${dropoutRisk >= 70
                                ? "text-red-600"
                                : dropoutRisk >= 50
                                  ? "text-orange-600"
                                  : "text-green-600"
                                }`}
                            >
                              {dropoutRisk}%
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                              </button>
                              <Link
                                href={`/students/${student.id}`}
                                className="px-2 sm:px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                              >
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
                <div className="border-t border-gray-200 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 max-w-md mx-auto">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGrade("all");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
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