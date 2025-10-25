import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, X, ArrowBigLeft } from "lucide-react";

interface InstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

const MathInstructions = ({ onStart, onBack }: InstructionsProps) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [autoPlay, setAutoPlay] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  const examples = [
    {
      beforeInput: "5+3=",
      afterInput: "",
      answer: 8,
      explanation: "5 plus 3 equals 8",
      placeholder: "?",
    },
    {
      beforeInput: "7+",
      afterInput: "=10",
      answer: 3,
      explanation: "7 plus 3 equals 10",
      placeholder: "?",
    },
    {
      beforeInput: "",
      afterInput: "-4=5",
      answer: 9,
      explanation: "9 minus 4 equals 5",
      placeholder: "?",
    },
  ];

  useEffect(() => {
    setAnimationStep(0);
    setUserAnswer("");
  }, [currentExample]);

  useEffect(() => {
    if (!autoPlay) return;

    if (animationStep === 0) {
      const timer = setTimeout(() => {
        setAnimationStep(1);
        setUserAnswer(examples[currentExample].answer.toString());
      }, 2000);
      return () => clearTimeout(timer);
    } else if (animationStep === 1) {
      const timer = setTimeout(() => {
        setAnimationStep(2);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (animationStep === 2) {
      const timer = setTimeout(() => {
        if (currentExample < examples.length - 1) {
          setCurrentExample(currentExample + 1);
        } else if (autoPlay) {
          setCurrentExample(0);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [animationStep, currentExample, autoPlay, examples]);

  useEffect(() => {
    if (!showCountdown) return;

    if (countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setShowCountdown(false);
        onStart();
      }, 500);
    }
  }, [countdownValue, showCountdown, onStart]);

  const goToExample = (index: number) => {
    setAutoPlay(false);
    setCurrentExample(index);
  };

  const handleAnswerSubmit = () => {
    setAutoPlay(false);
    const isCorrect =
      userAnswer && parseInt(userAnswer) === examples[currentExample].answer;

    if (isCorrect) {
      setAnimationStep(2);
    } else {
      setAnimationStep(1.5);
    }
  };

  const handleStartClick = () => {
    setShowCountdown(true);
    setCountdownValue(3);
  };

  return (
    <div className="relative w-full min-h-screen max-h-screen overflow-hidden font-comic flex flex-col">
      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          >
            <motion.div
              key={countdownValue}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
              style={{
                textShadow: "0 0 50px rgba(255, 215, 0, 0.8)",
              }}
            >
              {countdownValue === 0 ? "GO!" : countdownValue}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 md:p-8 relative z-10 overflow-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-primary-600 text-center drop-shadow-lg mb-3 xs:mb-4 sm:mb-6"
        >
          Let&apos;s Solve Math Problems!
          <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-primary-400 mt-1 xs:mt-2">
            Learn with Ganzaa Adventures
          </div>
        </motion.div>

        {/* Main example card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white bg-opacity-95 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl xs:rounded-3xl w-full max-w-3xl sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
        >
          <div className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl xs:rounded-2xl">
            <div className="flex flex-col gap-2 xs:gap-3 sm:gap-5 mb-2 xs:mb-3 sm:mb-8">
              {/* Example tabs */}
              <div className="flex justify-center flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
                {examples.map((_, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goToExample(index)}
                    className={`px-2 py-1 xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md xs:rounded-lg cursor-pointer font-bold text-xs xs:text-sm md:text-base transition-all ${
                      currentExample === index
                        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                        : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-md"
                    }`}
                  >
                    Example {index + 1}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Example content - Whiteboard style */}
            <div
              className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 mb-2 xs:mb-3 sm:mb-4"
              style={{
                background: "linear-gradient(135deg, #FFFEF7 0%, #F5F5DC 100%)",
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  key={currentExample}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-center"
                >
                  <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-gray-800 flex items-center flex-wrap justify-center">
                    <span>{examples[currentExample].beforeInput}</span>
                    <motion.input
                      animate={{ scale: userAnswer ? 1.05 : 1 }}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onBlur={handleAnswerSubmit}
                      className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl bg-gradient-to-br from-yellow-200 to-yellow-100 text-gray-800 p-1.5 xs:p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg xs:rounded-xl sm:rounded-2xl border-2 xs:border-3 sm:border-4 md:border-6 border-yellow-500 w-12 xs:w-16 sm:w-20 md:w-24 lg:w-32 xl:w-40 2xl:w-48 text-center focus:border-green-500 focus:ring-2 xs:focus:ring-3 sm:focus:ring-4 focus:ring-green-200 transition-all mx-1 xs:mx-2 sm:mx-3 font-bold"
                      placeholder={examples[currentExample].placeholder}
                      style={{
                        boxShadow: userAnswer
                          ? "0 4px 12px rgba(251, 191, 36, 0.3)"
                          : "none",
                      }}
                    />
                    <span>{examples[currentExample].afterInput}</span>
                  </h2>
                </motion.div>
              </div>
            </div>

            {/* Feedback area */}
            <div className="h-6 xs:h-8 sm:h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {animationStep === 0 && (
                  <motion.p
                    key="prompt"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <span className="text-gray-700 font-medium text-xs xs:text-sm sm:text-base md:text-lg text-center">
                      Enter the correct value for the blank
                    </span>
                  </motion.p>
                )}

                {animationStep === 1.5 && (
                  <motion.div
                    key="incorrect"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <span className="flex items-center gap-1 xs:gap-2 text-red-600 font-bold text-xs xs:text-sm sm:text-base md:text-lg">
                      <X size={16} className="xs:w-5 xs:h-5 sm:w-5 sm:h-5" />
                      <span>Try again!</span>
                    </span>
                  </motion.div>
                )}

                {animationStep === 1 && (
                  <motion.p
                    key="explanation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <span className="text-green-700 font-bold text-xs xs:text-sm sm:text-base md:text-lg text-center">
                      {examples[currentExample].explanation}
                    </span>
                  </motion.p>
                )}

                {animationStep === 2 && (
                  <motion.div
                    key="correct"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <div className="flex items-center gap-1 xs:gap-2 text-green-700 font-bold text-xs xs:text-sm sm:text-base md:text-lg">
                      <Check
                        size={16}
                        className="xs:w-5 xs:h-5 sm:w-5 sm:h-5"
                      />
                      <span className="text-center">
                        Correct! {examples[currentExample].explanation}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap w-max gap-2 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-3 xs:mt-4 sm:mt-6 md:mt-8 mx-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl py-2 px-4 xs:py-2.5 sm:py-3 sm:px-4 md:py-4 md:px-8 lg:py-5 lg:px-16 rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-2 xs:gap-3 font-bold shadow-lg"
          >
            <ArrowBigLeft
              size={20}
              className="xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
            />
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartClick}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl py-2 px-4 xs:py-2.5 xs:px-6 sm:py-3 sm:px-8 md:py-4 md:px-12 lg:py-5 lg:px-16 rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-2 xs:gap-3 font-bold shadow-lg transform hover:transform-gpu"
          >
            <Play
              size={20}
              className="xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10"
            />
            Start
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default MathInstructions;
