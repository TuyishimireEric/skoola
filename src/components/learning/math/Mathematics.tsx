import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, HelpCircle, ArrowBigLeft } from "lucide-react";
import { GameDataI, MathQuestion } from "@/types/Course";
import Confetti from "react-confetti";
import StatusIndicator from "../StatusIndicator";
import { speak } from "@/utils/Audio";
import { ShowHelp } from "../ShowHelp";
import MathInstructions from "./Instructions";
import { formatMathQuestions } from "@/utils/FormatQuestions";

interface MathematicsProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

const Mathematics = ({
  questionData,
  course,
  onBack,
  onComplete,
}: MathematicsProps) => {
  const startTime = new Date().toISOString();
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const initialTime = course.Duration ?? 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<string[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (questionData) {
      try {
        const parsedQuestions = formatMathQuestions(questionData);
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error("Failed to parse questions:", error);
        onBack();
      }
    }
  }, [questionData]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !timerPaused && gameStarted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, timerPaused, gameStarted]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: Number((score / questions.length) * 100).toFixed(2),
        MissedQuestions: missedQuestions.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  useEffect(() => {
    // Play audio immediately when celebration starts
    if (showCelebration) {
      speak("great");
    }
  }, [showCelebration]);

  const getHintText = (question: MathQuestion): string => {
    switch (question.position) {
      case "first":
        return "Find the first number";
      case "second":
        return "Find the second number";
      case "result":
        return "Calculate the result";
      default:
        return "Solve the equation";
    }
  };

  const validateAnswer = (
    question: MathQuestion,
    userInput: string
  ): boolean => {
    if (!userInput || userInput.trim() === "") return false;
    const userValue = parseInt(userInput);
    return !isNaN(userValue) && userValue === question.answer;
  };

  const handleNumberClick = (num: string) => {
    if (userAnswer.length < 3) {
      setUserAnswer(userAnswer + num);
    }
  };

  const handleBackspace = () => {
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const handleClear = () => {
    setUserAnswer("");
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) {
      setIsSubmitting(false);
      return;
    }

    const isAnswerCorrect = validateAnswer(currentQuestion, userAnswer);

    if (isAnswerCorrect) {
      setShowCelebration(true);
      if (!hasFailedOnce) setScore((prev) => prev + 1);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setUserAnswer("");
          setShowCelebration(false);
          setHasFailedOnce(false);
        } else {
          setGameOver(true);
        }
        setIsSubmitting(false);
      }, 1500);
    } else {
      speak("wrong");
      setHasFailedOnce(true);
      if (!missedQuestions.includes(currentQuestion.originalQuestion)) {
        setMissedQuestions((prev) => [
          ...prev,
          currentQuestion.originalQuestion,
        ]);
      }
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handleStartGame = () => {
    setShowInstructions(false);
    setGameStarted(true);
  };

  const openHelpModal = () => {
    setShowHelpModal(true);
    setTimerPaused(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    setHasFailedOnce(false);
    setTimerPaused(false);
  };

  const currentQuestion = questions[currentIndex];

  if (showInstructions) {
    return <MathInstructions onStart={handleStartGame} onBack={onBack} />;
  }

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden font-comic flex flex-col">
      {/* Status indicators - Fixed Header */}
      <div className="relative z-10 flex items-center justify-between p-3 md:p-4 lg:p-6">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <StatusIndicator
            icon={Clock}
            value={`${timeLeft}`}
            label="Time"
            color="text-yellow-400"
            borderColor="border-yellow-600"
          />
        </motion.div>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-5xl font-bold text-primary-600 text-center drop-shadow-lg mb-3 xs:mb-4 sm:mb-6"
        >
          Let&apos;s Solve Math Problems!
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <StatusIndicator
            icon={Star}
            value={score}
            total={questions.length}
            label="Score"
            color="text-yellow-400"
            borderColor="border-yellow-400"
          />
        </motion.div>
      </div>

      {/* Main Content Area - Scrollable if needed */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-6 overflow-auto">
        {currentQuestion && (
          <div className="w-full max-w-5xl flex flex-col gap-4">
            {/* Whiteboard area */}
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-6 md:p-10 lg:p-12 relative overflow-hidden"
            >
              {/* Whiteboard texture */}
              <div className="absolute inset-0 opacity-5" />

              <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-800 flex items-center flex-wrap justify-center">
                  <span>{currentQuestion.beforeInput}</span>
                  <motion.div
                    animate={{ scale: userAnswer ? 1.05 : 1 }}
                    className="inline-block mx-2 md:mx-3 lg:mx-4 px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl border-4 md:border-6 border-yellow-500 text-center transform transition-all"
                    style={{
                      boxShadow: userAnswer
                        ? "0 8px 20px rgba(251, 191, 36, 0.3)"
                        : "none",
                    }}
                  >
                    <span
                      className={userAnswer ? "text-gray-800" : "text-gray-400"}
                    >
                      {userAnswer || "?"}
                    </span>
                  </motion.div>
                  <span>{currentQuestion.afterInput}</span>
                </h2>
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-600">
                  {getHintText(currentQuestion)}
                </p>
              </div>
            </motion.div>

            {/* Action buttons row */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-6 mt-4">
              {hasFailedOnce && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openHelpModal}
                  className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xl md:text-2xl lg:text-3xl font-bold py-3 px-8 md:py-4 md:px-10 lg:py-5 lg:px-12 rounded-full hover:brightness-110 transition-all flex items-center gap-3 shadow-lg"
                >
                  <HelpCircle size={28} className="lg:w-8 lg:h-8" />
                  Get Help
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubmit()}
                disabled={userAnswer === "" || isSubmitting}
                className="bg-gradient-to-br from-green-500 to-green-700 text-white text-xl md:text-2xl lg:text-3xl font-bold py-4 px-10 md:py-5 md:px-14 lg:py-6 lg:px-14 rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:transform-gpu"
              >
                ✓ Check
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Number pad - Fixed Bottom */}
      <div className=" p-3 md:p-4 lg:p-5 ">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap34 flex-wrap">
            {/* ArrowBigLeft button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackspace}
              className="bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-white/70 text-white font-bold py-3 px-4 md:py-4 md:px-6 lg:py-5 lg:px-6 rounded-xl hover:brightness-110 transition-all flex items-center justify-center"
              disabled={isSubmitting}
            >
              <ArrowBigLeft size={24} />
            </motion.button>

            {/* Number buttons 0-9 */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(num.toString())}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white/70 text-white text-xl md:text-2xl lg:text-3xl font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center"
                disabled={isSubmitting}
              >
                {num}
              </motion.button>
            ))}

            {/* Clear button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="bg-gradient-to-br from-red-400 to-red-600 text-white border-4 border-white/70 text-sm md:text-lg lg:text-xl font-bold py-3 px-4 md:py-4 md:px-6 lg:py-6 lg:px-6 rounded-xl hover:brightness-110 transition-all"
              disabled={isSubmitting}
            >
              Clear
            </motion.button>
            {/* <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameOver(true)}
              className="bg-gradient-to-br from-red-500 to-red-700 text-white p-3 md:p-4 lg:p-5 rounded-full hover:brightness-110 transition-all shadow-lg"
            >
              <MdClose size={32} className="lg:w-10 lg:h-10" />
            </motion.button> */}
          </div>
        </div>
      </div>

      {showHelpModal && currentQuestion && (
        <ShowHelp
          question={currentQuestion.originalQuestion}
          answer={currentQuestion.answer}
          course={course}
          isOpen={showHelpModal}
          onClose={closeHelpModal}
        />
      )}

      {showCelebration && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={100}
          gravity={0.15}
          colors={["#FFD700", "#FF6347", "#32CD32", "#FF8C00", "#8B4513"]}
        />
      )}
    </div>
  );
};

export default Mathematics;
