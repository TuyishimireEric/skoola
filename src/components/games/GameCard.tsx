import { GameDataI } from "@/types/Course";
import { motion } from "framer-motion";
import {
  Star,
  Play,
  Smile,
  Eye,
  Edit,
  Settings,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface GameCardProps {
  game: GameDataI;
  index: number;
  isAdmin?: boolean;
  setEditGame?: (game: GameDataI | null) => void;
}

const GameCard = ({
  game,
  index,
  isAdmin = false,
  setEditGame,
}: GameCardProps) => {

  const rating = parseFloat(game.AverageRating || "0") || 0;

  return (
    <>
      <motion.div
        key={game.Id}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        whileHover={{ scale: 1.05, y: -5, rotate: 1 }}
        className="relative"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-4 border-primary-200 hover:border-yellow-400 overflow-hidden transition-all duration-300 transform hover:border-primary-400">
          {/* Game Image */}
          <div className="h-52 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-100/30"></div>

            {/* Admin Type Badge */}
            {/* {isAdmin && (
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${typeInfo.color}`}
                >
                  {typeInfo.emoji} {typeInfo.label}
                </span>
              </div>
            )} */}

            {/* Grade Badge for Admin */}
            {isAdmin && game.Grade && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-gray-700">
                    P{game.Grade}
                  </span>
                </div>
              </div>
            )}

            {/* Rating for Regular Users */}
            {!isAdmin && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1 shadow-lg border border-yellow-200">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-primary-700">
                    {rating > 0 ? rating.toFixed(1) : "New"}
                  </span>
                </div>
              </div>
            )}

            <Image
              src={game.ImageUrl}
              alt={game.Title}
              fill
              className="object-cover transition-all duration-500 hover:scale-110"
            />

            {/* Subject/Title Badge */}
            <div className="absolute bottom-3 left-4 right-4">
              <div className="bg-gradient-to-r from-yellow-200 to-orange-200 backdrop-blur-sm px-3 py-2 rounded-full text-center shadow-lg border border-yellow-300">
                <div className="text-xs font-bold text-primary-700">
                  {game.Subject}
                </div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="p-4 px-6 bg-gradient-to-b from-white to-primary-50/50">
            {/* Title */}
            <div className="flex justify-between">
              <h3 className="font-bold text-xl text-primary-800 mb-2 line-clamp-1 font-comic">
                {game.Title}
              </h3>

              {/* Admin: Subject and Rating Row */}
              {isAdmin && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-gray-700">
                      {rating > 0 ? rating.toFixed(1) : "New"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-primary-600 text-sm mb-4 line-clamp-2 leading-relaxed font-comic">
              {game.Description}
            </p>

            {/* Admin Stats */}
            {/* {isAdmin && (
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
            )} */}

            {/* Action Buttons */}
            {isAdmin ? (
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View Course"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {setEditGame && (
                    <button
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Edit Course"
                      onClick={() => setEditGame(game)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Course Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  href={`/courses/${game.Id}`}
                  className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors font-comic font-bold text-sm flex items-center space-x-1"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>details</span>
                </Link>
              </div>
            ) : (
              <Link
                href={`courses/${game.Id}`}
                className="w-full bg-gradient-to-r from-yellow-400 via-primary-400 to-orange-400 hover:from-yellow-500 hover:via-primary-500 hover:to-orange-500 text-white py-3 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-comic border-2 border-yellow-300 hover:border-yellow-400"
              >
                <Play className="w-6 h-6" />
                Let&apos;s Play!
                <Smile className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default GameCard;
