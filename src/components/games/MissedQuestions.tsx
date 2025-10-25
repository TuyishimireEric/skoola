import React, { useState } from "react";
import {
  AlertTriangle,
  RotateCcw,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useGetStudentMissedQuestions } from "@/hooks/games/useMissedQuestions";

interface MissedQuestionsProps {
  studentId: string;
  userRoleId: number;
}

const MissedQuestions = ({ studentId, userRoleId }: MissedQuestionsProps) => {
  const [selectedDateRange, setSelectedDateRange] = useState<
    "7d" | "30d" | "last_month"
  >("7d");
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    data: missedQuestions = [],
    isLoading,
    error,
  } = useGetStudentMissedQuestions(studentId, selectedDateRange);

  const totalMissedQuestions = missedQuestions.reduce(
    (total, game) => total + game.questionIds.length,
    0
  );

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "last_month":
        return "Last Month";
      default:
        return "Last 7 Days";
    }
  };

  if (error) {
    return (
      <div className="w-full mt-6 p-6 bg-red-50 rounded-3xl border-2 border-red-200">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">
            Failed to load missed questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      <div
        className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden transition-all duration-300"
        style={{
          opacity: 0,
          transform: "translateY(20px)",
          animation: "fadeInUp 0.6s ease-out 0.3s forwards",
        }}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-3 rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">
                  Practice Zone 🎯
                </h2>
                <p className="text-gray-600 text-sm">
                  {totalMissedQuestions > 0
                    ? `${totalMissedQuestions} questions to master!`
                    : "Great job! No missed questions to review."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <select
                value={selectedDateRange}
                onChange={(e) =>
                  setSelectedDateRange(
                    e.target.value as "7d" | "30d" | "last_month"
                  )
                }
                className="bg-white border-2 border-orange-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="last_month">Last Month</option>
              </select>

              {/* Collapse/Expand Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 bg-white border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                    <div className="bg-gray-200 rounded-lg h-6 mb-2"></div>
                    <div className="bg-gray-200 rounded-lg h-4 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : totalMissedQuestions === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Awesome Work!
                </h3>
                <p className="text-gray-600 mb-6">
                  No missed questions in{" "}
                  {getDateRangeLabel(selectedDateRange).toLowerCase()}. Keep up
                  the great learning!
                </p>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">
                    You&apos;re on a learning streak! 🚀
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missedQuestions.map((game, index) => (
                  <div
                    key={game.gameId}
                    className="bg-white rounded-3xl shadow-lg border-2 border-orange-200 hover:border-yellow-400 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                    style={{
                      opacity: 0,
                      transform: "translateY(20px) scale(0.9)",
                      animation: `fadeInUpScale 0.6s ease-out ${
                        0.1 + index * 0.05
                      }s forwards`,
                    }}
                  >
                    {/* Game Image */}
                    <div className="h-40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-100/30"></div>

                      {/* Missed Questions Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white">
                          <span className="text-xs font-bold">
                            {game.questionIds.length} missed
                          </span>
                        </div>
                      </div>

                      <img
                        src={game.gameImage}
                        alt={game.gameTitle}
                        className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                      />

                      {/* Practice Badge */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-gradient-to-r from-yellow-200 to-orange-200 backdrop-blur-sm px-3 py-2 rounded-full text-center shadow-lg border border-yellow-300">
                          <div className="text-xs font-bold text-orange-700">
                            🎯 Practice Time!
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Game Content */}
                    <div className="p-4 bg-gradient-to-b from-white to-orange-50/50">
                      {/* Title */}
                      <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-1">
                        {game.gameTitle}
                      </h3>

                      {/* Stats */}
                      <div className="bg-orange-50 rounded-xl p-3 mb-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-700">
                              Questions to review
                            </span>
                          </div>
                          <span className="text-lg font-bold text-orange-600">
                            {game.questionIds.length}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {userRoleId == 2 && (
                        <Link
                          href={`/games/${
                            game.gameId
                          }/retry?questions=${game.questionIds.join(",")}`}
                          className="w-full bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 text-white py-3 rounded-2xl flex items-center justify-center gap-3 font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-orange-300 hover:border-orange-400"
                        >
                          <RotateCcw className="w-5 h-5" />
                          Play Again!
                          <Target className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Stats */}
            {totalMissedQuestions > 0 && (
              <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {missedQuestions.length}
                    </div>
                    <p className="text-sm text-gray-600">Games to Practice</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="text-2xl font-bold text-red-600">
                      {totalMissedQuestions}
                    </div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {getDateRangeLabel(selectedDateRange)}
                    </div>
                    <p className="text-sm text-gray-600">Time Period</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUpScale {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MissedQuestions;
