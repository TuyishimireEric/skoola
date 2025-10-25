import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { Star, Clock, Shuffle, CheckCircle, HelpCircle } from "lucide-react";
import { GameDataI, SortingQuestionI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import { speak } from "@/utils/Audio";
import SortingInstructions from "./Instructions";
import StatusIndicator from "../StatusIndicator";
import { ShowHelp } from "../ShowHelp";
import { formatSortingQuestions } from "@/utils/FormatQuestions";
import { shuffleSortingArray } from "@/utils/functions";

interface SentenceSortingProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

const colorPalette = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-pink-100",
  "bg-purple-100",
  "bg-orange-100",
  "bg-teal-100",
  "bg-indigo-100",
];

const SentenceSorting = ({
  questionData,
  course,
  onBack,
  onComplete,
}: SentenceSortingProps) => {
  const [startTime] = useState(new Date().toISOString());

  const [questions, setQuestions] = useState<SortingQuestionI[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWords, setCurrentWords] = useState<
    { id: string; text: string }[]
  >([]);
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
      const formated = formatSortingQuestions(questionData);

      if (formated.length == 0) onBack();

      setQuestions(formated);
    }
  }, [questionData]);

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentWords(questions[0].words);
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
    setCurrentWords(shuffleSortingArray([...currentWords]));
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    setIsSubmitting(true);

    const currentQuestion = questions[currentIndex];
    const originalWordOrder = currentQuestion.originalSentence.split(" ");

    // Check if current word order matches the original sentence
    const currentWordOrder = currentWords.map((word) => word.text);
    const isAnswerCorrect = originalWordOrder.every(
      (word, index) => word === currentWordOrder[index]
    );

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
          setCurrentWords(questions[currentIndex + 1].words);
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
      if (!missedQuestions.includes(currentQuestion.originalSentence)) {
        setMissedQuestions((prev) => [
          ...prev,
          currentQuestion.originalSentence,
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
    return <SortingInstructions onStart={handleStartGame} onBack={onBack} />;
  }

  return (
    <div
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-8 w-full h-full overflow-hidden font-comic"
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
              Sentence Puzzle
            </h2>
            <p className="text-xl text-gray-600">
              Arrange the words in the correct order
            </p>
          </div>
        </motion.div>

        <div className="w-full flex justify-center mb-2">
          <div className="w-full h-full p-4 flex flex-wrap justify-center items-center gap-4">
            <Reorder.Group
              axis="x"
              values={currentWords}
              onReorder={setCurrentWords}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              {currentWords.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  style={{
                    userSelect: "none",
                    cursor: "grab",
                    backgroundColor: "none",
                    shadow: "none",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  whileDrag={{
                    scale: 1.1,
                    zIndex: 1,
                  }}
                >
                  <div
                    className={` ${
                      colorPalette[index % colorPalette.length]
                    } text-black shadow-lg  font-comic text-3xl font-semibold rounded-3xl px-6 py-2`}
                  >
                    {item.text}
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
              className="flex items-center gap-2 bg-yellow-400 text-white text-2xl py-4 px-6 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-md"
            >
              <Shuffle className="w-6 h-6" />
              Shuffle Words
            </button>
          )}

          <button
            onClick={checkAnswer}
            disabled={isSubmitting}
            className="flex items-center gap-2 w-max bg-primary-400 text-white text-2xl py-4 px-6 rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
          >
            <CheckCircle className="w-6 h-6" />
            Check Answer
          </button>

          <button
            onClick={() => setGameOver(true)}
            className="w-max bg-red-400 text-white text-2xl p-4 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md"
          >
            <MdClose />
          </button>
        </div>
      </div>

      {showHelpModal && (
        <ShowHelp
          question={``}
          answer={`${questions[currentIndex].originalSentence}`}
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

export default SentenceSorting;
