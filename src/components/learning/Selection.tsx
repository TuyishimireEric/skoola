import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, HelpCircle } from "lucide-react";
import { GameDataI, MultipleChoiceQuestionI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import StatusIndicator from "./StatusIndicator";
import { speakFeedback } from "./SpeakFeedback";
import { ShowHelp } from "./ShowHelp";
import { formatSelectQuestions } from "@/utils/FormatQuestions";

interface MultipleChoiceProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

const Selection = ({
  questionData,
  course,
  onBack,
  onComplete,
}: MultipleChoiceProps) => {
  const [startTime] = useState(new Date().toISOString());
  const [questions, setQuestions] = useState<MultipleChoiceQuestionI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
  const [currentQuestionAttempted, setCurrentQuestionAttempted] =
    useState(false);

  useEffect(() => {
    if (questionData) {
      const formated = formatSelectQuestions(questionData);

      if (formated.length == 0) onBack();

      setQuestions(formated);
    }
  }, [questionData]);

  // Reset the attempted flag when the question changes
  useEffect(() => {
    setCurrentQuestionAttempted(false);
    setHasFailedOnce(false);
  }, [currentIndex]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !timerPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, timerPaused]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: Number((score / questions.length) * 100).toFixed(2),
        MissedQuestions: missedQuestions.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  const handleSubmit = () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    setCurrentQuestionAttempted(true);

    const currentQuestion = questions[currentIndex];
    const isAnswerCorrect = selectedOption === currentQuestion.answer;

    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setShowCelebration(true);
      speakFeedback("Good!");
      if (!hasFailedOnce) {
        setScore((prev) => prev + 1);
      }
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
          setIsCorrect(null);
          setShowCelebration(false);
        } else {
          setGameOver(true);
        }
        setIsSubmitting(false);
      }, 1500);
    } else {
      speakFeedback("Wrong");
      setHasFailedOnce(true);

      if (!missedQuestions.includes(currentQuestion.question)) {
        setMissedQuestions((prev) => [
          ...prev,
          `${currentQuestion.question} (Correct: ${currentQuestion.answer})`,
        ]);
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
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

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowCelebration(false);
    } else {
      setGameOver(true);
    }
  };

  return (
    <div
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-8 w-full h-full font-comic"
      style={{ height: "calc(100vh - 150px)" }}
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
            <h2 className="text-2xl font-bold text-primary-500 text-center mb-4">
              {questions[currentIndex]?.question}
            </h2>
          </div>
        </motion.div>

        <div className="w-full max-w-2xl mb-4 flex flex-col gap-2">
          {questions[currentIndex]?.options.map((option, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => setSelectedOption(option)}
                className={`w-full text-left p-4 text-base rounded-3xl border-4 transition-all ${
                  selectedOption === option
                    ? "bg-primary-100 border-primary-400 shadow-lg"
                    : "bg-white border-primary-200 hover:border-primary-300"
                } ${
                  isCorrect !== null &&
                  option === questions[currentIndex].answer
                    ? "bg-green-100 border-green-400"
                    : isCorrect === false && option === selectedOption
                    ? "bg-red-100 border-red-500"
                    : ""
                }`}
                disabled={isSubmitting || isCorrect === true}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${
                      selectedOption === option
                        ? "bg-primary-500 text-white"
                        : "bg-primary-200 text-primary-500"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {option}
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 w-full">
          {hasFailedOnce && currentQuestionAttempted && (
            <button
              type="button"
              onClick={openHelpModal}
              className="w-1/3 bg-blue-500 text-white text-3xl py-5 rounded-full hover:bg-blue-400 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
            >
              <HelpCircle size={24} />
              Get Help
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={
              selectedOption === null || isSubmitting || isCorrect === true
            }
            className="w-1/2 bg-primary-400 text-white text-3xl py-5 rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
          >
            Check Answer
          </button>
          <button
            onClick={handleNext}
            className="w-max bg-red-400 text-white text-3xl p-5 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md"
            title="Skip Question"
          >
            {isCorrect !== null ? "Next" : <MdClose />}
          </button>
        </div>
      </div>
      {showHelpModal && (
        <ShowHelp
          question={`${questions[currentIndex].question}`}
          answer={`${questions[currentIndex].answer}`}
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

export default Selection;
