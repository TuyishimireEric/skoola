"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Medal, Flame, TrendingUp } from "lucide-react";
import { FaCrown } from "react-icons/fa";
import { useKidProfile } from "@/hooks/profile/useKidProfile";
import KidsProfileSkeleton from "./KidsProfileSkeleton";
import { useSearchParams } from "next/navigation";
import ProfileImage from "./ProfileImage";

interface KidsProfileProps {
  userId: string;
}

const KidsProfile: React.FC<KidsProfileProps> = ({ userId }) => {
  const { data: kidData, isLoading } = useKidProfile(userId);

  const searchParams = useSearchParams();

  const studentIdFromUrl = searchParams.get("studentId");

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Loading state with skeleton
  if (isLoading) {
    return <KidsProfileSkeleton />;
  }

  // Error state
  if (!isLoading && !kidData) {
    return (
      <motion.div
        className="rounded-3xl p-4 sm:p-6 relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              😔
            </motion.div>
            <p className="text-lg font-bold text-gray-600 mb-2">
              Oops! Something went wrong
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {"Could not load profile data"}
            </p>
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-2 rounded-full font-bold hover:from-orange-500 hover:to-red-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again 🔄
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="rounded-3xl relative h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* African Village Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <motion.div
            className="absolute top-10 left-10 text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌴
          </motion.div>
          <motion.div
            className="absolute top-20 right-20 text-5xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ☀️
          </motion.div>
          <motion.div
            className="absolute bottom-20 left-20 text-4xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🏛️
          </motion.div>
          <motion.div
            className="absolute bottom-10 right-10 text-5xl"
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            🌺
          </motion.div>
        </div>

        {/* Enhanced Profile Header */}
        <motion.div
          className="text-center my-6 relative z-10"
          variants={itemVariants}
        >
          <motion.div
            className="relative inline-block mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              {/* Decorative African pattern border */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-60"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative">
                <motion.button
                  className="relative w-32 h-32 border-4 border-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ProfileImage imageUrl={kidData?.imageUrl ?? "🦁"} />
                </motion.button>
              </div>
            </div>

            {/* Level Badge */}
            <motion.div
              className="absolute bottom-0 right-0 bg-gradient-to-r from-green-500 to-yellow-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-base sm:text-lg shadow-lg border-3 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              whileHover={{ scale: 1.2 }}
            >
              {kidData?.level}
            </motion.div>

            {/* Crown */}
            <motion.div
              className="absolute -top-4 -left-4 text-yellow-500"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.2, rotate: 15 }}
            >
              <FaCrown size={32} className="drop-shadow-lg" />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-2xl sm:text-3xl font-black text-gray-800 mb-2"
            variants={itemVariants}
          >
            {studentIdFromUrl ? "" : "Hi,"}
            {kidData?.name.split(" ")[0]}! 👋
          </motion.h2>
          <motion.p
            className="text-orange-600 font-bold text-sm sm:text-base mb-2"
            variants={itemVariants}
          >
            Age {kidData?.age} • Level {kidData?.level} Explorer
          </motion.p>
          <motion.div
            className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-full px-4 py-2 inline-block"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-green-700 font-bold text-xs sm:text-sm">
              🚀 {kidData?.todayMinutes} minutes today!
            </span>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          variants={containerVariants}
        >
          {[
            {
              icon: Star,
              color: "yellow",
              label: "STARS",
              value: kidData?.totalStars || 0,
              subtitle: "Keep it up! ⭐",
            },
            {
              icon: Trophy,
              color: "green",
              label: "COURSES",
              value: kidData?.coursesCompleted || 0,
              subtitle: `${kidData?.weeklyCompleted} this week! 🎯`,
            },
            {
              icon: Flame,
              color: "orange",
              label: "STREAK",
              value: kidData?.currentStreak,
              subtitle: "days! 🔥",
            },
            {
              icon: Medal,
              color: "pink",
              label: "Class Rank",
              value: kidData?.rank,
              subtitle: "",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-2 border-${stat.color}-300 rounded-2xl p-2 sm:p-2 text-center relative overflow-hidden`}
            >
              <div
                className={`absolute top-0 right-0 text-${stat.color}-200 opacity-50`}
              >
                <stat.icon
                  size={40}
                  className={`text-${stat.color}-600 opacity-10`}
                />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon
                    className={`text-${stat.color}-600 mr-1`}
                    size={18}
                  />
                  <span className={`text-xs font-black text-${stat.color}-700`}>
                    {stat.label}
                  </span>
                </div>
                <motion.div
                  className={`font-black text-2xl sm:text-3xl text-${stat.color}-800`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <div
                  className={`text-xs text-${stat.color}-600 font-bold mt-1`}
                >
                  {stat.subtitle}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Level Progress */}
        <motion.div
          className=" bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-orange-200"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="text-orange-600" size={18} />
              </motion.div>
              <span className="text-sm font-black text-gray-700">
                Level Progress
              </span>
            </div>
            <motion.div
              className="bg-gradient-to-r from-green-500 to-yellow-500 text-white px-3 py-1 rounded-full"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-sm font-black">
                {kidData?.progressToNextLevel}%
              </span>
            </motion.div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-red-400 via-yellow-500 to-green-500 h-6 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${kidData?.progressToNextLevel}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-30 rounded-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <motion.p
            className="text-xs text-gray-600 font-bold text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {100 - (kidData?.progressToNextLevel ?? 0)}% to Level{" "}
            {(kidData?.level ?? 0) + 1}! 🚀
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default KidsProfile;
