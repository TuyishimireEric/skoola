"use client";

import React from "react";
import {
  Trophy,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

interface GameOverRetryProps {
  totalMissedQuestions: number;
  correctAnswersInRetry: number;
  onPlayAgain: () => void;
  onBackToHome: () => void;
  playerName?: string;
  gameName?: string;
}

const GameOverRetry: React.FC<GameOverRetryProps> = ({
  totalMissedQuestions,
  correctAnswersInRetry,
  onPlayAgain,
  onBackToHome,
  playerName = "Champion",
  gameName = "Quiz",
}) => {
  // Calculate improvement percentage
  const improvementPercentage = Math.round(
    (correctAnswersInRetry / totalMissedQuestions) * 100
  );

  // Get congratulatory message based on performance
  const getCongratulationMessage = () => {
    if (correctAnswersInRetry === totalMissedQuestions) {
      return {
        title: "🎉 Perfect Retry!",
        message: `Incredible! You got all ${totalMissedQuestions} questions right this time!`,
        emoji: "🌟",
        color: "text-yellow-600",
      };
    } else if (improvementPercentage >= 80) {
      return {
        title: "🎊 Amazing Improvement!",
        message: `Fantastic work! You mastered ${correctAnswersInRetry} out of ${totalMissedQuestions} missed questions!`,
        emoji: "🚀",
        color: "text-green-600",
      };
    } else if (correctAnswersInRetry >= Math.ceil(totalMissedQuestions / 2)) {
      return {
        title: "👏 Great Progress!",
        message: `Well done! You got ${correctAnswersInRetry} out of ${totalMissedQuestions} questions right!`,
        emoji: "💪",
        color: "text-green-600",
      };
    } else {
      return {
        title: "🌱 Keep Growing!",
        message: `Nice effort! You improved on ${correctAnswersInRetry} out of ${totalMissedQuestions} questions!`,
        emoji: "🌟",
        color: "text-yellow-600",
      };
    }
  };

  const congratsData = getCongratulationMessage();

  // Motivational messages for different scenarios
  const getMotivationalMessage = () => {
    if (correctAnswersInRetry === totalMissedQuestions) {
      return "You've shown that practice makes perfect! Your dedication paid off beautifully.";
    } else if (improvementPercentage >= 80) {
      return "Your hard work is showing amazing results! Keep up this fantastic momentum.";
    } else if (correctAnswersInRetry >= Math.ceil(totalMissedQuestions / 2)) {
      return "Every question you master is a step forward. You're building great knowledge!";
    } else {
      return "Remember, every attempt makes you stronger. Keep practicing and you'll get there!";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/70 rounded-3xl shadow-2xl p-8 max-w-3xl w-full text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-4 left-4 text-4xl">🎯</div>
          <div className="absolute top-4 right-4 text-4xl">📚</div>
          <div className="absolute bottom-4 left-4 text-4xl">⭐</div>
          <div className="absolute bottom-4 right-4 text-4xl">🎊</div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {/* Trophy icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Congratulation title */}
          <h1 className={`text-2xl font-bold mb-3 ${congratsData.color}`}>
            {congratsData.title}
          </h1>

          {/* Player name */}
          <p className="text-lg font-semibold text-gray-700 mb-4">
            {playerName}!
          </p>

          {/* Main congratulation message */}
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl mr-2">{congratsData.emoji}</span>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-gray-800 font-medium mb-2">
              {congratsData.message}
            </p>
            <p className="text-sm text-gray-600">{getMotivationalMessage()}</p>
          </div>

          {/* Performance stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {correctAnswersInRetry}
              </div>
              <div className="text-sm text-green-700">Questions Mastered</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {improvementPercentage}%
              </div>
              <div className="text-sm text-green-700">Improvement Rate</div>
            </div>
          </div>

          {/* Achievement badge */}
          {correctAnswersInRetry === totalMissedQuestions && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-semibold">
                  Perfect Retry Achievement Unlocked!
                </span>
                <Sparkles className="w-5 h-5 text-yellow-600 ml-2" />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={onPlayAgain}
              className="w-full bg-gradient-to-r from-green-500 to-yellow-600 hover:from-green-600 hover:to-yellow-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play {gameName} Again
            </motion.button>

            <motion.button
              onClick={onBackToHome}
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </motion.button>
          </div>

          {/* Encouraging footer message */}
          <div className="mt-6 text-sm text-gray-500">
            <p>Keep practicing and learning! 🌟</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverRetry;
