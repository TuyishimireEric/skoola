import React, { useState, useMemo, useEffect } from "react";
import {
  Target,
  Calendar,
  BookOpen,
  Star,
  Clock,
  Plus,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useCreateGoal, useGoals } from "@/hooks/goals/useGoals";
import { useGames } from "@/hooks/games/useGames";
import { GoalDataI } from "@/types/Goals";
import { useSearchParams } from "next/navigation";

interface GoalCalendarProps {
  studentId: string;
}

export const GoalCalendar = ({ studentId }: GoalCalendarProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newGoalType, setNewGoalType] = useState<GoalDataI["Type"]>("custom");
  const [targetValue, setTargetValue] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");

  const searchParams = useSearchParams();

  const studentIdFromUrl = searchParams.get("studentId");

  // React Query hooks
  const { data: goals = [], isLoading: goalsLoading } = useGoals(
    currentYear,
    currentMonth,
    studentId
  );
  const { data: courses = [] } = useGames({
    page: 1,
    pageSize: 12,
    searchText: "",
  });
  const createGoalMutation = useCreateGoal(studentId);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Group goals by date
  const goalsByDate = useMemo(() => {
    const grouped: Record<string, GoalDataI[]> = {};
    goals.forEach((goal) => {
      if (!grouped[goal.DateKey]) {
        grouped[goal.DateKey] = [];
      }
      grouped[goal.DateKey].push(goal);
    });
    return grouped;
  }, [goals]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (day: number, month: number, year: number) => {
    return format(new Date(year, month, day), "yyyy-MM-dd");
  };

  const getCurrentDateGoals = () => {
    const dateKey = formatDateKey(selectedDate, currentMonth, currentYear);
    return goalsByDate[dateKey] || [];
  };

  const getDateStatus = (day: number | undefined) => {
    if (typeof day !== "number") return "none";
    const dateKey = formatDateKey(day, currentMonth, currentYear);
    const dateGoals = goalsByDate[dateKey];
    if (!dateGoals || dateGoals.length === 0) return "none";

    const completedGoals = dateGoals.filter((goal) =>
      goal.Type === "custom" ? goal.Completed : goal.calculatedCompleted
    ).length;
    const totalGoals = dateGoals.length;

    const currentDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (currentDate < todayDate) {
      return completedGoals === totalGoals ? "completed" : "partial";
    } else if (currentDate.getTime() === todayDate.getTime()) {
      return "today";
    } else {
      return "scheduled";
    }
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isPastDate = (day: number | undefined) => {
    if (typeof day !== "number") return false;
    const currentDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return currentDate < todayDate;
  };

  const toggleGoal = async (goal: GoalDataI) => {
    if (isPastDate(selectedDate) || goal.Type !== "custom") return;
  };

  const deleteGoal = async () => {};

  const addNewGoal = async () => {
    if (!newGoal.trim() || isPastDate(selectedDate)) return;

    const dateKey = formatDateKey(selectedDate, currentMonth, currentYear);

    await createGoalMutation.mutateAsync({
      name: newGoal.trim(),
      type: newGoalType,
      targetValue: targetValue ? parseInt(targetValue) : undefined,
      targetGameId: selectedGameId || undefined,
      dateKey,
    });

    // Reset form
    setNewGoal("");
    setNewGoalType("custom");
    setTargetValue("");
    setSelectedGameId("");
    setShowAddGoal(false);
  };

  const changeMonth = (direction: string) => {
    if (direction === "next") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }

    // Calculate the new month/year after change
    const newMonth =
      direction === "next"
        ? currentMonth === 11
          ? 0
          : currentMonth + 1
        : currentMonth === 0
        ? 11
        : currentMonth - 1;
    const newYear =
      direction === "next"
        ? currentMonth === 11
          ? currentYear + 1
          : currentYear
        : currentMonth === 0
        ? currentYear - 1
        : currentYear;

    // Only set to today's date if we're viewing the current month
    if (newYear === today.getFullYear() && newMonth === today.getMonth()) {
      setSelectedDate(today.getDate());
    } else {
      setSelectedDate(1);
    }
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
  };

  const getGoalIcon = (goal: GoalDataI) => {
    const isCompleted =
      goal.Type === "custom" ? goal.Completed : goal.calculatedCompleted;

    if (isCompleted) {
      return (
        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      );
    }

    switch (goal.Type) {
      case "course":
        return <BookOpen size={16} className="text-gray-500" />;
      case "study_time":
        return <Clock size={16} className="text-gray-500" />;
      case "stars":
        return <Star size={16} className="text-gray-500" />;
      default:
        return <Target size={16} className="text-gray-500" />;
    }
  };

  const getGoalProgress = (goal: GoalDataI) => {
    if (goal.Type === "study_time" && goal.TargetValue) {
      return `${goal.currentProgress || 0}/${goal.TargetValue} min`;
    }
    if (goal.Type === "stars" && goal.TargetValue) {
      return `${goal.currentProgress || 0}/${goal.TargetValue} ⭐`;
    }
    if (goal.Type === "course") {
      const course = courses.find((c) => c.Id === goal.TargetGameId);
      return course?.Title || "Course";
    }
    return null;
  };

  const getDateDisplayText = () => {
    const monthName = months[currentMonth];
    if (isToday(selectedDate)) return "Today's Goals";
    if (isPastDate(selectedDate))
      return `Goals for ${monthName} ${selectedDate}`;
    return `Plan for ${monthName} ${selectedDate}`;
  };

  const getGoalTypeLabel = (type: GoalDataI["Type"]) => {
    switch (type) {
      case "study_time":
        return "Study Time";
      case "course":
        return "Complete Course";
      case "stars":
        return "Earn Stars";
      case "custom":
        return "Custom Goal";
    }
  };

  // Set selected date to today only when first mounting and viewing current month
  useEffect(() => {
    if (
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      setSelectedDate(today.getDate());
    }
  }, []); // Only run on mount

  return (
    <>
      {/* Goals & Calendar Section */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Interactive Calendar */}
        <div className="lg:order-2 bg-gradient-to-br from-primary-50 to-pink-100 border-2 border-primary-200 rounded-3xl p-4 sm:p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 text-primary-200 opacity-30">
            <div className="text-6xl">📅</div>
          </div>

          <div className="relative z-10">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-primary-400 to-pink-500 text-white p-3 rounded-xl">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">
                    Learning Calendar
                  </h3>
                  <p className="text-xs text-primary-600 font-medium">
                    Powered by Ganzaa.org
                  </p>
                </div>
              </div>
            </div>

            {/* Month/Year Controls */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 shadow-sm">
              <button
                onClick={() => changeMonth("prev")}
                className="bg-gradient-to-r from-primary-400 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg hover:scale-110 transition-transform"
              >
                ‹
              </button>

              <div className="text-center">
                <div className="text-lg font-black text-gray-800">
                  {months[currentMonth]} {currentYear}
                </div>
                <div className="text-xs text-primary-600 font-bold">
                  Tap dates to plan your learning!
                </div>
              </div>

              <button
                onClick={() => changeMonth("next")}
                className="bg-gradient-to-r from-primary-400 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg hover:scale-110 transition-transform"
              >
                ›
              </button>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-gray-600 p-1"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty cells */}
              {Array.from(
                { length: getFirstDayOfMonth(currentMonth, currentYear) },
                (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                )
              )}

              {/* Month days */}
              {Array.from(
                { length: getDaysInMonth(currentMonth, currentYear) },
                (_, i) => i + 1
              ).map((day) => {
                const status = getDateStatus(day);
                const isSelected = day === selectedDate;
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square text-sm font-bold rounded-lg p-1 transition-all transform hover:scale-105 ${
                      isSelected ? "ring-2 ring-orange-400 ring-offset-1" : ""
                    } ${
                      isTodayDate
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                        : status === "completed"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
                        : status === "partial"
                        ? "bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-md"
                        : status === "scheduled"
                        ? "bg-gradient-to-r from-white to-primary-50 text-primary-600 shadow-md"
                        : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                    }`}
                  >
                    {day}
                    {status !== "none" && (
                      <div className="w-2 h-2 bg-yellow-300 rounded-full mx-auto mt-1"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-xl p-3 shadow-sm">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  <span className="font-bold text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full"></div>
                  <span className="font-bold text-gray-600">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                  <span className="font-bold text-gray-600">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                  <span className="font-bold text-gray-600">Partial</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Goals Section */}
        <div className="lg:order-1 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-3xl p-4 sm:p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute bottom-0 left-0 text-green-200 opacity-30">
            <div className="text-6xl">🌱</div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-3 rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  {getDateDisplayText()}
                </h3>
                <p className="text-green-600 font-bold text-sm">
                  {isToday(selectedDate)
                    ? "Keep growing! 🌱"
                    : isPastDate(selectedDate)
                    ? "Review your progress 📊"
                    : "Plan your learning! 📝"}
                </p>
              </div>
            </div>

            {/* Goals Content with Loading State */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {goalsLoading ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center mb-3">
                    <Loader2
                      className="animate-spin text-green-500"
                      size={32}
                    />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Loading your goals...
                  </p>
                </div>
              ) : getCurrentDateGoals().length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">
                    {!isPastDate(selectedDate) ? "📝" : "✨"}
                  </div>
                  <p className="text-gray-600 font-medium">
                    {!isPastDate(selectedDate)
                      ? "No goals set for this date yet!"
                      : "No goals were set for this date."}
                  </p>
                  {!isPastDate(selectedDate) && (
                    <button
                      onClick={() => setShowAddGoal(true)}
                      className="mt-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                    >
                      {studentIdFromUrl
                        ? " Add Your student Goal! 🎯"
                        : " Add Your First Goal! 🎯"}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {getCurrentDateGoals().map((goal) => {
                    const isCompleted =
                      goal.Type === "custom"
                        ? goal.Completed
                        : goal.calculatedCompleted;

                    return (
                      <div
                        key={goal.Id}
                        className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleGoal(goal)}
                            disabled={
                              isPastDate(selectedDate) || goal.Type !== "custom"
                            }
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              isPastDate(selectedDate) || goal.Type !== "custom"
                                ? "cursor-default"
                                : "cursor-pointer hover:scale-110"
                            }`}
                          >
                            {getGoalIcon(goal)}
                          </button>
                          <div className="flex-1">
                            <span
                              className={`text-sm font-bold block ${
                                isCompleted
                                  ? "text-green-600 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              {goal.Name}
                            </span>
                            {goal.Type !== "custom" && (
                              <span className="text-xs text-gray-500">
                                Auto-tracked from your activities
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              isCompleted ? "text-green-600" : "text-gray-600"
                            }`}
                          >
                            {isCompleted
                              ? "Done! 🎉"
                              : getGoalProgress(goal) || "⏳"}
                          </span>
                          {!isPastDate(selectedDate) && (
                            <button
                              onClick={() => deleteGoal()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Goal Button */}
                  {!isPastDate(selectedDate) && (
                    <button
                      onClick={() => setShowAddGoal(true)}
                      className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add New Goal
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Progress Summary for Today */}
            {isToday(selectedDate) && getCurrentDateGoals().length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="text-xs text-gray-600 font-medium">
                  Progress auto-updates as you complete activities on Ganzaa.org
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">
                  Add New Goal
                </h3>
                <p className="text-gray-600 font-medium">
                  {isToday(selectedDate)
                    ? "What do you want to achieve today?"
                    : `Plan for ${months[currentMonth]} ${selectedDate}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setNewGoal("");
                  setNewGoalType("custom");
                  setTargetValue("");
                  setSelectedGameId("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Goal Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Goal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["custom", "study_time", "course", "stars"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setNewGoalType(type);
                          // Reset fields when changing type
                          setTargetValue("");
                          setSelectedGameId("");
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          newGoalType === type
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {getGoalTypeLabel(type)}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newGoalType === "custom" &&
                    "You'll mark this as complete manually"}
                  {newGoalType === "study_time" &&
                    "Auto-tracks your study time on Ganzaa"}
                  {newGoalType === "course" &&
                    "Auto-completes when you finish the course"}
                  {newGoalType === "stars" &&
                    "Auto-tracks stars earned from activities"}
                </p>
              </div>

              {/* Goal Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder={
                    newGoalType === "study_time"
                      ? "Study for X minutes"
                      : newGoalType === "course"
                      ? "Complete course Y"
                      : newGoalType === "stars"
                      ? "Earn X stars"
                      : "Enter your goal..."
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 focus:border-green-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Additional fields based on goal type */}
              {newGoalType === "study_time" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Target Minutes
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g., 30"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 focus:border-green-400 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {newGoalType === "stars" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Target Stars
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g., 20"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 focus:border-green-400 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {newGoalType === "course" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.Id} value={course.Id}>
                        {course.Title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={addNewGoal}
                  disabled={
                    !newGoal.trim() ||
                    createGoalMutation.isPending ||
                    (newGoalType === "course" && !selectedGameId) ||
                    ((newGoalType === "study_time" ||
                      newGoalType === "stars") &&
                      !targetValue)
                  }
                  className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {createGoalMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Adding...
                    </>
                  ) : (
                    "Add Goal! 🚀"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setNewGoal("");
                    setNewGoalType("custom");
                    setTargetValue("");
                    setSelectedGameId("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-black hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
