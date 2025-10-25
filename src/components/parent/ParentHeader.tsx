import { ParentProfile } from "@/types/Student";
import { motion } from "framer-motion";
import ProfileImage from "../dashboard/ProfileImage";
import { Bell, Clock, Settings, Sparkles, Star } from "lucide-react";

const ParentHeader = ({
  userImage,
  userName,
  parent,
}: {
  userImage: string;
  userName: string;
  parent: ParentProfile;
}) => (
  <motion.div
    className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="relative">
      <motion.button
        className="relative w-32 h-32 border-4 border-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <ProfileImage imageUrl={userImage ?? "🦁"} />
      </motion.button>
    </div>

    <div className="flex-1 text-center md:text-left">
      <h1 className="text-3xl font-black text-gray-800 mb-2">
        Welcome back, {userName}! 👋
      </h1>
      <p className="text-orange-600 font-bold mb-4">
        Managing {parent.totalStudents} student
        {parent.totalStudents !== 1 ? "s" : ""} • Member since{" "}
        {new Date(parent.joinDate).getFullYear()}
      </p>

      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300 text-green-700 px-4 py-2 rounded-full text-sm font-bold"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-4 h-4" />
          {parent.familyStreak} day family streak
        </motion.div>
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-300 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold"
          whileHover={{ scale: 1.05 }}
        >
          <Star className="w-4 h-4" />
          {parent.totalStarsEarned} total stars
        </motion.div>
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-300 text-orange-700 px-4 py-2 rounded-full text-sm font-bold"
          whileHover={{ scale: 1.05 }}
        >
          <Clock className="w-4 h-4" />
          {parent.weeklyLearningMinutes} min this week
        </motion.div>
      </div>
    </div>

    <div className="flex gap-2">
      <motion.button
        className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 border-2 border-orange-300 rounded-xl transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-orange-600" />
      </motion.button>
      <motion.button
        className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 border-2 border-orange-300 rounded-xl transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="w-5 h-5 text-orange-600" />
      </motion.button>
    </div>
  </motion.div>
);

export default ParentHeader;
