"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Users,
  Clock,
  Target,
  GraduationCap,
  Heart,
  Medal,
} from "lucide-react";

import { useClientSession } from "@/hooks/user/useClientSession";
import { useKidsProfile } from "@/hooks/profile/useKidsProfile";
import { useRouter } from "next/navigation";
import StudentRegistrationForm from "@/components/auth/StudentRegistration";
import { useStudentAnalytics } from "@/hooks/parent/useParentDashboard";
import { AnalyticsFilter } from "@/types/dashboard";
import { KidProfileDataI, ParentProfile } from "@/types/Student";
import StudentsProgressChart from "@/components/parent/StudentsProgressChart";
import SubjectPerformanceChart from "@/components/parent/SubjectPerformance";
import ParentHeader from "@/components/parent/ParentHeader";
import StudentCard from "@/components/parent/StudentCard";
import QuickStatCard from "@/components/parent/QuickStatsCard";
import AddStudentCard from "@/components/parent/AddStudentCard";
import ChartFilters from "@/components/parent/ChartFilter";

// Main Dashboard Component
const ParentDashboard = () => {
  const { userImage, userName, userEmail, userId } = useClientSession();
  const { data, isLoading, error } = useKidsProfile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [chartFilter, setChartFilter] = useState<AnalyticsFilter>("30d");

  const students: KidProfileDataI[] = data || [];

  const { data: studentsAnalytics, isLoading: loadingAnalytics } =
    useStudentAnalytics(chartFilter);

  const parentData: ParentProfile = {
    id: userId,
    name: userName,
    email: userEmail,
    joinDate: "2023-09-15",
    totalStudents: students.length,
    weeklyLearningMinutes: students.reduce(
      (sum, s) => sum + s.weeklyCompleted * s.todayMinutes,
      0
    ),
    totalStarsEarned: students.reduce((sum, s) => sum + s.totalStars, 0),
    averageProgress: students.length
      ? Math.round(
          students.reduce((sum, s) => sum + s.progressToNextLevel, 0) /
            students.length
        )
      : 0,
    familyStreak: Math.max(...students.map((s) => s.currentStreak), 0),
    avatar: "👩🏾‍💼",
    plan: "free",
  };

  const router = useRouter();

  const handleViewDashboard = (studentId: string) => {
    router.push(`/kids?studentId=${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-orange-600 font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            😢
          </motion.div>
          <h2 className="text-2xl font-black text-gray-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-orange-600 font-bold mb-6">
            We couldn&apos;t load your dashboard. Please try again.
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-xl font-bold hover:from-orange-500 hover:to-red-500 hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again 🔄
          </motion.button>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen relative">
      {/* African Village Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 text-6xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌴
        </motion.div>
        <motion.div
          className="absolute top-40 right-40 text-5xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ☀️
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-40 text-4xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          🏛️
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-5xl"
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          🌺
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-32 relative z-10">
        {/* Parent Header */}
        <ParentHeader
          userImage={userImage}
          userName={userName}
          parent={parentData}
        />

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickStatCard
            icon={Users}
            label="ACTIVE STUDENTS"
            value={students.length}
            color="border-orange-300"
            bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          />
          <QuickStatCard
            icon={Clock}
            label="WEEKLY MINUTES"
            value={`${parentData.weeklyLearningMinutes}m`}
            color="border-green-300"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            trend={12}
          />
          <QuickStatCard
            icon={Star}
            label="STARS EARNED"
            value={parentData.totalStarsEarned}
            color="border-yellow-300"
            bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
            trend={8}
          />
          <QuickStatCard
            icon={Target}
            label="AVG. PROGRESS"
            value={`${parentData.averageProgress}%`}
            color="border-purple-300"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            trend={-3}
          />
        </motion.div>

        {/* Section Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">
              Student Profiles 🎓
            </h2>
            <p className="text-orange-600 font-bold">
              Click on a profile to view detailed progress
            </p>
          </div>
        </motion.div>

        {/* Students Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <StudentCard
                student={student}
                onViewDashboard={handleViewDashboard}
              />
            </motion.div>
          ))}

          {(students.length < 3 || students.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + students.length * 0.1 }}
            >
              <AddStudentCard onClick={() => setShowAddForm(true)} />
            </motion.div>
          )}
        </motion.div>

        {/* Empty State */}
        {students.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-6xl mb-4">🎒</div>
            <h3 className="text-xl font-black text-gray-700 mb-2">
              No students yet
            </h3>
            <p className="text-orange-600 font-bold mb-6 max-w-md mx-auto">
              Start your family&apos;s learning journey by adding your first
              student
            </p>
          </motion.div>
        )}

        {/* Family Activity Section */}
        {students.length > 0 && (
          <motion.div
            className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <motion.div
                className="absolute top-4 right-4 text-6xl"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🌟
              </motion.div>
              <motion.div
                className="absolute bottom-4 left-4 text-5xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                👨‍👩‍👧‍👦
              </motion.div>
            </div>

            <div className="text-center mb-8 relative z-10">
              <h3 className="text-2xl font-black text-gray-800 mb-2">
                Family Learning Activity 🏆
              </h3>
              <p className="text-orange-600 font-bold">
                Track your family&apos;s collective progress
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <motion.div
                className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-3xl font-black text-gray-800 mb-1">
                  {parentData.familyStreak}
                </p>
                <p className="text-sm font-bold text-red-600">
                  Day Family Streak
                </p>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <Medal className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <p className="text-3xl font-black text-gray-800 mb-1">
                  {students.reduce((sum, s) => sum + s.coursesCompleted, 0)}
                </p>
                <p className="text-sm font-bold text-yellow-600">
                  Total Courses Completed
                </p>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.05 }}
              >
                <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-3xl font-black text-gray-800 mb-1">
                  {Math.round(
                    students.reduce((sum, s) => sum + s.level, 0) /
                      students.length
                  )}
                </p>
                <p className="text-sm font-bold text-green-600">
                  Average Level
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {students.length > 0 && (
          <>
            {/* Chart Filters */}
            <motion.div
              className="text-center my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                Performance Analytics 📈
              </h2>
              <p className="text-orange-600 font-bold mb-6">
                Track your children&apos;s progress over time
              </p>
              <ChartFilters
                activeFilter={chartFilter}
                onFilterChange={setChartFilter}
              />
            </motion.div>

            <div className="space-y-8 mb-8">
              <StudentsProgressChart
                dailyProgress={studentsAnalytics?.dailyProgress ?? null}
                students={students}
                filter={chartFilter}
                isLoading={loadingAnalytics}
              />

              <SubjectPerformanceChart
                subjectPerformance={
                  studentsAnalytics?.subjectPerformance ?? null
                }
                students={students}
                filter={chartFilter}
                isLoading={loadingAnalytics}
              />
            </div>
          </>
        )}

        {/* Add Student Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={() => setShowAddForm(false)}
              />
              <motion.div
                className="relative z-10 w-full max-w-2xl"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <StudentRegistrationForm
                  onClose={() => setShowAddForm(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ParentDashboard;
