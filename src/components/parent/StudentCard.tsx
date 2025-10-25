import { KidProfileDataI } from "@/types/Student";
import { motion } from "framer-motion";
import ProfileImage from "../dashboard/ProfileImage";
import { FaCrown } from "react-icons/fa";
import { ChevronRight, Clock, Flame, Star, Trophy } from "lucide-react";

const StudentCard = ({
  student,
  onViewDashboard,
}: {
  student: KidProfileDataI;
  onViewDashboard: (id: string) => void;
}) => {
  return (
    <>
      <motion.div
        className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 relative overflow-hidden group"
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* African pattern decorations */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <motion.div
            className="absolute top-2 right-2 text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌴
          </motion.div>
          <motion.div
            className="absolute bottom-2 left-2 text-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ☀️
          </motion.div>
        </div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg relative"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-1 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl flex items-center justify-center overflow-hidden">
                  <ProfileImage
                    imageUrl={student.imageUrl || student.avatar || "🦁"}
                    size="w-9 h-9"
                  />
                </div>
              </motion.div>

              {/* Level badge */}
              <motion.div
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-500 to-yellow-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                Lvl {student.level}
              </motion.div>

              {/* Crown decoration */}
              <motion.div
                className="absolute -top-2 -left-2 text-yellow-500"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.2, rotate: 15 }}
              >
                <FaCrown size={16} className="drop-shadow-lg" />
              </motion.div>
            </div>

            <div>
              <h3 className="font-black text-lg text-gray-800">
                {student.name}
              </h3>
              <p className="text-sm text-orange-600 font-bold">
                Age {student.age} • {student.rank}
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl">
            <Star className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-black text-gray-800">
              {student.totalStars}
            </p>
            <p className="text-xs text-yellow-600 font-bold">Stars</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl">
            <Trophy className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-black text-gray-800">
              {student.coursesCompleted}
            </p>
            <p className="text-xs text-green-600 font-bold">Courses</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl">
            <Flame className="w-4 h-4 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-black text-gray-800">
              {student.currentStreak}
            </p>
            <p className="text-xs text-orange-600 font-bold">Streak</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700">
              Level Progress
            </span>
            <span className="text-sm font-black text-orange-600">
              {student.progressToNextLevel}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 via-yellow-500 to-green-500 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${student.progressToNextLevel}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-30 rounded-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-600">
              {student.todayMinutes} min today
            </span>
          </div>
          <span className="text-xs font-bold text-yellow-700 bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1 rounded-full border border-yellow-300">
            Next: {student.nextReward}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => onViewDashboard(student.id)}
            className="flex-1 bg-gradient-to-r from-orange-400 to-red-400 text-white py-3 px-4 rounded-xl font-bold hover:from-orange-500 hover:to-red-500 transition-all shadow-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronRight className="w-4 h-4" />
            View Daily Tasks
          </motion.button>
          {/* 
          <motion.button
            onClick={() => setShowCredentialsModal(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 px-4 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-500 transition-all shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="View login credentials"
          >
            <Lock className="w-4 h-4" />
          </motion.button> */}
        </div>
      </motion.div>
    </>
  );
};

export default StudentCard;
