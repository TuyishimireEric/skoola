"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  Users,
  BookOpen,
  Plus,
  Gamepad2,
  FileQuestion,
  Star,
  Target,
  Activity,
  ChevronRight,
  Home,
  LucideIcon,
} from "lucide-react";
import StatsCard from "../StatsCard";
import { useAdminGames } from "@/hooks/games/useAdminGames";
import { GameDataI } from "@/types/Course";
import { GameCardSkeleton } from "./GameCard";
import GameCard from "@/components/games/GameCard";
import AddGameForm from "@/components/games/AddGame";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Social",
  "Geography",
  "Art",
  "Music",
  "Physical Education",
];

export type UserStatus = "Active" | "Inactive" | "Pending" | "Suspended" | null;

export interface OrganizationWithExtras {
  id: string;
  name: string;
  users: {
    id: string;
    fullName: string;
    email: string;
    status: UserStatus;
    Role: {
      name: string;
    } | null;
  }[];
}

const Breadcrumb = ({
  selectedGrade,
  onBack,
}: {
  selectedGrade?: string;
  onBack?: () => void;
}) => {
  const router = useRouter();

  const breadcrumbItems: {
    label: string;
    icon: LucideIcon | null;
    onClick?: () => void;
  }[] = [
    {
      label: "Dashboard",
      icon: Home,
      onClick: () => router.push("/dashboard"),
    },
  ];

  if (selectedGrade && onBack) {
    breadcrumbItems.push({
      label: "Games",
      icon: Gamepad2,
      onClick: onBack,
    });
    breadcrumbItems.push({
      label: `Grades ${selectedGrade}`,
      icon: null,
    });
  } else {
    breadcrumbItems.push({
      label: "Games",
      icon: Gamepad2,
    });
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      <div className="flex-1 backdrop-blur-sm rounded-2xl p-2">
        <ol className="flex items-center space-x-2 text-sm font-semibold">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const Icon = item.icon;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}

                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-green-100 cursor-pointer ${
                      isLast
                        ? "text-green-600 bg-green-100"
                        : "text-gray-600 hover:text-primary-600"
                    }`}
                    type="button"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </button>
                ) : (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      isLast
                        ? "text-green-600 bg-green-50 font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
};

const GRADES = ["1", "2", "3", "4", "5", "6"];

const CONTENT_TYPES = [
  { value: "All Types", label: "All Types" },
  { value: "ImageBased", label: "Game" },
  { value: "FillInTheBlank", label: "Quiz" },
  { value: "Reading", label: "Course" },
  { value: "MathEquation", label: "Math" },
  { value: "NumberSequence", label: "Sequence" },
  { value: "Comparison", label: "Compare" },
  { value: "MissingNumber", label: "Puzzle" },
];

// Define valid sortable keys
type SortableKey =
  | "Title"
  | "StudentsAttended"
  | "CompletionRate"
  | "AverageRating";

const SchoolCoursesView: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [sortBy, setSortBy] = useState<SortableKey>("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newContentType, setNewContentType] = useState<string>("");
  const [hoveredGrade, setHoveredGrade] = useState<string>("");
  const [addGame, setAddGame] = useState<boolean>(false);
  const [editGame, setEditGame] = useState<GameDataI | null>(null);

  const { data: games = [], isLoading } = useAdminGames({
    page: 1,
    pageSize: 100,
    searchText: "",
  });

  // Calculate grade metrics from actual data
  const gradeMetrics = useMemo(() => {
    return GRADES.map((grade) => {
      const gradeGames = games.filter(
        (game) => game.Grade?.toString() === grade
      );
      const totalStudents = gradeGames.reduce(
        (sum, game) => sum + (parseInt(game.StudentsAttended || "0") || 0),
        0
      );
      const avgRating =
        gradeGames.reduce(
          (sum, game) => sum + (parseFloat(game.AverageRating || "0") || 0),
          0
        ) / (gradeGames.length || 1);
      const avgCompletionRate =
        gradeGames.reduce(
          (sum, game) => sum + (parseFloat(game.CompletionRate || "0") || 0),
          0
        ) / (gradeGames.length || 1);

      return {
        courses: gradeGames.length,
        students: totalStudents,
        avgRating: avgRating || 0,
        completionRate: avgCompletionRate || 0,
      };
    });
  }, [games]);

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const matchesGrade =
        selectedGrade === "" || game.Grade?.toString() === selectedGrade;
      const matchesSearch =
        (game.Title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (game.Description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (game.Topic?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesSubject =
        selectedSubject === "" || game.Subject === selectedSubject;
      const matchesType =
        selectedType === "All Types" || game.Type === selectedType;

      return matchesGrade && matchesSearch && matchesSubject && matchesType;
    });

    // Sort games with proper type handling
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortBy) {
        case "StudentsAttended":
          aValue = parseInt(a.StudentsAttended || "0") || 0;
          bValue = parseInt(b.StudentsAttended || "0") || 0;
          break;
        case "CompletionRate":
          aValue = parseFloat(a.CompletionRate || "0") || 0;
          bValue = parseFloat(b.CompletionRate || "0") || 0;
          break;
        case "AverageRating":
          aValue = parseFloat(a.AverageRating || "0") || 0;
          bValue = parseFloat(b.AverageRating || "0") || 0;
          break;
        case "Title":
        default:
          aValue = (a.Title || "").toLowerCase();
          bValue = (b.Title || "").toLowerCase();
          break;
      }

      // Perform comparison
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    games,
    selectedGrade,
    searchQuery,
    selectedSubject,
    selectedType,
    sortBy,
    sortOrder,
  ]);

  const handleCreateContent = (type: string): void => {
    setNewContentType(type);
    setShowCreateModal(true);
  };

  const clearFilters = (): void => {
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedType("All Types");
    setSortBy("Title");
    setSortOrder("asc");
  };

  const hasActiveFilters: boolean =
    searchQuery.trim() !== "" ||
    selectedSubject !== "" ||
    selectedType !== "All Types" ||
    sortBy !== "Title" ||
    sortOrder !== "asc";

  // Stats calculations
  const selectedGradeGames = selectedGrade
    ? games.filter((g) => g.Grade?.toString() === selectedGrade)
    : games;

  const totalCourses = selectedGradeGames.length;
  const activeCourses = selectedGradeGames.filter(
    (g) => g.Status === "Published"
  ).length;
  const totalStudents = selectedGradeGames.reduce(
    (sum, g) => sum + (parseInt(g.StudentsAttended || "0") || 0),
    0
  );
  const avgRating =
    totalCourses > 0
      ? selectedGradeGames.reduce(
          (sum, g) => sum + (parseFloat(g.AverageRating || "0") || 0),
          0
        ) / totalCourses
      : 0;

  return (
    <div className="flex flex-col w-full h-full p-4 min-h-screen">
      {/* Grade Selection */}
      {!selectedGrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl rounded-3xl text-center"
        >
          {/* <Breadcrumb /> */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {isLoading
              ? // Loading skeleton for grade cards
                GRADES.map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-green-200 animate-pulse"
                  >
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))
              : GRADES.map((grade, index) => {
                  const metrics = gradeMetrics[index];
                  const isHovered = hoveredGrade === grade;

                  return (
                    <motion.div
                      key={grade}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredGrade(grade)}
                      onHoverEnd={() => setHoveredGrade("")}
                      onClick={() => setSelectedGrade(grade)}
                      className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-300 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10">
                        {/* Grade Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-3 rounded-2xl transition-colors duration-300 ${
                                isHovered
                                  ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Target className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-3xl w-full font-bold text-gray-800">
                                P{grade}
                              </h3>
                              {/* <p className="text-gray-500">Primary Level</p> */}
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-6 h-6 transition-all duration-300 ${
                              isHovered
                                ? "text-orange-500 transform translate-x-1"
                                : "text-gray-400"
                            }`}
                          />
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center ">
                              <BookOpen className="w-5 h-5 text-orange-500 mr-2" />
                              <span className="text-lg font-bold text-gray-800">
                                {metrics.courses}
                              </span>
                              <p className="text-sm text-gray-600 ml-2">
                                Courses
                              </p>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center">
                              <Users className="w-5 h-5 text-red-500 mr-2" />
                              <span className="text-lg font-bold text-gray-800">
                                {metrics.students}
                              </span>
                              <p className="text-sm text-gray-600 ml-2">
                                Students
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full mt-6 py-3 px-4 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                            isHovered
                              ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <span>Primary {grade} Courses</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
          </motion.div>
        </motion.div>
      )}

      {/* Main Content - Only show when grade is selected */}
      {selectedGrade && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatsCard
              label="Total Courses"
              value={`${totalCourses}`}
              icon={BookOpen}
              color="border-blue-300"
              isLoading={isLoading}
            />
            <StatsCard
              label="Active Courses"
              value={`${activeCourses}`}
              icon={Activity}
              color="border-green-300"
              isLoading={isLoading}
            />
            <StatsCard
              label="Total Students"
              value={`${totalStudents}`}
              icon={Users}
              color="border-purple-300"
              isLoading={isLoading}
            />
            <StatsCard
              label="Avg Rating"
              value={avgRating > 0 ? avgRating.toFixed(1) : "New"}
              icon={Star}
              color="border-yellow-300"
              isLoading={isLoading}
            />
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg border-2 border-primary-200 relative z-20"
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, games, quizzes..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border-2 border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-comic text-lg"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-primary-600" />
                  <span className="text-base font-bold text-primary-700 font-comic">
                    Filters:
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedSubject}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedSubject(e.target.value)
                    }
                    className="px-3 py-2 border-2 border-primary-300 rounded-xl font-comic text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Subjects</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="px-3 py-2 border-2 border-primary-300 rounded-xl font-comic text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-xl font-comic text-sm hover:bg-red-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Create Content Buttons */}
              <div className="flex flex-wrap gap-2">
                <div className="relative group">
                  <button
                    onClick={() => setShowCreateModal(!showCreateModal)}
                    className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-comic font-bold flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showCreateModal ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCreateModal && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-primary-200 z-20 min-w-[200px]">
                      <button
                        onClick={() => setAddGame(true)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 font-comic font-medium rounded-t-xl flex items-center space-x-3"
                      >
                        <BookOpen className="w-5 h-5 text-purple-500" />
                        <span>📚 New Course</span>
                      </button>
                      <button
                        onClick={() => setAddGame(true)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 font-comic font-medium flex items-center space-x-3"
                      >
                        <Gamepad2 className="w-5 h-5 text-green-500" />
                        <span>🎮 New Game</span>
                      </button>
                      <button
                        onClick={() => setAddGame(true)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 font-comic font-medium rounded-b-xl flex items-center space-x-3"
                      >
                        <FileQuestion className="w-5 h-5 text-blue-500" />
                        <span>❓ New Quiz</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Click outside to close dropdown */}
            {showCreateModal && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCreateModal(false)}
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-7xl"
          >
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <GameCardSkeleton key={index} />
              ))
            ) : filteredAndSortedGames.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-4 border-yellow-300 inline-block">
                  <div className="text-8xl mb-4">📚</div>
                  <h3 className="font-comic text-primary-600 text-xl mb-2">
                    No courses found for Grade {selectedGrade}
                  </h3>
                  <p className="font-comic text-primary-500 text-lg mb-4">
                    {hasActiveFilters
                      ? "Try adjusting your filters! 🔍"
                      : "Create your first course to get started! 🚀"}
                  </p>
                  <button
                    onClick={() => handleCreateContent("course")}
                    className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-comic font-bold text-lg transition-all duration-300 border-2 border-blue-300"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Create First Course
                  </button>
                </div>
              </div>
            ) : (
              filteredAndSortedGames.map((game, index) => (
                <GameCard
                  key={game.Id}
                  game={game}
                  index={index}
                  isAdmin={true}
                  setEditGame={(game: GameDataI | null) => setEditGame(game)}
                />
              ))
            )}
          </motion.div>

          {/* Results Summary */}
          {!isLoading && filteredAndSortedGames.length > 0 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border-2 border-primary-200 shadow-lg mt-6">
              <p className="text-sm text-center text-primary-700 font-comic">
                Showing{" "}
                <span className="font-bold">
                  {filteredAndSortedGames.length}
                </span>{" "}
                of <span className="font-bold">{totalCourses}</span> courses for
                Grade {selectedGrade}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-primary-600 hover:text-primary-800 underline font-bold transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Create Content Modal - Placeholder */}
      {newContentType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-4 border-primary-300">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {newContentType === "course"
                  ? "📚"
                  : newContentType === "game"
                  ? "🎮"
                  : "❓"}
              </div>
              <h3 className="text-2xl font-bold font-comic text-primary-700 mb-4">
                Create New{" "}
                {newContentType.charAt(0).toUpperCase() +
                  newContentType.slice(1)}
              </h3>
              <p className="text-primary-600 font-comic mb-6">
                {newContentType === "course"
                  ? "Build an engaging educational course"
                  : newContentType === "game"
                  ? "Design a fun learning game"
                  : "Create an interactive quiz"}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setNewContentType("")}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-comic font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(
                      `Creating new ${newContentType} for Grade ${selectedGrade}!`
                    );
                    setNewContentType("");
                  }}
                  className="flex-1 bg-primary-500 text-white px-4 py-3 rounded-xl font-comic font-bold hover:bg-primary-600 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editGame && (
        <AddGameForm
          show={editGame != null}
          onClose={() => setEditGame(null)}
          course={editGame}
          isEditing={true}
        />
      )}

      <AddGameForm show={addGame} onClose={() => setAddGame(false)} />
    </div>
  );
};

export default SchoolCoursesView;
