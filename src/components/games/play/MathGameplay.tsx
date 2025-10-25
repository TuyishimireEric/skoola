import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Delete, RotateCcw, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MathQuestion {
  beforeInput: string;
  afterInput: string;
  answer: string;
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  unit?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface MathGameplayProps {
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

const MathGameplay: React.FC<MathGameplayProps> = ({
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
  const [processedQuestions, setProcessedQuestions] = useState<MathQuestion[]>(
    []
  );

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuestion = processedQuestions[currentIndex];

  // Enhanced question processing to handle all types
  useEffect(() => {
    const formatMathQuestions = (
      questions: QuestionDataI[]
    ): MathQuestion[] => {
      return questions.map((q) => {
        const equation = q.QuestionText.trim();

        // Extract unit if present (like cm, mm, etc.)
        const unitMatch = equation.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
        const hasUnits = unitMatch !== null;

        // Find all numbers in the equation
        const numbers = [];
        const numberRegex = /\d+(?:\.\d+)?/g;
        let match;
        while ((match = numberRegex.exec(equation)) !== null) {
          numbers.push({
            value: match[0],
            start: match.index,
            end: match.index + match[0].length,
          });
        }

        if (numbers.length === 0) {
          // Fallback for non-standard formats
          return {
            beforeInput: equation.replace(/=.*/, "= "),
            afterInput: "",
            answer: q.CorrectAnswer || "0",
            originalQuestion: equation,
            explanation: q.Explanation,
            difficulty: q.Difficulty,
            isAnswered: false,
          };
        }

        // Randomly select one number to hide
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const selectedNumber = numbers[randomIndex];

        // Extract unit from the selected number if it exists
        let unit = "";
        if (hasUnits) {
          const afterNumber = equation.substring(selectedNumber.end);
          const unitMatch = afterNumber.match(/^\s*([a-zA-Z]+)/);
          if (unitMatch) {
            unit = unitMatch[1];
          }
        }

        // Create the question with the selected number hidden
        const beforeInput = equation.substring(0, selectedNumber.start);
        const afterInput = equation.substring(selectedNumber.end);

        return {
          beforeInput,
          afterInput,
          answer: selectedNumber.value,
          originalQuestion: equation,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          unit,
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatMathQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Reset states when question changes
  useEffect(() => {
    setUserAnswer("");
    setShowHint(false);
  }, [currentIndex]);

  // Enhanced keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentQuestion?.isAnswered) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleNumberClick(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (userAnswer.trim()) {
          handleContinue();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "." && !userAnswer.includes(".")) {
        e.preventDefault();
        handleNumberClick(".");
      } else if (e.key === "-" && userAnswer === "") {
        e.preventDefault();
        handleNumberClick("-");
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

  const getHintText = (question: MathQuestion): string => {
    if (question.unit) {
      return `Find the missing number (answer in ${question.unit})`;
    }
    return "Find the missing number";
  };

  const handleNumberClick = (value: string) => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (userAnswer.length < 15) {
      setUserAnswer((prev) => prev + value);
    }
  };

  const handleBackspace = () => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setUserAnswer((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    setUserAnswer("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentQuestion?.isAnswered) return;

    const value = e.target.value;
    // Allow numbers, decimal point, and negative sign
    if (/^[+-]?\d*\.?\d*$/.test(value) && value.length <= 15) {
      setUserAnswer(value);
    }
  };

  // Enhanced answer validation
  const validateAnswer = (): boolean => {
    if (!currentQuestion || !userAnswer.trim()) return false;

    const userInput = userAnswer.trim();
    const correctAnswer = currentQuestion.answer.trim();

    // Direct string comparison first
    if (userInput === correctAnswer) return true;

    // Numeric comparison for decimal/integer equivalence
    const userNum = parseFloat(userInput);
    const correctNum = parseFloat(correctAnswer);

    if (!isNaN(userNum) && !isNaN(correctNum)) {
      // Allow for small floating point differences
      return Math.abs(userNum - correctNum) < 0.001;
    }

    return false;
  };

  // Handle continue to next question
  const handleContinue = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

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

  const handleShowHint = () => {
    setShowHint(true);
  };

  // Check if user has answered
  const hasAnswered = (): boolean => {
    return userAnswer.trim() !== "";
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

      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-2 md:p-4  min-h-[50vh] lg:min-h-[60vh]">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl flex flex-col gap-4"
            >
              {/* Question area */}
              <motion.div className="rounded-2xl lg:rounded-3xl p-3 ">
                <div className="text-center space-y-3 md:space-y-6">
                  <h2 className="text-sm md:text-xl lg:text-2xl font-bold text-gray-700 lg:mb-8">
                    {getHintText(currentQuestion)}
                  </h2>

                  {/* Enhanced equation display */}
                  <div className="flex items-center justify-center flex-wrap gap-1 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.beforeInput && (
                      <span className="whitespace-pre-wrap break-words">
                        {currentQuestion.beforeInput}
                      </span>
                    )}

                    {/* Enhanced input field */}
                    <div className="relative inline-block">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userAnswer}
                        onChange={handleInputChange}
                        className={`
                          w-28 sm:w-32 md:w-36 lg:w-40 xl:w-48 px-2 md:px-3 lg:px-4 py-1 md:py-2 lg:py-3 xl:py-4 
                          text-center rounded-lg md:rounded-2xl border-2 lg:border-4 focus:outline-none 
                          font-bold text-gray-800 placeholder-gray-400 transition-all duration-300
                          ${
                            currentQuestion.isAnswered
                              ? "bg-gray-100 border-gray-300 text-gray-600"
                              : "bg-gradient-to-br from-yellow-200 to-yellow-100 border-yellow-500 focus:ring-2 focus:ring-yellow-400"
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        placeholder="?"
                        disabled={currentQuestion.isAnswered}
                        maxLength={7}
                        style={{
                          fontSize: "inherit",
                          boxShadow:
                            userAnswer && !currentQuestion.isAnswered
                              ? "0 8px 20px rgba(251, 191, 36, 0.3)"
                              : "none",
                        }}
                      />
                      {currentQuestion.unit && (
                        <span className="ml-1 text-sm md:text-base lg:text-lg text-gray-600">
                          {currentQuestion.unit}
                        </span>
                      )}
                    </div>

                    {currentQuestion.afterInput && (
                      <span className="whitespace-pre-wrap break-words">
                        {currentQuestion.afterInput}
                      </span>
                    )}
                  </div>

                  {/* Hint display */}
                  {showHint && currentQuestion.explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-blue-800"
                    >
                      <p className="font-semibold text-sm md:text-base">
                        💡 Hint: {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-6 mb-4">
                {!showHint &&
                  currentQuestion?.explanation &&
                  currentQuestion.explanation.trim() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShowHint}
                      disabled={currentQuestion.isAnswered}
                      className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-10 xl:py-5 xl:px-12 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HelpCircle
                        size={16}
                        className="md:w-5 md:h-5 lg:w-6 lg:h-6"
                      />
                      <span className="hidden sm:inline lg:inline">
                        Get Help
                      </span>
                      <span className="sm:hidden lg:hidden">Help</span>
                    </motion.button>
                  )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinue}
                  disabled={!hasAnswered() || currentQuestion.isAnswered}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-8 md:py-4 md:px-12 lg:py-5 lg:px-16 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transform transition-all"
                >
                  Continue
                  <ArrowRight
                    size={16}
                    className="md:w-5 md:h-5 lg:w-6 lg:h-6"
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Number pad */}
      <div className="relative z-20 bg-white/40 backdrop-blur-sm border-t border-orange-200 p-2 md:p-3 lg:p-4">
        {/* Mobile/Tablet grid layout */}
        <div className="max-w-lg mx-auto lg:hidden pb-2">
          <div className="grid grid-cols-5 gap-2 md:gap-2">
            {/* Number buttons */}
            {numberButtons.map((btn, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(btn.value)}
                disabled={currentQuestion?.isAnswered}
                className={`
                  ${btn.span === 2 ? "col-span-2" : ""}
                  ${
                    btn.value === "."
                      ? "bg-gradient-to-br from-blue-400 to-blue-600"
                      : "bg-gradient-to-br from-yellow-400 to-orange-500"
                  }
                  border-2 border-white/70 text-white text-lg md:text-xl font-bold 
                  h-12 md:h-14 rounded-xl hover:brightness-110 transition-all 
                  flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                `}
                style={{ touchAction: "manipulation" }}
              >
                {btn.label}
              </motion.button>
            ))}

            {/* Clear button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              disabled={currentQuestion?.isAnswered}
              className="bg-gradient-to-br from-red-400 to-red-600 text-white border-2 border-white/70 font-bold h-12 md:h-14 rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <RotateCcw size={18} className="md:w-5 md:h-5" />
            </motion.button>

            {/* Backspace button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackspace}
              disabled={currentQuestion?.isAnswered}
              className="bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white/70 text-white col-span-2 font-bold h-12 md:h-14 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <Delete size={18} className="md:w-5 md:h-5" />
            </motion.button>
          </div>
        </div>

        {/* Large screen horizontal layout */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            {/* Backspace button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackspace}
              disabled={currentQuestion?.isAnswered}
              className="bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-white/70 text-white font-bold py-3 px-4 md:py-4  rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <Delete size={20} />
            </motion.button>

            {/* Number buttons 1-9, 0 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(num.toString())}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white/70 text-white text-xl md:text-2xl font-bold w-12 h-12 md:w-16 md:h-16 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ touchAction: "manipulation" }}
              >
                {num}
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick(".")}
              disabled={currentQuestion?.isAnswered}
              className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white/70 text-white text-xl md:text-2xl  font-bold w-12 h-12 md:w-16 md:h-16 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              .
            </motion.button>

            {/* Clear button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              disabled={currentQuestion?.isAnswered}
              className="bg-gradient-to-br from-red-400 to-red-600 text-white border-4 border-white/70 text-sm md:text-lg lg:text-xl font-bold py-3 px-4 md:py-4 rounded-xl hover:brightness-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              Clear
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathGameplay;
