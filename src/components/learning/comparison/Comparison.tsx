import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, HelpCircle } from "lucide-react";
import { ComparisonQuestionI, GameDataI, OperatorI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import { speak } from "@/utils/Audio";
import ComparisonInstructions from "./Instructions";
import StatusIndicator from "../StatusIndicator";
import { ShowHelp } from "../ShowHelp";
import { formatComparisonQuestions } from "@/utils/FormatQuestions";

interface ComparisonProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

const Comparison = ({
  questionData,
  course,
  onBack,
  onComplete,
}: ComparisonProps) => {
  const [startTime] = useState(new Date().toISOString());
  const [questions, setQuestions] = useState<ComparisonQuestionI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOperator, setSelectedOperator] = useState<OperatorI | null>(
    null
  );
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
      setQuestions(formatComparisonQuestions(questionData));
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
  }, [timeLeft, timerPaused, gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: Number((score / questions.length) * 100).toFixed(2),
        MissedQuestions: missedQuestions.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  const handleOperatorSelect = (operator: OperatorI) => {
    setSelectedOperator(operator);
  };

  const handleCheck = () => {
    if (!selectedOperator || !questions[currentIndex]) return;
    setHasFailedOnce(false);

    setIsSubmitting(true);
    const currentQuestion = questions[currentIndex];
    const isAnswerCorrect =
      selectedOperator === currentQuestion.correctOperator;

    if (isAnswerCorrect) {
      speak("great");
      setShowCelebration(true);
      if (!hasFailedOnce) setScore((prev) => prev + 1);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOperator(null);
          setShowCelebration(false);
        } else {
          setGameOver(true);
        }
        setIsSubmitting(false);
      }, 1500);
    } else {
      speak("wrong");
      setHasFailedOnce(true);
      const missedQuestion = `${currentQuestion.left} ${currentQuestion.correctOperator} ${currentQuestion.right}`;
      if (!missedQuestions.includes(missedQuestion)) {
        setMissedQuestions((prev) => [...prev, missedQuestion]);
      }
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handleStartGame = () => {
    setShowInstructions(false);
    setGameStarted(true);
  };

  const OperatorButton = ({
    operator,
    selected,
  }: {
    operator: OperatorI;
    selected: boolean;
  }) => (
    <button
      onClick={() => handleOperatorSelect(operator)}
      className={`
        w-24 h-24 text-5xl font-bold rounded-2xl 
        ${
          selected
            ? "bg-primary-400 text-white"
            : "bg-white text-primary-400 border-4 border-primary-300"
        }
        hover:shadow-lg transition-all duration-300
      `}
    >
      {operator}
    </button>
  );

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
    return <ComparisonInstructions onStart={handleStartGame} onBack={onBack} />;
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
              Compare the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              select the correct operator to compare the numbers
            </p>
          </div>
        </motion.div>
        {currentQuestion && (
          <div className="flex items-center justify-center gap-8 mb-8">
            <span className="text-9xl font-bold text-primary-500">
              {currentQuestion.left}
            </span>
            <div className="flex gap-4">
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
            <span className="text-9xl font-bold text-primary-500">
              {currentQuestion.right}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 w-full">
          {hasFailedOnce && (
            <button
              type="button"
              onClick={openHelpModal}
              className="w-1/3 bg-blue-500 text-white text-2xl py-2 rounded-full hover:bg-blue-400 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
            >
              <HelpCircle size={24} />
              Get Help
            </button>
          )}
          <button
            onClick={handleCheck}
            disabled={!selectedOperator || isSubmitting}
            className="w-1/2 bg-primary-400 text-white text-2xl py-2 rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
          >
            Check Answer
          </button>
          <button
            onClick={() => setGameOver(true)}
            className="w-max bg-red-400 text-white text-3xl p-3 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md"
          >
            <MdClose />
          </button>
        </div>
      </div>
      {showHelpModal && (
        <ShowHelp
          question={`Compare ${currentQuestion.left} ${currentQuestion.right}`}
          answer={`${currentQuestion.left} ${currentQuestion.correctOperator} ${currentQuestion.right}`}
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

export default Comparison;
