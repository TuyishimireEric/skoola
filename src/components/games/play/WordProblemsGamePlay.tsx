import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Delete, ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  unit: string;
}

interface WordProblemQuestion {
  problemText: string;
  subQuestions: SubQuestion[];
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface SubQuestionAnswer {
  id: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface WordProblemsGameplayProps {
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

const WordProblemsGameplay: React.FC<WordProblemsGameplayProps> = ({
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
  const [subQuestionAnswers, setSubQuestionAnswers] = useState<
    SubQuestionAnswer[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(game.Duration || 300);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<
    WordProblemQuestion[]
  >([]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
  const currentQuestion = processedQuestions[currentIndex];

  // Parse word problem from equation string
  const parseWordProblem = (
    equation: string
  ): { problemText: string; subQuestions: SubQuestion[] } => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 2) {
        const problemText = parts[0] || "";
        const subQuestionsStr = parts[1] || "";
        const subQuestions = subQuestionsStr ? JSON.parse(subQuestionsStr) : [];
        return { problemText, subQuestions };
      }
    } catch (error) {
      console.error("Error parsing word problem:", error);
    }

    return {
      problemText: equation,
      subQuestions: [],
    };
  };

  // Process questions to create word problem data
  useEffect(() => {
    const formatWordProblems = (
      questions: QuestionDataI[]
    ): WordProblemQuestion[] => {
      return questions.map((q) => {
        const parsed = parseWordProblem(q.QuestionText);
        return {
          problemText: parsed.problemText,
          subQuestions: parsed.subQuestions,
          originalQuestion: q.QuestionText,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatWordProblems(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Initialize sub-question answers when question changes
  useEffect(() => {
    if (currentQuestion) {
      const initialAnswers = currentQuestion.subQuestions.map((sq) => ({
        id: sq.id,
        userAnswer: "",
        isCorrect: false,
      }));
      setSubQuestionAnswers(initialAnswers);
      setActiveInputId(currentQuestion.subQuestions[0]?.id || null);
    }
  }, [currentIndex, currentQuestion]);

  // Enhanced keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !currentQuestion ||
        gameOver ||
        showResults ||
        currentQuestion.isAnswered
      )
        return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allAnswersFilled) {
          handleContinue();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClearCurrent();
      } else if (e.key === "." && activeInputId) {
        const currentAnswer = subQuestionAnswers.find(
          (sq) => sq.id === activeInputId
        );
        if (currentAnswer && !currentAnswer.userAnswer.includes(".")) {
          e.preventDefault();
          handleNumberClick(".");
        }
      } else if (e.key === "-" && activeInputId) {
        const currentAnswer = subQuestionAnswers.find(
          (sq) => sq.id === activeInputId
        );
        if (currentAnswer && currentAnswer.userAnswer === "") {
          e.preventDefault();
          handleNumberClick("-");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    subQuestionAnswers,
    currentQuestion,
    gameOver,
    showResults,
    activeInputId,
  ]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, gameOver, showResults]);

  // Game over effect
  useEffect(() => {
    if (gameOver || showResults) {
      calculateResults();
    }
  }, [gameOver, showResults]);

  // Calculate final results with fixed scoring (1 point per correct answer)
  const calculateResults = () => {
    const missedQuestions: string[] = [];

    processedQuestions.forEach((question, index) => {
      if (question.isAnswered) {
        if (!question.isCorrect) {
          missedQuestions.push(questions[index].Id || "");
        }
      } else {
        missedQuestions.push(questions[index].Id || "");
      }
    });

    const completedOn = new Date().toISOString();
    const timeSpent = (game.Duration || 300) - timeLeft;

    // Calculate percentage for current game type only (for display purposes)
    const currentGameScore =
      processedQuestions.length > 0
        ? ((sectionCorrectCount / processedQuestions.length) * 100).toFixed(2)
        : "0";

    onComplete({
      Score: currentGameScore, // This is just for display (0-100%)
      MissedQuestions: missedQuestions.join(", "),
      StartedOn: startTime,
      CompletedOn: completedOn,
      TimeSpent: timeSpent,
    });
  };

  const handleNumberClick = (value: string) => {
    if (!activeInputId || currentQuestion?.isAnswered) return;

    const currentAnswer = subQuestionAnswers.find(
      (sq) => sq.id === activeInputId
    );
    if (currentAnswer && currentAnswer.userAnswer.length < 10) {
      updateSubQuestionAnswer(activeInputId, currentAnswer.userAnswer + value);
    }

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle backspace from number pad
  const handleBackspace = () => {
    if (!activeInputId || currentQuestion?.isAnswered) return;

    const currentAnswer = subQuestionAnswers.find(
      (sq) => sq.id === activeInputId
    );
    if (currentAnswer) {
      updateSubQuestionAnswer(
        activeInputId,
        currentAnswer.userAnswer.slice(0, -1)
      );
    }
  };

  // Handle clear current input
  const handleClearCurrent = () => {
    if (!activeInputId || currentQuestion?.isAnswered) return;
    updateSubQuestionAnswer(activeInputId, "");
  };

  // Update sub-question answer
  const updateSubQuestionAnswer = (id: string, value: string) => {
    setSubQuestionAnswers((prev) =>
      prev.map((sq) => (sq.id === id ? { ...sq, userAnswer: value } : sq))
    );
  };

  // Handle input change
  const handleInputChange = (id: string, value: string) => {
    if (currentQuestion?.isAnswered) return;
    if (/^[+-]?\d*\.?\d*$/.test(value) && value.length <= 10) {
      updateSubQuestionAnswer(id, value);
    }
  };

  // Handle input focus
  const handleInputFocus = (id: string) => {
    if (!currentQuestion?.isAnswered) {
      setActiveInputId(id);
    }
  };

  // Normalize answer for comparison
  const normalizeAnswer = (answer: string): string => {
    return answer.trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, "");
  };

  // Validate all sub-questions
  const validateAllAnswers = (): boolean => {
    if (!currentQuestion || subQuestionAnswers.length === 0) return false;

    let allCorrect = true;
    const updatedAnswers = subQuestionAnswers.map((sqAnswer) => {
      const subQuestion = currentQuestion.subQuestions.find(
        (sq) => sq.id === sqAnswer.id
      );
      if (!subQuestion) return { ...sqAnswer, isCorrect: false };

      const normalizedUser = normalizeAnswer(sqAnswer.userAnswer);
      const normalizedCorrect = normalizeAnswer(subQuestion.answer);

      // Check for numeric equivalence
      const userNum = parseFloat(normalizedUser);
      const correctNum = parseFloat(normalizedCorrect);

      let isCorrect = false;
      if (!isNaN(userNum) && !isNaN(correctNum)) {
        isCorrect = Math.abs(userNum - correctNum) < 0.001;
      } else {
        isCorrect = normalizedUser === normalizedCorrect;
      }

      if (!isCorrect) allCorrect = false;
      return { ...sqAnswer, isCorrect };
    });

    setSubQuestionAnswers(updatedAnswers);
    return allCorrect;
  };

  // Check if all answers are filled
  const allAnswersFilled =
    subQuestionAnswers.length > 0 &&
    subQuestionAnswers.every((sq) => sq.userAnswer.trim() !== "");

  // Handle continue to next question
  const handleContinue = () => {
    if (!currentQuestion || !allAnswersFilled) return;

    const isCorrect = validateAllAnswers();

    // Mark question as answered and set correctness
    setProcessedQuestions((prev) =>
      prev.map((q, qIndex) => {
        if (qIndex === currentIndex) {
          return { ...q, isAnswered: true, isCorrect };
        }
        return q;
      })
    );

    // Update score if correct (1 point per correct answer)
    if (isCorrect) {
      setSectionCorrectCount((prev) => prev + 1);
      setTotalScore(totalScore + 1); // Add 1 point to cumulative score

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    // Move to next question or finish
    setTimeout(() => {
      if (currentIndex < processedQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        const newCurrentQuestionIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(newCurrentQuestionIndex);
        setSubQuestionAnswers([]);
        setActiveInputId(null);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  // Get sub-question letter (a, b, c, etc.)
  const getSubQuestionLetter = (index: number): string => {
    return String.fromCharCode(97 + index);
  };

  const numberButtons = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: ".", label: "." },
    { value: "0", label: "0", span: 2 },
  ];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden pt-24">
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
          🏺
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 left-10 text-4xl md:text-6xl opacity-10"
        >
          🌍
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 left-20 text-3xl md:text-5xl opacity-10"
        >
          🦁
        </motion.div>
      </div>

      {/* Main scrollable content area */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex items-center justify-center p-2 md:p-3 lg:p-4 pb-20 md:pb-24 lg:pb-28">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl"
              >
                {/* Question area */}
                <div className="space-y-2 md:space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
                    <BookOpen className="text-emerald-600" size={20} />
                    <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-700">
                      Solve the Word Problem
                    </h2>
                  </div>

                  {/* Problem text */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className=" p-3 rounded-lg lg:rounded-xl"
                  >
                    <div className="text-base md:text-lg lg:text-xl font-bold text-gray-800 leading-relaxed text-center">
                      {currentQuestion.problemText}
                    </div>
                  </motion.div>

                  {/* Sub-questions with reduced spacing */}
                  <div className="space-y-1.5 md:space-y-2">
                    {currentQuestion.subQuestions.map((subQ, index) => {
                      const userAnswer = subQuestionAnswers.find(
                        (sq) => sq.id === subQ.id
                      );
                      const isActive = activeInputId === subQ.id;

                      return (
                        <motion.div
                          key={subQ.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`
                            p-2 md:p-3 lg:p-4 rounded-lg lg:rounded-xl border-2
                            transition-all duration-300
                            ${
                              currentQuestion.isAnswered
                                ? userAnswer?.isCorrect
                                  ? "border-green-300 bg-green-50"
                                  : "border-red-300 bg-red-50"
                                : isActive
                                ? "border-yellow-400 bg-yellow-50 shadow-md"
                                : "border-purple-200 hover:border-purple-300 bg-white"
                            }
                          `}
                        >
                          <div className="space-y-2">
                            {/* Question */}
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-purple-700 text-sm md:text-base lg:text-lg min-w-[20px]">
                                {getSubQuestionLetter(index)})
                              </span>
                              <span className="text-xs md:text-sm lg:text-base text-gray-800 flex-1">
                                {subQ.question}
                              </span>
                            </div>

                            {/* Answer input */}
                            <div className="ml-5 md:ml-6">
                              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                                Your Answer:
                              </label>
                              <div className="flex gap-2">
                                <div className="relative flex-1 max-w-xs">
                                  <input
                                    ref={(el) => {
                                      if (el) inputRefs.current[subQ.id] = el;
                                    }}
                                    type="text"
                                    value={userAnswer?.userAnswer || ""}
                                    onChange={(e) =>
                                      handleInputChange(subQ.id, e.target.value)
                                    }
                                    onFocus={() => handleInputFocus(subQ.id)}
                                    placeholder="Enter answer..."
                                    disabled={currentQuestion.isAnswered}
                                    className={`
                                      w-full p-2 md:p-2.5 lg:p-3 rounded-md lg:rounded-lg border-2 
                                      focus:outline-none font-mono text-xs md:text-sm lg:text-base
                                      transition-all duration-300
                                      ${
                                        currentQuestion.isAnswered
                                          ? userAnswer?.isCorrect
                                            ? "border-green-400 bg-green-50 text-green-800"
                                            : "border-red-400 bg-red-50 text-red-800"
                                          : isActive
                                          ? "border-yellow-500 bg-gradient-to-br from-yellow-200 to-yellow-100 shadow-sm"
                                          : "border-gray-300 focus:border-purple-500 bg-white"
                                      }
                                      disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                  />
                                  {isActive && !currentQuestion.isAnswered && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full text-[10px]">
                                      Active
                                    </div>
                                  )}
                                </div>
                                {subQ.unit && (
                                  <div className="flex items-center px-2 md:px-3 bg-gray-100 rounded-md lg:rounded-lg border-2 border-gray-300">
                                    <span className="text-gray-600 font-semibold text-xs md:text-sm whitespace-nowrap">
                                      {subQ.unit}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Continue button */}
                  <div className="flex items-center justify-center mt-3 md:mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      disabled={!allAnswersFilled || currentQuestion.isAnswered}
                      className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-2 px-4 md:py-2.5 md:px-6 lg:py-3 lg:px-8 rounded-full flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm lg:text-base transform transition-all"
                    >
                      Continue
                      <ArrowRight
                        size={16}
                        className="md:w-4 md:h-4 lg:w-5 lg:h-5"
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed number pad at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-t border-emerald-200 shadow-lg">
        <div className="p-1.5 md:p-2 lg:p-3">
          {/* Mobile/Tablet grid layout */}
          <div className="max-w-md mx-auto lg:hidden">
            <div className="grid grid-cols-5 gap-1 md:gap-1.5">
              {/* Number buttons */}
              {numberButtons.map((btn, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberClick(btn.value)}
                  disabled={currentQuestion?.isAnswered || !activeInputId}
                  className={`
                    ${btn.span === 2 ? "col-span-2" : ""}
                    ${
                      btn.value === "."
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : "bg-gradient-to-br from-emerald-400 to-green-500"
                    }
                    border border-white/70 text-white text-sm md:text-base font-bold 
                    h-8 md:h-10 rounded-md md:rounded-lg hover:brightness-110 transition-all 
                    flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {btn.label}
                </motion.button>
              ))}

              {/* Backspace button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={currentQuestion?.isAnswered || !activeInputId}
                className="col-span-2 bg-gradient-to-br from-gray-400 to-gray-600 border border-white/70 text-white font-bold h-8 md:h-10 rounded-md md:rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Delete size={14} className="md:w-4 md:h-4" />
              </motion.button>

              {/* Clear current button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearCurrent}
                disabled={currentQuestion?.isAnswered || !activeInputId}
                className="bg-gradient-to-br from-red-400 to-red-600 text-white border border-white/70 font-bold h-8 md:h-10 rounded-md md:rounded-lg hover:brightness-110 transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} className="md:w-4 md:h-4" />
              </motion.button>
            </div>
          </div>

          {/* Large screen horizontal layout */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-center gap-1.5 xl:gap-2">
              {/* Backspace button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={currentQuestion?.isAnswered || !activeInputId}
                className="bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white/70 text-white font-bold py-2 px-3 xl:py-2.5 xl:px-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Delete size={18} />
              </motion.button>

              {/* Number buttons 1-9, 0 */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={currentQuestion?.isAnswered || !activeInputId}
                  className="bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {num}
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(".")}
                disabled={currentQuestion?.isAnswered || !activeInputId}
                className="bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                .
              </motion.button>

              {/* Clear current button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearCurrent}
                disabled={currentQuestion?.isAnswered || !activeInputId}
                className="bg-gradient-to-br from-red-400 to-red-600 text-white border-2 border-white/70 text-sm xl:text-base font-bold py-2 px-3 xl:py-2.5 xl:px-4 rounded-lg hover:brightness-110 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordProblemsGameplay;
