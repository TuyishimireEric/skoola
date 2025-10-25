"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Users,
  UserCheck,
  Star,
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
  UserPlus,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MailIcon,
  LucideIcon,
} from "lucide-react";
import StatsCard from "../dashboard/StatsCard";
import { useStudents } from "@/hooks/user/useStudents";
import { StudentListResponse } from "@/server/queries/students";
import ProfileImage from "../dashboard/ProfileImage";
import { AddStudents } from "./AddStudents";

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
        className="flex items-center justify-between space-x-2 bg-white border-2 border-primary-400 rounded-xl px-3 py-2 hover:bg-primary-50 transition-colors min-w-[140px] w-full sm:w-auto shadow-sm"
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-primary-700 flex-shrink-0" />}
          <span className="text-sm font-medium text-primary-800 truncate">
            {value}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-primary-700 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border-2 border-primary-400 rounded-xl shadow-xl z-20 min-w-[140px] w-full max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  value === option
                    ? "bg-primary-100 text-primary-900"
                    : "text-primary-800"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const formatLastActivity = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
};

const getRankingColor = (index: number) => {
  const ranking = index + 1;
  switch (ranking) {
    case 1:
      return "bg-green-400 text-green-900 border-green-500 shadow-lg";
    case 2:
      return "bg-gray-300 text-gray-800 border-gray-400 shadow-md";
    case 3:
      return "bg-orange-400 text-orange-900 border-orange-500 shadow-md";
    default:
      return "bg-blue-100 text-blue-800 border-blue-300";
  }
};

// Mobile Card Component for responsive display
const StudentCard: React.FC<{
  student: StudentListResponse;
  index: number;
  page: number;
  pageSize: number;
  onView: (student: StudentListResponse) => void;
  onEdit: (student: StudentListResponse) => void;
  onDelete: (id: string) => void;
}> = ({ student, index, page, pageSize, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white border-2 border-primary-200 rounded-xl p-4 space-y-3 shadow-sm">
      {/* Header with rank and avatar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold ${getRankingColor(
              (page - 1) * pageSize + index
            )}`}
          >
            {(page - 1) * pageSize + (index + 1)}
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-400 flex-shrink-0 bg-primary-100 flex items-center justify-center">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-bold text-sm">
                {student.firstName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-primary-900 text-sm">
              {student.fullName}
            </h3>
            <div className="flex gap-2">
              {student.userName && (
                <p className="text-xs text-primary-600 font-medium">
                  @{student.userName}
                </p>
              )}
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                {student.grade}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(student)}
            className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
            title="View Student"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(student)}
            className="p-1.5 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
            title="Edit Student"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(student.id)}
            className="p-1.5 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary-50 rounded-lg p-2">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3 h-3 text-red-600" />
            <span className="text-xs font-bold text-primary-900">
              {student.totalCourses} Courses
            </span>
          </div>
        </div>
        <div className="bg-primary-50 rounded-lg p-2">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-xs font-bold text-primary-900">
              {student.currentStreak} days
            </span>
          </div>
        </div>
        <div className="bg-primary-50 rounded-lg p-2">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-green-600 fill-current" />
            <span className="text-xs font-bold text-primary-900">
              {student.stars} Stars
            </span>
          </div>
        </div>
        <div className="bg-primary-50 rounded-lg p-2">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-bold text-primary-900">
              {student.averageScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Parent info */}
      {student.parent ? (
        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-3 h-3 text-blue-700" />
            <span className="font-bold text-blue-800 text-xs">
              {student.parent.name}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <MailIcon className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-blue-700">
              {student.parent.email}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-center">
          <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <span className="text-xs text-gray-600 font-medium">No Parent</span>
        </div>
      )}
    </div>
  );
};

const StudentsListing: React.FC = () => {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [parentFilter, setParentFilter] = useState("All Students");
  const [sortBy, setSortBy] = useState("stars");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addStudent, setAddStudent] = useState<boolean>(false);

  // Prepare parameters for API call
  const activeOnly = statusFilter === "Active";
  const grade =
    gradeFilter === "All Grades" ? "" : gradeFilter.replace("Grade ", "");

  // Fetch students using the hook
  const {
    data: studentsData,
    isLoading,
    isError,
    refetch,
  } = useStudents({
    page,
    pageSize,
    searchText: searchTerm,
    sort: sortBy,
    order: sortOrder,
    activeOnly,
    grade,
  });

  // Filter options
  const statusOptions = ["All Status", "Active", "Inactive"];
  const gradeOptions = [
    "All Grades",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
  ];
  const parentOptions = ["All Students", "With Parent", "Without Parent"];

  // Client-side filtering for parent filter
  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) return [];

    return studentsData.students.filter((student) => {
      const matchesParent =
        parentFilter === "All Students" ||
        (parentFilter === "With Parent" && student.parent !== null) ||
        (parentFilter === "Without Parent" && student.parent === null);

      return matchesParent;
    });
  }, [studentsData?.students, parentFilter]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return sortOrder === "asc" ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    }
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const handleExportStudents = () => {
    if (!filteredStudents.length) return;

    const csvContent = [
      [
        "Name",
        "Username",
        "Age",
        "Grade",
        "Stars",
        "Average Score",
        "Total Courses",
        "Current Streak",
        "Status",
        "Email",
        "Parent Name",
        "Parent Email",
        "Parent Phone",
        "Last Activity",
      ].join(","),
      ...filteredStudents.map((student) =>
        [
          `"${student.fullName}"`,
          `"${student.userName}"`,
          student.age,
          `"${student.grade}"`,
          student.stars,
          student.averageScore,
          student.totalCourses,
          student.currentStreak,
          student.status,
          student.email,
          student.parent ? `"${student.parent.name}"` : "",
          student.parent ? student.parent.email : "",
          student.parent ? student.parent.phone : "",
          formatLastActivity(student.lastActivity),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewStudent = (student: StudentListResponse) => {
    alert(`Viewing ${student.fullName}'s profile`);
  };

  const handleEditStudent = (student: StudentListResponse) => {
    alert(`Editing ${student.fullName}'s information`);
  };

  const handleDeleteStudent = (id: string) => {
    const student = filteredStudents.find((s) => s.id === id);
    if (confirm(`Are you sure you want to remove ${student?.fullName}?`)) {
      refetch();
    }
  };

  // Calculate stats from API data
  const totalStudents = studentsData?.totalCount || 0;
  const activeStudents =
    studentsData?.students?.filter((s) => s.status === "Active").length || 0;
  const studentsWithParents =
    studentsData?.students?.filter((s) => s.parent !== null).length || 0;

  const avgStars =
    studentsData?.students && studentsData.students.length > 0
      ? (
          studentsData.students.reduce(
            (sum, s) => sum + Number(s.stars || 0),
            0
          ) / studentsData.students.length
        ).toFixed(1)
      : "0.0";

  const totalCourses =
    studentsData?.students?.reduce(
      (sum, s) => sum + Number(s.totalCourses || 0),
      0
    ) || 0;

  // Handle stat card clicks for filtering
  const handleStatClick = (filterType: string) => {
    switch (filterType) {
      case "active":
        setStatusFilter("Active");
        break;
      case "withParent":
        setParentFilter("With Parent");
        break;
      case "withoutParent":
        setParentFilter("Without Parent");
        break;
      default:
        setStatusFilter("All Status");
        setParentFilter("All Students");
        setGradeFilter("All Grades");
    }
    setPage(1);
  };

  // Pagination handlers
  const totalPages = studentsData?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, page - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-orange-100 p-4">
        <div className="text-red-600 text-xl font-bold mb-4 text-center">
          Error loading students
        </div>
        <button
          onClick={() => refetch()}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-comic font-bold shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full p-2 lg:p-6 min-h-screen">
      {addStudent && (
        <AddStudents
          isOpen={addStudent}
          onClose={() => setAddStudent(false)}
          myClassId={null}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <div
          onClick={() => handleStatClick("total")}
          className="cursor-pointer"
        >
          <StatsCard
            label="Total Students"
            value={`${totalStudents}`}
            icon={Users}
            color="border-primary-300"
            isLoading={isLoading}
          />
        </div>

        <div
          onClick={() => handleStatClick("active")}
          className="cursor-pointer"
        >
          <StatsCard
            label="Active Students"
            value={`${activeStudents}`}
            icon={UserCheck}
            color="border-green-300"
            isLoading={isLoading}
          />
        </div>

        <div
          onClick={() => handleStatClick("withParent")}
          className="cursor-pointer"
        >
          <StatsCard
            label="Assigned Parents"
            value={`${studentsWithParents}`}
            icon={UserPlus}
            color="border-orange-300"
            isLoading={isLoading}
          />
        </div>

        <StatsCard
          label="Total Courses"
          value={`${totalCourses}`}
          icon={BookOpen}
          color="border-red-300"
          isLoading={isLoading}
        />

        <StatsCard
          label="Avg Stars"
          value={`${avgStars}`}
          icon={Star}
          color="border-green-300"
          isLoading={isLoading}
        />
      </div>

      {/* Content Area */}
      <div className="bg-white/95 border-2 border-primary-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-100 to-orange-100 rounded-2xl p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-600" />
            <input
              type="text"
              placeholder="Search students or parents..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-comic text-lg bg-white"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary-700" />
              <span className="text-base font-bold text-primary-800 font-comic">
                Filters:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 flex-1 lg:max-w-2xl">
              <FilterDropdown
                label="Status"
                value={statusFilter}
                options={statusOptions}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                icon={UserCheck}
              />

              <FilterDropdown
                label="Grade"
                value={gradeFilter}
                options={gradeOptions}
                onChange={(value) => {
                  setGradeFilter(value);
                  setPage(1);
                }}
                icon={GraduationCap}
              />

              <FilterDropdown
                label="Parent"
                value={parentFilter}
                options={parentOptions}
                onChange={(value) => {
                  setParentFilter(value);
                  setPage(1);
                }}
                icon={Users}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Clear filters button */}
              {(searchTerm ||
                statusFilter !== "All Status" ||
                gradeFilter !== "All Grades" ||
                parentFilter !== "All Students") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All Status");
                    setGradeFilter("All Grades");
                    setParentFilter("All Students");
                    setPage(1);
                  }}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-comic font-bold text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}

              <button
                onClick={handleExportStudents}
                disabled={!filteredStudents.length || isLoading}
                className="bg-green-600 truncate text-sm text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-comic font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              <button
                onClick={() => setAddStudent(true)}
                className="bg-primary-600 truncate text-sm text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors font-comic font-bold flex items-center justify-center shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="px-4 py-12 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-bold text-primary-800">
              Loading students...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Users className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary-700 mb-2">
              No Students Found
            </h3>
            <p className="text-sm text-primary-600">
              {searchTerm ||
              statusFilter !== "All Status" ||
              gradeFilter !== "All Grades" ||
              parentFilter !== "All Students"
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first student"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full font-comic">
                <thead className="bg-gradient-to-r from-primary-100 to-orange-100 border-b-2 border-primary-100">
                  <tr>
                    <th className="px-4 py-5 text-left font-bold text-primary-900 text-sm">
                      Rank
                    </th>
                    <th className="px-4 py-5 text-left">
                      <button
                        onClick={() => handleSort("fullName")}
                        className="flex items-center space-x-1 font-bold text-primary-900 hover:text-primary-800 transition-colors text-sm"
                      >
                        <span>Student</span>
                        {getSortIcon("fullName")}
                      </button>
                    </th>
                    <th className="px-4 py-5 text-left font-bold text-primary-900 text-sm">
                      Age
                    </th>
                    <th className="px-4 py-5 text-left">
                      <button
                        onClick={() => handleSort("totalCourses")}
                        className="flex items-center space-x-1 font-bold text-primary-900 hover:text-primary-800 transition-colors text-sm"
                      >
                        <span>Courses</span>
                        {getSortIcon("totalCourses")}
                      </button>
                    </th>
                    <th className="px-4 py-5 text-left">
                      <button
                        onClick={() => handleSort("currentStreak")}
                        className="flex items-center space-x-1 font-bold text-primary-900 hover:text-primary-800 transition-colors text-sm"
                      >
                        <span>Streak</span>
                        {getSortIcon("currentStreak")}
                      </button>
                    </th>
                    <th className="px-4 py-5 text-left">
                      <button
                        onClick={() => handleSort("stars")}
                        className="flex items-center space-x-1 font-bold text-primary-900 hover:text-primary-800 transition-colors text-sm"
                      >
                        <span>Stars</span>
                        {getSortIcon("stars")}
                      </button>
                    </th>
                    <th className="px-4 py-5 text-left">
                      <button
                        onClick={() => handleSort("averageScore")}
                        className="flex items-center space-x-1 font-bold text-primary-900 hover:text-primary-800 transition-colors text-sm"
                      >
                        <span>Avg Score</span>
                        {getSortIcon("averageScore")}
                      </button>
                    </th>
                    <th className="px-4 py-5 text-left font-bold text-primary-900 text-sm">
                      Parent
                    </th>
                    <th className="px-4 py-5 text-center font-bold text-primary-900 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b border-primary-100 hover:bg-primary-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${getRankingColor(
                            (page - 1) * pageSize + index
                          )}`}
                        >
                          {(page - 1) * pageSize + (index + 1)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-400 flex-shrink-0 bg-primary-100 flex items-center justify-center">
                            {student.avatar ? (
                              <ProfileImage
                                imageUrl={student.avatar}
                                size="w-12 h-12"
                              />
                            ) : (
                              <span className="text-primary-700 font-bold text-lg">
                                {student.firstName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-primary-900 truncate">
                              {student.fullName}
                            </h3>
                            <p className="text-xs text-primary-600 font-medium truncate">
                              @{student.userName}
                            </p>
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 mt-1">
                              {student.grade}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-900">
                          {student.age}
                        </span>
                        <span className="text-xs text-primary-600 ml-1">
                          years
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-bold text-primary-900">
                            {student.totalCourses}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-primary-900">
                            {student.currentStreak}
                          </span>
                          <span className="text-xs text-primary-600">days</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-green-400 fill-current" />
                          <span className="text-sm font-bold text-primary-900">
                            {student.stars}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-primary-400" />
                          <span className="text-sm font-bold text-primary-900">
                            {student.averageScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {student.parent ? (
                          <div className="rounded-xl max-w-xs bg-green-50 p-2 border border-green-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <Users className="w-3 h-3 text-green-700" />
                              <span className="font-bold text-primary-800 text-xs">
                                {student.parent.name}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <MailIcon className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-primary-700">
                                  {student.parent.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-center">
                            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-600 font-medium">
                              No Parent
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Student"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {/* Sort Controls for Mobile */}
              <div className="bg-gradient-to-r from-primary-100 to-orange-100 p-4 border-b-2 border-primary-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-900">
                    Sort by:
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSort("stars")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        sortBy === "stars"
                          ? "bg-primary-600 text-white"
                          : "bg-white text-primary-700 border border-primary-300"
                      }`}
                    >
                      Stars {sortBy === "stars" && getSortIcon("stars")}
                    </button>
                    <button
                      onClick={() => handleSort("averageScore")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        sortBy === "averageScore"
                          ? "bg-primary-600 text-white"
                          : "bg-white text-primary-700 border border-primary-300"
                      }`}
                    >
                      Score{" "}
                      {sortBy === "averageScore" && getSortIcon("averageScore")}
                    </button>
                    <button
                      onClick={() => handleSort("fullName")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        sortBy === "fullName"
                          ? "bg-primary-600 text-white"
                          : "bg-white text-primary-700 border border-primary-300"
                      }`}
                    >
                      Name {sortBy === "fullName" && getSortIcon("fullName")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="p-4 space-y-4">
                {filteredStudents.map((student, index) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    index={index}
                    page={page}
                    pageSize={pageSize}
                    onView={handleViewStudent}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pagination and Page Size Control - Always visible when there are students */}
      {!isLoading && filteredStudents.length > 0 && (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 border-2 border-primary-200 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Size Selector - Always visible */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-primary-800">
                Show:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-primary-300 rounded-lg px-3 py-1 text-sm font-medium text-primary-800 bg-white focus:ring-2 focus:ring-primary-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-primary-700">per page</span>
            </div>

            {/* Pagination Controls - Only show if more than 1 page */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-primary-800 bg-white border border-primary-300 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === pageNum
                          ? "bg-primary-600 text-white border-primary-600"
                          : "text-primary-800 bg-white border border-primary-300 hover:bg-primary-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-primary-800 bg-white border border-primary-300 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className="text-sm text-primary-700 font-medium">
              {totalPages > 1 ? (
                <>
                  Page {page} of {totalPages} ({totalStudents} total)
                </>
              ) : (
                <>{totalStudents} total students</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredStudents.length > 0 && (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 border-2 border-primary-200 shadow-lg">
          <p className="text-sm text-center text-primary-800 font-comic">
            Showing{" "}
            <span className="font-bold text-primary-900">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-primary-900">{totalStudents}</span>{" "}
            students
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentsListing;
