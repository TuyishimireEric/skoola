import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, RotateCcw, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ComparisonQuestion {
  beforeInput: string;
  afterInput: string;
  answer: string;
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  leftValue: string;
  rightValue: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface ComparisonGameplayProps {
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

const ComparisonGameplay: React.FC<ComparisonGameplayProps> = ({
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
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(game.Duration || 300);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<
    ComparisonQuestion[]
  >([]);

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const currentQuestion = processedQuestions[currentIndex];

  // Comparison operators
  const comparisonOperators = [
    { value: ">", label: ">", description: "Greater than" },
    { value: "<", label: "<", description: "Less than" },
    { value: "=", label: "=", description: "Equal to" },
  ];

  // Process questions to create comparison problems
  useEffect(() => {
    const formatComparisonQuestions = (
      questions: QuestionDataI[]
    ): ComparisonQuestion[] => {
      return questions.map((q) => {
        const equation = q.QuestionText;

        // Parse comparison patterns
        const patterns = [/^(.+?)\s*(>=|<=|>|<|=)\s*(.+?)$/];

        for (const pattern of patterns) {
          const match = equation.match(pattern);
          if (match) {
            const [, leftValue, operator, rightValue] = match;

            return {
              beforeInput: `${leftValue.trim()} `,
              afterInput: ` ${rightValue.trim()}`,
              answer: operator,
              originalQuestion: equation,
              explanation: q.Explanation,
              difficulty: q.Difficulty,
              leftValue: leftValue.trim(),
              rightValue: rightValue.trim(),
              isAnswered: false,
            };
          }
        }

        // Fallback parsing if no pattern matches
        const parts = equation.split(/\s*(>=|<=|>|<|=)\s*/);
        if (parts.length >= 3) {
          return {
            beforeInput: `${parts[0]} `,
            afterInput: ` ${parts[2]}`,
            answer: parts[1] || "=",
            originalQuestion: equation,
            explanation: q.Explanation,
            difficulty: q.Difficulty,
            leftValue: parts[0],
            rightValue: parts[2],
            isAnswered: false,
          };
        }

        return {
          beforeInput: equation.replace(/[>=<]/g, " "),
          afterInput: "",
          answer: q.CorrectAnswer || "=",
          originalQuestion: equation,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          leftValue: "",
          rightValue: "",
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatComparisonQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Reset states when question changes
  useEffect(() => {
    setUserAnswer("");
    setShowHint(false);
  }, [currentIndex]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentQuestion?.isAnswered) return;

      // Handle comparison operator keys
      if (e.key === ">" || (e.key === "." && e.shiftKey)) {
        e.preventDefault();
        handleOperatorClick(">");
      } else if (e.key === "<" || (e.key === "," && e.shiftKey)) {
        e.preventDefault();
        handleOperatorClick("<");
      } else if (e.key === "=" || e.key === "Enter") {
        e.preventDefault();
        if (e.key === "=") {
          handleOperatorClick("=");
        } else if (userAnswer.trim()) {
          handleContinue();
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userAnswer, currentQuestion]);

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
        // Unanswered questions are considered missed
        missedQuestions.push(questions[index].Id || "");
      }
    });

    const completedOn = new Date().toISOString();
    const timeSpent = (game.Duration || 300) - timeLeft;

    // Calculate percentage for current game type only
    const currentGameScore =
      processedQuestions.length > 0
        ? ((sectionCorrectCount / processedQuestions.length) * 100).toFixed(2)
        : "0";

    onComplete({
      Score: currentGameScore,
      MissedQuestions: missedQuestions.join(", "),
      StartedOn: startTime,
      CompletedOn: completedOn,
      TimeSpent: timeSpent,
    });
  };

  const getHintText = (): string => {
    return "Choose the correct comparison operator";
  };

  // Handle operator selection
  const handleOperatorClick = (operator: string) => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setUserAnswer(operator);
  };

  // Handle clear
  const handleClear = () => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    setUserAnswer("");
  };

  // Validate answer
  const validateAnswer = (): boolean => {
    if (!currentQuestion || !userAnswer.trim()) return false;
    return userAnswer.trim() === currentQuestion.answer;
  };

  // Check if user has answered
  const hasAnswered = (): boolean => {
    return userAnswer.trim() !== "";
  };

  // Handle continue to next question
  const handleContinue = () => {
    if (!currentQuestion || !hasAnswered()) return;

    const isCorrect = validateAnswer();

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
      setTotalScore(totalScore + 1);
      // Success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      // Error haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    // Move to next question or finish
    setTimeout(
      () => {
        if (currentIndex < processedQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          const newCurrentQuestionIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(newCurrentQuestionIndex);
          setUserAnswer("");
          setShowHint(false);
        } else {
          setShowResults(true);
        }
      },
      isCorrect ? 2000 : 300
    );
  };

  // Show hint
  const handleShowHint = () => {
    setShowHint(true);
  };

  return (
    <div className="fixed inset-0 flex flex-col pt-16 overflow-hidden">
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
        <div className="min-h-full flex items-center justify-center p-2 md:p-3 lg:p-4 pb-24 md:pb-28 lg:pb-32">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
              >
                {/* Question area */}
                <motion.div className="rounded-lg lg:rounded-xl shadow-md p-3 md:p-4 lg:p-6 border-2 border-orange-200 bg-white/90">
                  <div className="text-center space-y-3 md:space-y-4">
                    <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-700">
                      {getHintText()}
                    </h2>

                    {/* Comparison with missing operator */}
                    <div className="flex items-center justify-center gap-1 md:gap-2 lg:gap-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800">
                      <span className="whitespace-nowrap">
                        {currentQuestion.beforeInput}
                      </span>

                      {/* Operator selection area */}
                      <div className="relative">
                        <div
                          className={`
                            w-12 sm:w-14 md:w-16 lg:w-20 xl:w-24 px-2 md:px-3 lg:px-4 py-1 md:py-2 lg:py-3
                            text-center rounded-md lg:rounded-lg border-2 lg:border-3
                            flex items-center justify-center min-h-[2em] transition-all duration-300
                            ${
                              currentQuestion.isAnswered
                                ? "bg-gray-100 border-gray-300 text-gray-600"
                                : "bg-gradient-to-br from-yellow-200 to-yellow-100 border-yellow-500 text-gray-800"
                            }
                          `}
                          style={{
                            fontSize: "inherit",
                            boxShadow:
                              userAnswer && !currentQuestion.isAnswered
                                ? "0 4px 12px rgba(251, 191, 36, 0.3)"
                                : "none",
                          }}
                        >
                          {userAnswer || "?"}
                        </div>
                      </div>

                      <span className="whitespace-nowrap">
                        {currentQuestion.afterInput}
                      </span>
                    </div>

                    {/* Hint display */}
                    {showHint &&
                      currentQuestion?.explanation &&
                      currentQuestion.explanation.trim() && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 md:p-3 lg:p-4 mt-3 text-left"
                        >
                          <div className="flex items-start gap-2">
                            <div className="text-base md:text-lg">💡</div>
                            <div>
                              <p className="font-semibold text-yellow-800 mb-1 text-xs md:text-sm">
                                Hint:
                              </p>
                              <p className="text-yellow-700 text-xs md:text-sm">
                                {currentQuestion.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                  </div>
                </motion.div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-2 md:gap-3 mt-4">
                  {!showHint &&
                    currentQuestion?.explanation &&
                    currentQuestion.explanation.trim() && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShowHint}
                        disabled={currentQuestion.isAnswered}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-3 md:py-2.5 md:px-4 lg:py-3 lg:px-6 rounded-full flex items-center gap-1.5 shadow-md text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <HelpCircle size={14} className="md:w-4 md:h-4" />
                        <span>Get Help</span>
                      </motion.button>
                    )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinue}
                    disabled={!hasAnswered() || currentQuestion.isAnswered}
                    className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-2 px-4 md:py-2.5 md:px-6 lg:py-3 lg:px-8 rounded-full flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm lg:text-base transform transition-all"
                  >
                    Continue
                    <ArrowRight
                      size={16}
                      className="md:w-4 md:h-4 lg:w-5 lg:h-5"
                    />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed comparison operators pad at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-t border-orange-200 shadow-lg">
        <div className="p-1.5 md:p-2 lg:p-3">
          {/* Mobile/Tablet layout */}
          <div className="max-w-md mx-auto lg:hidden">
            <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-1.5">
              {/* Main comparison operators */}
              {comparisonOperators.map((op) => (
                <motion.button
                  key={op.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOperatorClick(op.value)}
                  disabled={currentQuestion?.isAnswered}
                  className={`
                    bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white/70 text-white
                    text-lg md:text-xl font-bold h-12 md:h-14 rounded-lg hover:brightness-110 
                    transition-all flex items-center justify-center shadow-md
                    ${
                      userAnswer === op.value
                        ? "ring-2 ring-yellow-300 ring-offset-1"
                        : ""
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={op.description}
                  style={{ touchAction: "manipulation" }}
                >
                  {op.label}
                </motion.button>
              ))}
            </div>

            {/* Clear button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              disabled={currentQuestion?.isAnswered}
              className="w-full bg-gradient-to-br from-red-400 to-red-600 text-white border-2 border-white/70 font-bold h-10 md:h-12 rounded-lg hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <RotateCcw size={16} className="md:w-4 md:h-4" />
              <span className="text-sm md:text-base">Clear</span>
            </motion.button>
          </div>

          {/* Large screen horizontal layout */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-center gap-2 xl:gap-3">
              {/* All comparison operators */}
              {comparisonOperators.map((op) => (
                <motion.button
                  key={op.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOperatorClick(op.value)}
                  disabled={currentQuestion?.isAnswered}
                  className={`
                    bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white/70 text-white 
                    text-xl xl:text-2xl font-bold w-16 h-16 xl:w-20 xl:h-20 rounded-lg xl:rounded-xl
                    hover:brightness-110 transition-all flex items-center justify-center shadow-md
                    ${
                      userAnswer === op.value
                        ? "ring-2 ring-yellow-300 ring-offset-2"
                        : ""
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={op.description}
                  style={{ touchAction: "manipulation" }}
                >
                  {op.label}
                </motion.button>
              ))}

              {/* Clear button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-red-400 to-red-600 text-white border-2 border-white/70 text-base xl:text-lg font-bold py-4 px-6 xl:py-5 xl:px-8 rounded-lg xl:rounded-xl hover:brightness-110 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ touchAction: "manipulation" }}
              >
                <RotateCcw size={18} />
                Clear
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonGameplay;
