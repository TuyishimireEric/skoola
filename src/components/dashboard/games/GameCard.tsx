import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Star,
  Clock,
  Eye,
  Edit,
  Settings,
  PlayCircle,
  Trophy,
} from "lucide-react";
import { GameDataI } from "@/types/Course";

interface CourseCardProps {
  game: GameDataI;
  index: number;
}

export const GameCardSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-4 border-primary-200 overflow-hidden">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </div>
      <div className="h-3 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="h-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 bg-gray-200 rounded-xl"></div>
        <div className="h-16 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded-xl w-24"></div>
      </div>
    </div>
  </div>
);

export const AdminGameCard: React.FC<CourseCardProps> = ({ game, index }) => {
  const getTypeInfo = (type: string | undefined) => {
    const typeMap: Record<
      string,
      { label: string; emoji: string; color: string }
    > = {
      ImageBased: {
        label: "Game",
        emoji: "🎮",
        color: "bg-green-100 text-green-800",
      },
      FillInTheBlank: {
        label: "Quiz",
        emoji: "❓",
        color: "bg-blue-100 text-blue-800",
      },
      Reading: {
        label: "Course",
        emoji: "📚",
        color: "bg-purple-100 text-purple-800",
      },
      MathEquation: {
        label: "Math",
        emoji: "🔢",
        color: "bg-orange-100 text-orange-800",
      },
      NumberSequence: {
        label: "Sequence",
        emoji: "🔢",
        color: "bg-indigo-100 text-indigo-800",
      },
      Comparison: {
        label: "Compare",
        emoji: "⚖️",
        color: "bg-pink-100 text-pink-800",
      },
      MissingNumber: {
        label: "Puzzle",
        emoji: "🧩",
        color: "bg-yellow-100 text-yellow-800",
      },
    };
    return (
      typeMap[type || ""] || {
        label: type || "Unknown",
        emoji: "📝",
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const typeInfo = getTypeInfo(game.Type);
  const rating = parseFloat(game.AverageRating || "0") || 0;
  const completionRate = parseFloat(game.CompletionRate || "0") || 0;
  const studentsAttended = parseInt(game.StudentsAttended || "0") || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border-4 border-primary-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative">
        <div
          className="h-48 relative overflow-hidden"
          style={{
            backgroundImage: `url(${game.ImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-green/50 to-transparent"></div>
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${typeInfo.color}`}
            >
              {typeInfo.emoji} {typeInfo.label}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-xs font-bold text-gray-700">
                Grade {game.Grade}
              </span>
            </div>
          </div>
          <div className="absolute z-20 -bottom-2 left-4 right-4 ">
            <h3 className="bg-gradient-to-r from-yellow-200 to-orange-200 backdrop-blur-sm px-3 py-1 rounded-full text-center shadow-lg border border-yellow-300 text-primary-600 font-comic font-bold text-xl">
              {game.Title}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-600">
                {game.Subject}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold text-gray-700">
                {rating > 0 ? rating.toFixed(1) : "New"}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {game.Description}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="bg-blue-50 rounded-xl p-2">
              <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-blue-700">
                {studentsAttended}
              </span>
              <p className="text-xs text-blue-600">Students</p>
            </div>
            <div className="bg-green-50 rounded-xl p-2">
              <Clock className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-green-700">
                {Math.round((game.Duration || 0) / 60)}m
              </span>
              <p className="text-xs text-green-600">Duration</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-2">
              <Trophy className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-purple-700">
                {completionRate.toFixed(0)}%
              </span>
              <p className="text-xs text-purple-600">Complete</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="View Course"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Edit Course"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                title="Course Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <button className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors font-comic font-bold text-sm flex items-center space-x-1">
              <PlayCircle className="w-4 h-4" />
              <span>Launch</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
