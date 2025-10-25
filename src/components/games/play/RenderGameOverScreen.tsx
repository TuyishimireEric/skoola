import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, RefreshCw, LogIn } from "lucide-react";
import { GameDataI } from "@/types/Course";
import { BiSolidBadgeCheck } from "react-icons/bi";
import { useQueryClient } from "@tanstack/react-query";
import StarRating from "@/components/stars/StarRating";

export interface GameSession {
  score: number;
  missedQuestions: string;
  startedOn: string;
  completedOn: string;
  isAnonymous: boolean;
}

interface RenderGameOverScreenProps {
  missedWords?: string[];
  course: GameDataI;
  score: number;
  onBack: () => void;
  onPlayAgain: () => void;
  onLoginPrompt: () => void;
  isAuthenticated: boolean;
  gameSession: GameSession;
}

const GameOverScreen = ({
  missedWords,
  course,
  score,
  onBack,
  onPlayAgain,
  onLoginPrompt,
  isAuthenticated,
}: RenderGameOverScreenProps) => {
  const passScore = course.PassScore ?? 50;
  const isPassed = score > passScore;
  const percentage = score;
  
  const queryClient = useQueryClient();
  const handleNextLevel = () => {
    queryClient.invalidateQueries({
      queryKey: ["dashboard"],
    });
    onBack();
  };

  return (
    <div className="min-h-screen h-full relative z-50  font-comic">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="gameover"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl xs:rounded-3xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto"
          >
            {/* Clean Game Over Card */}
            <div className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl xs:rounded-2xl">
              {/* Subtle decorative corner */}
              <div className="absolute top-0 right-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-20 -mr-8 sm:-mr-10 lg:-mr-12 -mt-8 sm:-mt-10 lg:-mt-12"></div>

              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
              >
                <div className="w-full flex justify-center mb-3 sm:mb-4 lg:mb-6">
                  {isPassed ? (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 2 }}
                    >
                      <BiSolidBadgeCheck className="w-16 sm:w-20 lg:w-24 xl:w-32 h-16 sm:h-20 lg:h-24 xl:h-32 text-green-600 drop-shadow-2xl" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5 }}
                    >
                      <Sparkles className="w-16 sm:w-20 lg:w-24 xl:w-32 h-16 sm:h-20 lg:h-24 xl:h-32 text-orange-500 drop-shadow-2xl" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <div className="text-center relative z-10">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-800 mb-3 sm:mb-4">
                    Score: {Number(percentage).toFixed(0)}%
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <StarRating score={Number(percentage)} />
                  </div>

                  {/* Clean Anonymous User Prompt */}
                  {!isAuthenticated && (
                    <motion.div
                      className="mt-3 sm:mt-4 p-4 sm:p-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl sm:rounded-2xl border-2 border-orange-300 shadow-xl"
                      animate={{
                        borderColor: [
                          "rgb(253 186 116)",
                          "rgb(251 146 60)",
                          "rgb(253 186 116)",
                        ],
                      }}
                      transition={{ duration: 2 }}
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        <span className="font-bold text-base sm:text-lg lg:text-xl text-orange-700">
                          Playing as Guest
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm lg:text-base text-orange-700 mb-3 sm:mb-4 leading-relaxed">
                        Join the Ganzaa Village to save your progress and
                        compete with other learners!
                      </p>
                      <motion.button
                        onClick={onLoginPrompt}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm lg:text-base font-bold hover:brightness-110 transition-all shadow-lg"
                      >
                        Join Ganzaa Village
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>

                {/* Clean Missed Words Section */}
                {missedWords && missedWords.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl sm:rounded-2xl border-2 border-red-300 shadow-lg"
                  >
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-red-700 mb-3 sm:mb-4 text-center">
                      Words to Practice More:
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {missedWords.map((word, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm lg:text-base font-bold border-2 border-red-300 shadow-md hover:shadow-lg transition-all"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Clean Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4"
                >
                  {/* Play Again Button */}
                  <motion.button
                    onClick={onPlayAgain}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-green-700 text-white text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 lg:py-4 px-5 sm:px-6 lg:px-8 rounded-full transition-all shadow-xl hover:brightness-110 font-bold w-full sm:w-auto"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    Play Again
                  </motion.button>

                  {/* Continue/Back Button */}
                  {isPassed ? (
                    <motion.button
                      onClick={handleNextLevel}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 lg:py-4 px-5 sm:px-6 lg:px-8 rounded-full transition-all shadow-xl hover:brightness-110 font-bold w-full sm:w-auto"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={onBack}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm sm:text-base lg:text-lg py-2.5 sm:py-3 lg:py-4 px-5 sm:px-6 lg:px-8 rounded-full transition-all shadow-xl hover:brightness-110 font-bold w-full sm:w-auto"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rotate-180" />
                      Go Back
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameOverScreen;
