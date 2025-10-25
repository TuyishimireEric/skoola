import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  Edit,
  Globe,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import ProfileImage from "../dashboard/ProfileImage";
import { GameDataI } from "@/types/Course";

interface adminStatsI {
  completionRate: number;
  averageRating: number;
  totalStudents: number;
  activeStudents: number;
  passRate: number;
  avgSessionTime: number;
}

export const AdminStats = ({
  game,
  adminStats,
  handleEditGame,
  handleAdminQuestions,
}: {
  game: GameDataI;
  adminStats: adminStatsI;
  handleEditGame: () => void;
  handleAdminQuestions: () => void;
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Admin Stats Overview */}
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-200"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 size={28} />
            Game Analytics
          </h2>
          <p className="text-blue-100 mt-2">Performance Overview</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Completion Rate Pie Chart */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Completion Rate
            </h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray={`${adminStats.completionRate}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {adminStats.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Incomplete</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-center">
              <Users className="mx-auto text-green-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">
                {adminStats.totalStudents}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-2xl text-center">
              <Users className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">
                {adminStats.activeStudents}
              </p>
              <p className="text-sm text-gray-600">Active Students</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-2xl text-center">
              <Star className="mx-auto text-yellow-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">
                {adminStats.averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl text-center">
              <Award className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">
                {adminStats.passRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Pass Rate</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="text-gray-600" size={20} />
                <span className="font-medium text-gray-700">
                  Avg Session Time
                </span>
              </div>
              <span className="font-bold text-gray-800">
                {adminStats.avgSessionTime} min
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-gray-600" size={20} />
                <span className="font-medium text-gray-700">Engagement</span>
              </div>
              <span className="font-bold text-green-600">High</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe className="text-gray-600" size={20} />
                <span className="font-medium text-gray-700">Language</span>
              </div>
              <span className="font-bold text-gray-800">
                {game.Language || "English"}
              </span>
            </div>

            {game.StartDate && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-600" size={20} />
                  <span className="font-medium text-gray-700">Start Date</span>
                </div>
                <span className="font-bold text-gray-800">
                  {new Date(game.StartDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Game Moderator Info */}
      {game.GameModerator && (
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-green-200"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users size={24} />
              Game Moderator
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              {game.GameModerator.Image ? (
                <div className="relative w-12 h-12 bg-white border-4 border-green-400 via-green-500 to-green-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group">
                  <ProfileImage
                    imageUrl={game.GameModerator.Image ?? ""}
                    size="w-11 h-11"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  {game.GameModerator.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {game.GameModerator.fullName}
                </h3>
                <p className="text-gray-600">Course Moderator</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-200"
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Quick Actions
          </h2>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={handleEditGame}
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            <Edit size={20} />
            Edit Game Details
          </button>

          <button
            onClick={handleAdminQuestions}
            className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 p-3 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            <Settings size={20} />
            Manage Questions
          </button>

          <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 p-3 rounded-xl font-bold transition-colors flex items-center gap-2">
            <BarChart3 size={20} />
            View Detailed Analytics
          </button>

          <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-3 rounded-xl font-bold transition-colors flex items-center gap-2">
            <Users size={20} />
            Manage Students
          </button>
        </div>
      </motion.section>
    </div>
  );
};
