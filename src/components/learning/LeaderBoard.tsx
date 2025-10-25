import { GameDataI } from "@/types/Course";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Trophy,
  RefreshCw,
  Crown,
  Medal,
  Award,
  Calendar,
  Clock,
  Infinity,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useClientSession } from "@/hooks/user/useClientSession";
import { useLeaderBoard } from "@/hooks/courses/useLeaderboard";

type TimeFilter = "today" | "week" | "alltime";

interface LeaderBoardProps {
  course: GameDataI;
  onBack?: () => void;
  onPlayAgain?: () => void;
}

const LeaderBoard = ({ course, onBack, onPlayAgain }: LeaderBoardProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("alltime");

  const { userId } = useClientSession();
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useLeaderBoard(
    {
      GameId: course.Id ?? "",
      range: timeFilter,
    }
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <motion.div
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2 }}
          >
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-500 drop-shadow-lg" />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5 }}
          >
            <Medal className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400 drop-shadow-lg" />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            className="relative"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2.5 }}
          >
            <Award className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-600 drop-shadow-lg" />
          </motion.div>
        );
      default:
        return (
          <motion.div
            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-base lg:text-xl font-bold text-white bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            {rank}
          </motion.div>
        );
    }
  };

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 90) return "text-green-600";
    if (scoreValue >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filterButtons = [
    { id: "today", label: "Today", icon: Clock },
    { id: "week", label: "This Week", icon: Calendar },
    { id: "alltime", label: "All Time", icon: Infinity },
  ];
  return (
    <motion.div
      key="leaderboard"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white bg-opacity-95 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl xs:rounded-3xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto"
    >
      {/* Clean Leaderboard Card */}
      <div className="p-2 xs:p-3 sm:p-4 md:p-6 justify-center lg:p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl xs:rounded-2xl">
        {" "}
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-20 -mr-10 sm:-mr-12 -mt-10 sm:-mt-12"></div>
        <div className="text-center mb-4 sm:mb-4 lg:mb-6 relative z-10">
          <motion.div
            className="flex items-center justify-center gap-2 sm:gap-4 mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2 }}
          >
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-yellow-500 drop-shadow-lg" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-800">
              Game Champions
            </h2>
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-yellow-500 drop-shadow-lg" />
          </motion.div>
          <motion.p
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-orange-600 font-bold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2 }}
          >
            {course.Title} - Top Learners
          </motion.p>
        </div>
        {/* Filter Buttons */}
        <div className=" flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {filterButtons.map((filter) => {
            const Icon = filter.icon;
            return (
              <motion.button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id as TimeFilter)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm lg:text-base font-bold transition-all ${
                  timeFilter === filter.id
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                {filter.label}
              </motion.button>
            );
          })}
        </div>
        {isLoadingLeaderboard ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <motion.div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-2 sm:space-y-2 py-2 lg:space-y-2">
              {leaderboard?.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`flex cursor-pointer items-center justify-between p-3 sm:p-4 lg:p-4 rounded-xl sm:rounded-2xl border-2 transition-all relative overflow-hidden ${
                    entry.id === userId
                      ? "bg-gradient-to-r from-green-100 to-yellow-100 border-green-400 shadow-xl"
                      : index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
                      : "bg-white/30 border-yellow-200 shadow-md hover:shadow-lg"
                  }`}
                >
                  {/* Rank background effect for top 3 */}
                  {index < 3 && entry.id !== userId && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 animate-pulse"></div>
                  )}

                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 relative z-10 flex-1">
                    <div className="flex-shrink-0">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* Profile Picture */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={entry.profilePicture}
                        alt={entry.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-white shadow-md"
                      />
                      {entry.id === userId && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-bold text-sm sm:text-base lg:text-lg xl:text-xl ${
                          entry.id === userId
                            ? "text-green-700"
                            : index < 3
                            ? "text-orange-700"
                            : "text-gray-800"
                        }`}
                      >
                        {entry.name}
                        {entry.id === userId && (
                          <motion.span
                            className="ml-2 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold inline-block"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                              duration: 1.5,
                            }}
                          >
                            YOU
                          </motion.span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-xs sm:text-sm text-gray-600 mt-0.5">
                        <span>
                          {entry.gamesPlayed} games •{" "}
                          {Number(entry.averageScore).toFixed(2)} %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl relative z-10 ${getScoreColor(
                        entry.totalPoints
                      )}`}
                    >
                      {entry.totalPoints}⭐
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.completedOn).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // Empty state - friendly message for kids
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
              }}
              className="mb-4 sm:mb-6"
            >
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-yellow-400 drop-shadow-lg" />
            </motion.div>

            <motion.h3
              animate={{ opacity: [0.8, 1, 0.8] }}
               transition={{ duration: 3}}
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-2 sm:mb-3"
            >
              No Champions Yet! 🎯
            </motion.h3>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 max-w-sm">
              Be the first awesome learner to play and claim your spot on the
              leaderboard!
            </p>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="flex gap-2 text-2xl sm:text-3xl"
            >
              🎮 🌟 🏆
            </motion.div>

            <p className="text-xs sm:text-sm text-orange-500 mt-3 sm:mt-4 font-medium">
              Start playing to see your name here! ✨
            </p>
          </motion.div>
        )}
        {/* Clean Back to Results Button */}
        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          {onBack && (
            <motion.button
              onClick={() => onBack()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 lg:py-4 px-5 sm:px-6 lg:px-8 rounded-full transition-all shadow-xl hover:brightness-110 font-bold w-full sm:w-auto"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rotate-180" />
              Back to Results
            </motion.button>
          )}
          {onPlayAgain && (
            <motion.button
              onClick={onPlayAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-green-700 text-white text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 lg:py-4 px-5 sm:px-6 lg:px-8 rounded-full transition-all shadow-xl hover:brightness-110 font-bold w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              Play Again
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderBoard;
