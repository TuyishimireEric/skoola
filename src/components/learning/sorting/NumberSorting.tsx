import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Star,
  Clock,
  Shuffle,
  CheckCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { GameDataI, NumberSortingQuestionI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import { speak } from "@/utils/Audio";
import StatusIndicator from "../StatusIndicator";
import { ShowHelp } from "../ShowHelp";
import NumberSortingInstructions from "./NumberSortingInstructionts";
import { formatNumberSortingQuestions } from "@/utils/FormatQuestions";
import { shuffleSortingArray } from "@/utils/functions";

interface NumberSortingProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

interface NumberItem {
  id: string;
  value: number;
}

// Vibrant color palette with gradients for number cards
const colorPalette = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-indigo-400 to-indigo-600",
  "bg-gradient-to-br from-red-400 to-red-600",
  "bg-gradient-to-br from-cyan-400 to-cyan-600",
];

const NumberSorting = ({
  questionData,
  course,
  onBack,
  onComplete,
}: NumberSortingProps) => {
  const [startTime] = useState(new Date().toISOString());
  const [questions, setQuestions] = useState<NumberSortingQuestionI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentNumbers, setCurrentNumbers] = useState<NumberItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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

  // Initialize questions from the provided data
  useEffect(() => {
    if (questionData) {
      const parsedQuestions = formatNumberSortingQuestions(questionData);
      setQuestions(parsedQuestions);
    }
  }, [questionData]);

  useEffect(() => {
    if (questions.length > 0) {
      const initialNumbers = questions[0].numbers.map((num, index) => ({
        id: `${index}`,
        value: num,
      }));
      setCurrentNumbers(shuffleSortingArray(initialNumbers));
    }
  }, [questions]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !timerPaused && !showInstructions) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, timerPaused, showInstructions]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: Number((score / questions.length) * 100).toFixed(2),
        MissedQuestions: missedQuestions.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  const handleShuffle = () => {
    const shuffledNumbers = shuffleSortingArray([...currentNumbers]);
    setCurrentNumbers(shuffledNumbers);
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    setIsSubmitting(true);

    const currentQuestion = questions[currentIndex];
    const currentValues = currentNumbers.map((item) => item.value);

    let isAnswerCorrect = false;

    if (currentQuestion.orderType === "ascending") {
      // Check if sorted in ascending order (each number is greater than or equal to the previous)
      isAnswerCorrect = currentValues.every(
        (num, index) => index === 0 || num >= currentValues[index - 1]
      );
    } else {
      // Check if sorted in descending order (each number is less than or equal to the previous)
      isAnswerCorrect = currentValues.every(
        (num, index) => index === 0 || num <= currentValues[index - 1]
      );
    }

    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setShowCelebration(true);
      speak("great");
      if (!hasFailedOnce) {
        setScore((prev) => prev + 1);
      }

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          const nextNumbers = questions[currentIndex + 1].numbers.map(
            (num, index) => ({
              id: `${index}`,
              value: num,
            })
          );
          setCurrentNumbers(shuffleSortingArray(nextNumbers));
          setIsCorrect(null);
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
      if (!missedQuestions.includes(JSON.stringify(currentQuestion))) {
        setMissedQuestions((prev) => [
          ...prev,
          JSON.stringify(currentQuestion),
        ]);
      }

      setTimeout(() => {
        handleShuffle();
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const openHelpModal = () => {
    setShowHelpModal(true);
    setTimerPaused(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    setTimerPaused(false);
  };

  const handleStartGame = () => {
    setShowInstructions(false);
  };

  if (showInstructions) {
    return (
      <NumberSortingInstructions onStart={handleStartGame} onBack={onBack} />
    );
  }

  return (
    <div
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-8 w-full h-full font-comic"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="absolute top-0 left-0 p-6 flex items-center justify-between w-full">
        <StatusIndicator
          icon={Clock}
          value={`${timeLeft}s`}
          label="Time Left"
          color="text-primary-400"
          borderColor="border-primary-400"
        />
        <StatusIndicator
          icon={Star}
          value={score}
          total={questions.length}
          label="Score"
          color="text-yellow-400"
          borderColor="border-primary-300"
        />
      </div>

      <div className="flex flex-col items-center justify-center h-full gap-8">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold text-primary-500 mb-2">
              Number Sorting
            </h2>
            <p className="text-xl text-gray-600 flex items-center gap-2">
              Sort the numbers in
              <span className="font-bold flex items-center">
                {questions[currentIndex]?.orderType === "ascending" ? (
                  <>
                    ascending <ArrowUp className="ml-1" />
                  </>
                ) : (
                  <>
                    descending <ArrowDown className="ml-1" />
                  </>
                )}
              </span>
              order
            </p>
          </div>
        </motion.div>

        <div className="w-full flex justify-center mb-2">
          <div className="w-full h-full p-4 flex flex-wrap justify-center items-center gap-6">
            <Reorder.Group
              axis="x"
              values={currentNumbers}
              onReorder={setCurrentNumbers}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {currentNumbers.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  style={{
                    userSelect: "none",
                    cursor: "grab",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  whileDrag={{
                    scale: 1.1,
                    zIndex: 1,
                    boxShadow: "0 10px 15px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    className={`${
                      colorPalette[index % colorPalette.length]
                    } text-white shadow-lg border-4 border-white rounded-2xl w-24 h-24 flex items-center justify-center relative`}
                  >
                    <span className="text-5xl font-bold">{item.value}</span>
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 rounded-2xl pointer-events-none"></div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>

        {isCorrect === true && (
          <div className="bg-green-100 text-green-800 px-6 py-1 rounded-full text-xl font-medium mb-4">
            Correct! Well done! 👏
          </div>
        )}

        {isCorrect === false && (
          <div className="bg-red-100 text-red-800 px-6 py-1 rounded-full text-xl font-medium mb-4">
            Not quite right. Try again! 🔄
          </div>
        )}

        <div className="flex items-center justify-center gap-4 w-full">
          {hasFailedOnce ? (
            <button
              type="button"
              onClick={openHelpModal}
              className="w-1/3 bg-blue-500 text-white text-2xl py-4 rounded-full hover:bg-blue-400 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
            >
              <HelpCircle size={24} />
              Get Help
            </button>
          ) : (
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 bg-yellow-400 text-white text-2xl py-3 px-6 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-md"
            >
              <Shuffle className="w-6 h-6" />
              Shuffle Numbers
            </button>
          )}

          <button
            onClick={checkAnswer}
            disabled={isSubmitting}
            className="flex items-center gap-2 w-max bg-primary-400 text-white text-2xl py-3 px-6 rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
          >
            <CheckCircle className="w-6 h-6" />
            Check Answer
          </button>

          <button
            onClick={() => setGameOver(true)}
            className="w-max bg-red-400 text-white text-2xl p-3 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md"
          >
            <MdClose />
          </button>
        </div>
      </div>

      {showHelpModal && (
        <ShowHelp
          question={`Sort the numbers in ${questions[currentIndex]?.orderType} order.`}
          answer={`The correct ${
            questions[currentIndex]?.orderType
          } order is: ${
            questions[currentIndex]?.orderType === "ascending"
              ? [...questions[currentIndex].numbers]
                  .sort((a, b) => a - b)
                  .join(", ")
              : [...questions[currentIndex].numbers]
                  .sort((a, b) => b - a)
                  .join(", ")
          }`}
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
          numberOfPieces={50}
          gravity={0.2}
        />
      )}
    </div>
  );
};

export default NumberSorting;
