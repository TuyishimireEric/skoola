import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, CheckCircle, HelpCircle } from "lucide-react";
import { GameDataI, MissingNumberQuesI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import { speak } from "@/utils/Audio";
import StatusIndicator from "../StatusIndicator";
import { ShowHelp } from "../ShowHelp";
import MissingNumbersInstructions from "./Instructions";
import { formatMissingNumberQuestions } from "@/utils/FormatQuestions";

interface MissingNumbersProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
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

const MissingNumbers = ({
  questionData,
  course,
  onBack,
  onComplete,
}: MissingNumbersProps) => {
  const [startTime] = useState(new Date().toISOString());

  const [questions, setQuestions] = useState<MissingNumberQuesI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<
    (number | string | null)[]
  >([]);
  const [userInputs, setUserInputs] = useState<(string | null)[]>([]);
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

  useEffect(() => {
    if (questionData) {
      const parsedQuestions = formatMissingNumberQuestions(questionData);
      setQuestions(parsedQuestions);
    }
  }, [questionData]);

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentAnswers([...questions[0].numbers]);

      setUserInputs(
        questions[0].numbers.map((val) => (val === null ? "" : String(val)))
      );
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

  const handleAnswerChange = (index: number, value: string) => {
    // Update userInputs state
    const newUserInputs = [...userInputs];
    newUserInputs[index] = value;
    setUserInputs(newUserInputs);

    // Update currentAnswers for validation
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value === "" ? null : value;
    setCurrentAnswers(newAnswers);
  };

  const checkAnswer = () => {
    setIsSubmitting(true);

    const currentQuestion = questions[currentIndex];

    // Check if all gaps are filled
    if (
      currentAnswers.some(
        (answer, idx) =>
          currentQuestion.numbers[idx] === null &&
          (answer === null || answer === "")
      )
    ) {
      setIsCorrect(false);
      speak("fillAll");
      setTimeout(() => {
        setIsCorrect(null);
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    // Create a copy of answers for validation
    const validationAnswers = [...currentAnswers];

    // Convert only the user inputs to numbers for validation
    currentQuestion.numbers.forEach((val, idx) => {
      if (val === null) {
        validationAnswers[idx] =
          typeof validationAnswers[idx] === "string"
            ? parseInt(validationAnswers[idx] as string)
            : validationAnswers[idx];
      }
    });

    // Check for non-numeric inputs in places that should be filled
    if (
      validationAnswers.some(
        (ans, idx) =>
          currentQuestion.numbers[idx] === null && isNaN(ans as number)
      )
    ) {
      setIsCorrect(false);
      speak("wrong");
      setTimeout(() => {
        setIsCorrect(null);
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    // Check if the answers match the original numbers
    const isAnswerCorrect = validationAnswers.every((answer, index) => {
      if (currentQuestion.numbers[index] !== null) {
        return true; // Skip checking original numbers
      }
      return answer === currentQuestion.originalNumbers[index];
    });

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

          // Initialize answers and inputs for the next question
          setCurrentAnswers([...questions[currentIndex + 1].numbers]);
          setUserInputs(
            questions[currentIndex + 1].numbers.map((val) =>
              val === null ? "" : String(val)
            )
          );

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
        setIsCorrect(null);
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
      <MissingNumbersInstructions onStart={handleStartGame} onBack={onBack} />
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
              Fill in the Missing Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Figure out which numbers are missing to complete the sequence
            </p>
          </div>
        </motion.div>

        <div className="w-full flex justify-center mb-2">
          <div className="w-full h-full p-4 flex flex-wrap justify-center items-center gap-6">
            {questions[currentIndex]?.numbers.map((value, index) => {
              const colorClass = colorPalette[index % colorPalette.length];
              const isUserInput = value === null;

              return (
                <div key={index} className="relative">
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
                        value={userInputs[index] || ""}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
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
                </div>
              );
            })}
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
          ) : null}

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
          question={`Fill in the missing numbers to complete the sequence.`}
          answer={`The correct sequence is: ${questions[
            currentIndex
          ]?.originalNumbers.join(", ")}`}
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

export default MissingNumbers;
