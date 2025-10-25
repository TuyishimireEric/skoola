import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowBigLeft, Check, X, RotateCw } from "lucide-react";
import { speak } from "@/utils/Audio";

interface MissingNumbersInstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

// Vibrant color palette with gradients for number cards
const colorPalette = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-orange-400 to-orange-600",
];

const MissingNumbersInstructions: React.FC<MissingNumbersInstructionsProps> = ({
  onStart,
  onBack,
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [userInputs, setUserInputs] = useState<(string | null)[]>([null, null]);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "correct" | "incorrect" | "instruction"
  >("instruction");

  // Container reference
  const containerRef = useRef<HTMLDivElement>(null);

  // Example sequence with missing numbers
  const exampleSequence = [2, null, 6, 8, null];
  const correctAnswers = [4, 10];

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;

    if (countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // When countdown reaches 0, start the game
      setShowCountdown(false);
      onStart();
    }
  }, [countdownValue, showCountdown, onStart]);

  // Event handlers
  const handleStartClick = () => {
    setShowCountdown(true);
    setCountdownValue(3);
    speak("counter");
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers and limit to 3 digits
    if (/^\d{0,3}$/.test(value)) {
      const newInputs = [...userInputs];
      newInputs[index] = value;
      setUserInputs(newInputs);
      setFeedbackStatus("instruction");
    }
  };

  const handleInputBlur = (index: number) => {
    if (userInputs[index] === null || userInputs[index] === "") {
      return;
    }

    // Check if correct answer
    if (userInputs[index] === correctAnswers[index].toString()) {
      setFeedbackStatus("correct");
    } else {
      setFeedbackStatus("incorrect");
    }
  };

  const resetDemo = () => {
    setUserInputs([null, null]);
    setFeedbackStatus("instruction");
  };

  return (
    <div
      ref={containerRef}
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-4 md:p-8 w-full h-full font-comic overflow-y-auto"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <div className="absolute inset-0 z-50 text-white text-9xl font-bold bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div
              key={countdownValue}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {countdownValue === 0 ? "GO!" : countdownValue}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full gap-3 md:gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-4xl font-bold text-primary-500 mb-2">
              Missing Numbers!
            </h2>
          </div>
        </motion.div>

        {/* Main example card */}
        <div className="bg-white p-6 md:p-6 rounded-3xl shadow-lg max-w-3xl w-full">
          <div className="p-4 bg-primary-100 md:p-4 rounded-2xl flex flex-col items-center justify-center relative">
            <p className="mb-4 text-lg text-primary-600 font-semibold flex items-center gap-2">
              Find the missing numbers in the sequence!
            </p>

            <button
              onClick={resetDemo}
              className="absolute top-2 right-2 p-2 bg-primary-200 text-primary-600 rounded-lg hover:bg-primary-300 transition-all flex items-center gap-1"
              title="Reset Demo"
            >
              <RotateCw size={18} />
              <span className="text-sm">Reset</span>
            </button>

            <div className="w-full flex justify-center mb-2">
              <div className="w-full h-full p-4 flex flex-wrap justify-center items-center gap-6">
                {exampleSequence.map((value, index) => {
                  const colorClass = colorPalette[index % colorPalette.length];
                  const isFirstMissing = index === 1;
                  const isLastMissing = index === 4;
                  const isUserInput = isFirstMissing || isLastMissing;

                  const inputIndex = isFirstMissing ? 0 : 1;
                  const inputValue = userInputs[inputIndex];

                  return (
                    <div key={index} className="relative">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{
                          scale: [
                            isUserInput && inputValue !== null ? 0.9 : 1,
                            isUserInput && inputValue !== null ? 1.1 : 1,
                            isUserInput && inputValue !== null ? 1 : 1,
                          ],
                        }}
                        transition={{
                          duration:
                            isUserInput && inputValue !== null ? 0.5 : 0,
                        }}
                      >
                        <div
                          className={`${
                            isUserInput ? "bg-gray-100" : colorClass
                          } text-white shadow-lg border-4 ${
                            isUserInput
                              ? "border-dashed border-gray-400"
                              : "border-white"
                          } rounded-2xl w-24 h-24 flex items-center justify-center relative`}
                        >
                          {isUserInput ? (
                            <input
                              type="text"
                              className="w-16 h-16 text-5xl font-bold text-center bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                              value={inputValue || ""}
                              onChange={(e) =>
                                handleInputChange(inputIndex, e.target.value)
                              }
                              onBlur={() => handleInputBlur(inputIndex)}
                              maxLength={3}
                              placeholder="?"
                            />
                          ) : (
                            <span className="text-5xl font-bold">{value}</span>
                          )}
                          <div
                            className={`absolute top-0 left-0 right-0 bottom-0 ${
                              isUserInput ? "" : "bg-white opacity-20"
                            } rounded-2xl pointer-events-none`}
                          ></div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback area */}
            <AnimatePresence mode="wait">
              {feedbackStatus === "instruction" && (
                <motion.div
                  key="instruction"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-primary-600 font-medium text-center py-3">
                    Look for the pattern and fill in the missing numbers
                  </p>
                </motion.div>
              )}

              {feedbackStatus === "correct" && (
                <motion.div
                  key="correct"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg py-3">
                    <Check size={24} />
                    <span>Correct! This is a +2 pattern sequence.</span>
                  </div>
                </motion.div>
              )}

              {feedbackStatus === "incorrect" && (
                <motion.div
                  key="incorrect"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-red-500 font-bold text-lg py-3">
                    <X size={24} />
                    <span>Try again! Look for the pattern.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center flex">
          <button
            onClick={onBack}
            className="bg-primary-200 text-primary-600 text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3 mr-4"
          >
            <ArrowBigLeft size={28} />
            Back
          </button>
          <button
            onClick={handleStartClick}
            className="bg-primary-400 text-white text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3"
          >
            <Play size={28} />
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissingNumbersInstructions;
