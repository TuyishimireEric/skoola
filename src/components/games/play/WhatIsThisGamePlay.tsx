import { AnimatePresence, motion } from "framer-motion";
import { Camera, Pause, Volume2, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import Image from "next/image";
import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";

// Types
interface WhatIsThisQuestion {
  imageUrl: string;
  textToRead: string;
  audioUrl: string;
  explanation?: string;
  difficulty: string;
  originalQuestion: string;
}

interface WhatIsThisGameplayProps {
  questions: QuestionDataI[];
  game: GameDataI;
  onBack: () => void;
  totalScore: number;
  currentQuestionIndex: number;
  setTotalScore: (score: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
  onComplete: (results: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
    CompletedOn: string;
    TimeSpent: number;
  }) => void;
}

// Vibrant color palette for options
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

const WhatIsThisGameplay: React.FC<WhatIsThisGameplayProps> = ({
  questions,
  game,
  totalScore,
  currentQuestionIndex,
  setTotalScore,
  setCurrentQuestionIndex,
  onComplete,
}) => {
  const startTime = new Date().toISOString();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.Duration || 300);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<string[]>([]);
  const [processedQuestions, setProcessedQuestions] = useState<
    WhatIsThisQuestion[]
  >([]);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  // Game state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const currentQuestion = processedQuestions[currentIndex];

  // Parse question data
  const parseQuestionData = (
    equation: string
  ): {
    imageUrl: string;
    textToRead: string;
    audioUrl: string;
  } => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 3) {
        return {
          imageUrl: parts[0] || "",
          textToRead: parts[1] || "",
          audioUrl: parts[2] || "",
        };
      }
    } catch (error) {
      console.error("Error parsing question data:", error);
    }
    return { imageUrl: "", textToRead: "", audioUrl: "" };
  };

  // Process questions
  useEffect(() => {
    const formatQuestions = (
      questions: QuestionDataI[]
    ): WhatIsThisQuestion[] => {
      return questions.map((q) => {
        const parsed = parseQuestionData(q.QuestionText);

        return {
          imageUrl: parsed.imageUrl,
          textToRead: parsed.textToRead,
          audioUrl: parsed.audioUrl,
          explanation: q.Explanation,
          difficulty: q.Difficulty || "Easy",
          originalQuestion: q.QuestionText,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Generate options for current question
  useEffect(() => {
    if (currentQuestion && processedQuestions.length > 0) {
      const correctAnswer = currentQuestion.textToRead;
      const otherAnswers = processedQuestions
        .filter(
          (q, index) => index !== currentIndex && q.textToRead !== correctAnswer
        )
        .map((q) => q.textToRead)
        .filter((text) => text.trim() !== "");

      // Shuffle and pick 2 random wrong answers
      const shuffledOthers = [...otherAnswers].sort(() => Math.random() - 0.5);
      const wrongAnswers = shuffledOthers.slice(0, 2);

      // Combine correct and wrong answers
      const allOptions = [correctAnswer, ...wrongAnswers];

      // If we don't have enough wrong answers, add some generic ones
      while (allOptions.length < 3) {
        const genericOptions = [
          "Apple",
          "Book",
          "Cat",
          "Dog",
          "House",
          "Car",
          "Tree",
          "Ball",
        ];
        const randomGeneric =
          genericOptions[Math.floor(Math.random() * genericOptions.length)];
        if (!allOptions.includes(randomGeneric)) {
          allOptions.push(randomGeneric);
        }
      }

      // Shuffle the options so correct answer isn't always first
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
      setOptions(shuffledOptions);

      // Reset states for new question
      setSelectedOption(null);
      setIsAnswered(false);
      setShowNextButton(false);
      setIsPlayingAudio(false);
    }
  }, [currentIndex, currentQuestion, processedQuestions]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev: number): number => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) {
      const completedOn = new Date().toISOString();
      const timeSpent = (game.Duration || 300) - timeLeft;

      // Convert missed questions from original question text to question IDs
      const missedQuestionIds = missedQuestions
        .map((originalQuestion) => {
          const questionIndex = processedQuestions.findIndex(
            (pq) => pq.originalQuestion === originalQuestion
          );
          return questionIndex !== -1 ? questions[questionIndex].Id || "" : "";
        })
        .filter((id) => id !== ""); // Remove empty IDs

      onComplete({
        Score:
          processedQuestions.length > 0
            ? ((score / processedQuestions.length) * 100).toFixed(2)
            : "0",
        MissedQuestions: missedQuestionIds.join(", "),
        StartedOn: startTime,
        CompletedOn: completedOn,
        TimeSpent: timeSpent,
      });
    }
  }, [
    gameOver,
    score,
    processedQuestions.length,
    missedQuestions,
    startTime,
    timeLeft,
    game.Duration,
    onComplete,
    questions,
  ]);

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.textToRead;

    if (isCorrect) {
      if (!hasFailedOnce) {
        setScore((prev) => prev + 1);
        const globalNewScore = totalScore + 1;
        setTotalScore(globalNewScore);
      }
      setShowCelebration(true);
      setShowNextButton(true);

      // Auto-play audio on correct answer
      playAudio();

      setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
    } else {
      setHasFailedOnce(true);

      if (!missedQuestions.includes(currentQuestion.originalQuestion)) {
        setMissedQuestions((prev) => [
          ...prev,
          currentQuestion.originalQuestion,
        ]);
      }

      // Reset after 2 seconds to allow retry
      setTimeout(() => {
        setSelectedOption(null);
        setIsAnswered(false);
      }, 2000);
    }
  };

  // Play audio
  const playAudio = () => {
    if (audioElementRef.current && currentQuestion.audioUrl) {
      setIsPlayingAudio(true);
      audioElementRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlayingAudio(false);
      });
    }
  };

  // Pause audio
  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  // Handle audio events
  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentIndex < processedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const newCurrentQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newCurrentQuestionIndex);
      setHasFailedOnce(false);
    } else {
      setGameOver(true);
    }
  };

  // Get option color
  const getOptionColor = (option: string, index: number): string => {
    if (isAnswered) {
      if (option === currentQuestion.textToRead) {
        return "bg-gradient-to-br from-green-400 to-green-600"; // Correct answer - always green
      } else if (option === selectedOption) {
        return "bg-gradient-to-br from-red-400 to-red-600"; // Wrong selected answer - red
      }
    }
    return colorPalette[index % colorPalette.length];
  };

  // Get option border and effects
  const getOptionStyles = (option: string): string => {
    let baseClasses =
      "relative overflow-hidden transform transition-all duration-300 cursor-pointer";

    if (isAnswered) {
      if (option === currentQuestion.textToRead) {
        baseClasses += " ring-4 ring-green-300 scale-105"; // Correct answer highlight
      } else if (option === selectedOption) {
        baseClasses += " ring-4 ring-red-300 scale-95"; // Wrong answer highlight
      } else {
        baseClasses += " opacity-60 cursor-not-allowed"; // Other options dimmed
      }
    } else {
      baseClasses += " hover:scale-105 hover:shadow-xl";
    }

    return baseClasses;
  };

  return (
    <div className="relative w-full h-full font-comic overflow-hidden flex flex-col">
      {/* African decorative elements */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 text-4xl md:text-6xl opacity-10"
        >
          🎯
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 left-10 text-4xl md:text-6xl opacity-10"
        >
          👁️
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 left-20 text-3xl md:text-5xl opacity-10"
        >
          📸
        </motion.div>
      </div>

      {/* Hidden audio element */}
      {currentQuestion && (
        <audio
          ref={audioElementRef}
          src={currentQuestion.audioUrl}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      )}

      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col justify-start items-center p-2 min-h-[50vh] lg:min-h-[50vh]">
        {currentQuestion && (
          <div className="w-full max-w-4xl flex flex-col">
            {/* Question area */}
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center space-y-2">
                {/* Image display */}
                <div className="w-full flex justify-center">
                  <div className=" rounded-2xl">
                    {currentQuestion.imageUrl ? (
                      <div
                        className={`relative inset-0 flex items-center justify-center `}
                      >
                        <Image
                          src={currentQuestion.imageUrl}
                          alt="What is this?"
                          className="w-full max-w-md h-48 md:h-64 object-contain "
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          width={300}
                          height={200}
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-48 md:h-64 rounded-xl flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Camera size={48} className="mx-auto mb-2" />
                          <p>No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="w-full mb-3">
                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    Choose the correct answer:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {options.map((option, index) => (
                      <motion.button
                        key={option}
                        whileHover={!isAnswered ? { scale: 1.05 } : {}}
                        whileTap={!isAnswered ? { scale: 0.95 } : {}}
                        onClick={() => handleOptionSelect(option)}
                        disabled={isAnswered}
                        className={`
                          ${getOptionColor(option, index)}
                          ${getOptionStyles(option)}
                          text-white font-bold py-3 px-6 rounded-2xl
                          text-lg md:text-xl border-4 border-white shadow-lg
                          min-h-[60px] flex items-center justify-center
                        `}
                      >
                        <span className="relative z-10">{option}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Audio and Next buttons */}
            <AnimatePresence>
              {showNextButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-center gap-4 mt-4"
                >
                  {/* Audio control button */}
                  {currentQuestion.audioUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isPlayingAudio ? pauseAudio : playAudio}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause size={20} />
                          Pause Audio
                        </>
                      ) : (
                        <>
                          <Volume2 size={20} />
                          Play Audio
                        </>
                      )}
                    </motion.button>
                  )}

                  {/* Next question button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300"
                  >
                    {currentIndex < processedQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight size={20} />
                      </>
                    ) : (
                      <>
                        Finish Game
                        <CheckCircle size={20} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={100}
              gravity={0.15}
              colors={["#FFD700", "#FF6347", "#32CD32", "#FF8C00", "#8B4513"]}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="text-6xl md:text-8xl"
              >
                🎉
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatIsThisGameplay;
