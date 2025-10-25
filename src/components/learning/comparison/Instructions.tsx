import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, X, ArrowBigLeft } from "lucide-react";
import { speak } from "@/utils/Audio";

interface InstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

const ComparisonInstructions = ({ onStart, onBack }: InstructionsProps) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [selectedOperator, setSelectedOperator] = useState<
    "<" | ">" | "=" | null
  >(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  const examples = [
    {
      left: 5,
      right: 8,
      correctOperator: "<",
      explanation: "5 is less than 8",
    },
    { left: 6, right: 6, correctOperator: "=", explanation: "6 is equal to 6" },
    {
      left: 9,
      right: 4,
      correctOperator: ">",
      explanation: "9 is greater than 4",
    },
  ];

  // Reset animation state when changing examples
  useEffect(() => {
    setAnimationStep(0);
    setSelectedOperator(null);
  }, [currentExample]);

  // Demo animation sequence
  useEffect(() => {
    if (!autoPlay) return;

    if (animationStep === 0) {
      const timer = setTimeout(() => {
        setAnimationStep(1);
        setSelectedOperator(
          examples[currentExample].correctOperator as "<" | ">" | "="
        );
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
          // Restart the examples cycle
          setCurrentExample(0);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [animationStep, currentExample, autoPlay, examples]);

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

  const goToExample = (index: number) => {
    setAutoPlay(false);
    setCurrentExample(index);
  };

  const handleOperatorClick = (operator: "<" | ">" | "=") => {
    setAutoPlay(false);
    setSelectedOperator(operator);

    const isCorrect = operator === examples[currentExample].correctOperator;

    if (isCorrect) {
      setAnimationStep(2);
    } else {
      setAnimationStep(1.5); // New step for incorrect answers
    }
  };

  const OperatorButton = ({
    operator,
    selected,
  }: {
    operator: "<" | ">" | "=";
    selected: boolean;
  }) => (
    <div
      className={`
        w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl font-bold rounded-2xl flex items-center justify-center
        ${
          selected
            ? "bg-primary-400 text-white"
            : "bg-white text-primary-400 border-4 border-primary-300"
        }
        transition-all duration-300 cursor-pointer hover:scale-105 
      `}
      onClick={() => handleOperatorClick(operator)}
    >
      {operator}
    </div>
  );

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    if (!autoPlay) {
      setAnimationStep(0);
      setSelectedOperator(null);
    }
  };

  const handleStartClick = () => {
    setShowCountdown(true);
    setCountdownValue(3);
    speak("counter");
  };

  return (
    <div
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-4 md:p-8 w-full h-full font-comic overflow-hidden"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate__animated animate__fadeIn">
            <div
              key={countdownValue}
              className="text-white text-9xl font-bold animate__animated animate__bounceIn"
            >
              {countdownValue === 0 ? "GO!" : countdownValue}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-6">
        <div className="text-3xl md:text-5xl font-bold text-primary-500 mb-2 md:mb-2">
          Let&apos;s Compare Numbers!
        </div>

        <div className="bg-white p-4 md:p-2 rounded-3xl shadow-lg max-w-3xl w-full">
          <div className="p-4 bg-primary-100 md:p-4 rounded-2xl flex flex-col items-center justify-center">
            <div className="flex justify-between w-full mb-2">
              <div className="flex justify-center mb-2">
                {examples.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => goToExample(index)}
                    className={`px-3 py-1 mx-1 rounded-t-lg cursor-pointer ${
                      currentExample === index
                        ? "bg-primary-400 text-white font-bold"
                        : "bg-primary-200 hover:bg-primary-300"
                    }`}
                  >
                    Example {index + 1}
                  </div>
                ))}
              </div>
              <div onClick={toggleAutoPlay} className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${
                    autoPlay ? "bg-green-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {autoPlay ? <Check size={12} /> : <Play size={12} />}
                  {autoPlay ? "Auto" : "Manual"}
                </button>
              </div>
            </div>

            {/* Example content */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <span
                key={`left-${currentExample}`}
                className="text-6xl md:text-9xl font-bold text-primary-500 animate__animated animate__fadeIn"
              >
                {examples[currentExample].left}
              </span>

              <div className="flex gap-2">
                <OperatorButton
                  operator="<"
                  selected={selectedOperator === "<"}
                />
                <OperatorButton
                  operator="="
                  selected={selectedOperator === "="}
                />
                <OperatorButton
                  operator=">"
                  selected={selectedOperator === ">"}
                />
              </div>

              <span
                key={`right-${currentExample}`}
                className="text-6xl md:text-9xl font-bold text-primary-500 animate__animated animate__fadeIn"
              >
                {examples[currentExample].right}
              </span>
            </div>

            {/* Feedback area */}
            <AnimatePresence mode="wait">
              {animationStep === 0 && (
                <motion.p
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-primary-500 font-medium text-base">
                    Select the correct comparison symbol
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
                  <span className="flex items-center gap-2 text-red-500 font-bold text-base">
                    <X size={20} />
                    <span>Try again!</span>
                  </span>
                </motion.div>
              )}

              {animationStep === 1 && (
                <motion.p
                  key="explanation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-green-600 font-bold text-base">
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
                  <div className="flex items-center gap-2 text-green-600 font-bold text-base">
                    <Check size={20} />
                    <span>
                      Correct! {examples[currentExample].left}{" "}
                      {examples[currentExample].correctOperator}{" "}
                      {examples[currentExample].right}
                    </span>
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

export default ComparisonInstructions;
