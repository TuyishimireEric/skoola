import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Delete, Calculator } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MathEquationQuestion {
  equation: string;
  answer: string;
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  isAnswered: boolean;
  isCorrect?: boolean;
  userAnswer?: string;
}

interface MathEquationGameplayProps {
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

const MathEquationGameplay: React.FC<MathEquationGameplayProps> = ({
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
  const [processedQuestions, setProcessedQuestions] = useState<
    MathEquationQuestion[]
  >([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentQuestion = processedQuestions[currentIndex];

  // Enhanced number formatting with consistent comma placement
  const formatNumberWithCommas = (num: string | number): string => {
    const numStr = typeof num === "number" ? num.toString() : num.toString();

    // Handle negative numbers
    const isNegative = numStr.startsWith("-");
    const absoluteNum = isNegative ? numStr.substring(1) : numStr;

    // Split by decimal point
    const parts = absoluteNum.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Only add commas if the number has 4 or more digits
    let formattedInteger = integerPart;
    if (integerPart.length >= 4) {
      formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Reconstruct the number
    let result = formattedInteger;
    if (decimalPart !== undefined) {
      result += "." + decimalPart;
    }

    return isNegative ? "-" + result : result;
  };

  // Remove commas and extra spaces for comparison
  const normalizeNumberString = (str: string): string => {
    return str
      .replace(/,/g, "") // Remove all commas
      .replace(/\s+/g, "") // Remove all spaces
      .trim();
  };

  // Enhanced equation text formatting with proper number handling
  const formatEquationText = (text: string): string => {
    // Find and format all numbers in the equation
    return text.replace(/\b\d+(?:\.\d+)?\b/g, (match) => {
      const num = parseFloat(match);
      // Only format if it's a valid number and has 4+ digits in integer part
      if (!isNaN(num) && Math.abs(num) >= 1000) {
        return formatNumberWithCommas(match);
      }
      return match;
    });
  };

  // Enhanced equation data parsing with better number handling
  const parseEquationData = (
    equation: string
  ): { equation: string; answer: string } => {
    // Handle different formats: "equation|answer" or just "equation"
    const parts = equation.split("|");
    const originalEquation = parts[0] || equation;
    const originalAnswer = parts[1] || "";

    // Format the equation part
    const formattedEquation = formatEquationText(originalEquation.trim());

    // Format the answer part if it exists
    let formattedAnswer = "";
    if (originalAnswer) {
      const cleanAnswer = normalizeNumberString(originalAnswer);
      // Check if it's a pure number
      const answerNum = parseFloat(cleanAnswer);
      if (!isNaN(answerNum)) {
        formattedAnswer = formatNumberWithCommas(cleanAnswer);
      } else {
        // If not a pure number, format any numbers within it
        formattedAnswer = formatEquationText(originalAnswer.trim());
      }
    }

    return {
      equation: formattedEquation,
      answer: formattedAnswer,
    };
  };

  // Process questions to create equation problems
  useEffect(() => {
    const formatEquationQuestions = (
      questions: QuestionDataI[]
    ): MathEquationQuestion[] => {
      return questions.map((q) => {
        const parsed = parseEquationData(q.QuestionText);

        // Use parsed answer if available, otherwise use CorrectAnswer from question
        let finalAnswer = parsed.answer;
        if (!finalAnswer && q.CorrectAnswer) {
          const cleanCorrectAnswer = normalizeNumberString(q.CorrectAnswer);
          const answerNum = parseFloat(cleanCorrectAnswer);
          if (!isNaN(answerNum)) {
            finalAnswer = formatNumberWithCommas(cleanCorrectAnswer);
          } else {
            finalAnswer = formatEquationText(q.CorrectAnswer);
          }
        }

        return {
          equation: parsed.equation,
          answer: finalAnswer,
          originalQuestion: q.QuestionText,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatEquationQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Update cursor position when user answer changes
  useEffect(() => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || userAnswer.length);
    }
  }, [userAnswer]);

  // Enhanced keyboard event handling with comma support
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
        if (userAnswer.trim()) {
          handleContinue();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "." && !userAnswer.includes(".")) {
        e.preventDefault();
        handleNumberClick(".");
      } else if (e.key === ",") {
        e.preventDefault();
        handleCommaClick();
      } else if (e.key === "-") {
        e.preventDefault();
        handleToggleSign();
      } else if (e.key === "+" && cursorPosition === 0) {
        e.preventDefault();
        handleNumberClick("+");
      } else if (e.key === "*") {
        e.preventDefault();
        handleSymbolClick("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleSymbolClick("÷");
      } else if (e.key === "(") {
        e.preventDefault();
        handleSymbolClick("(");
      } else if (e.key === ")") {
        e.preventDefault();
        handleSymbolClick(")");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userAnswer, currentQuestion, gameOver, showResults, cursorPosition]);

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

  const getHintText = (): string => {
    return "Solve the Mathematical Equation";
  };

  // Enhanced number input with auto-comma formatting
  const handleNumberClick = (value: string) => {
    if (currentQuestion?.isAnswered) return;

    if (userAnswer.length < 50) {
      const start = cursorPosition;
      const newValue =
        userAnswer.substring(0, start) + value + userAnswer.substring(start);

      // Auto-format numbers with commas as user types
      const formattedValue = autoFormatInput(newValue);
      setUserAnswer(formattedValue);

      // Calculate new cursor position accounting for added commas
      const originalLength = newValue.length;
      const formattedLength = formattedValue.length;
      const addedCommas = formattedLength - originalLength;

      setTimeout(() => {
        if (inputRef.current) {
          const newPos = start + value.length + addedCommas;
          inputRef.current.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
          inputRef.current.focus();
        }
      }, 0);
    }

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle comma insertion
  const handleCommaClick = () => {
    if (currentQuestion?.isAnswered) return;

    if (userAnswer.length < 50) {
      const start = cursorPosition;
      const newValue =
        userAnswer.substring(0, start) + "," + userAnswer.substring(start);
      setUserAnswer(newValue);

      setTimeout(() => {
        if (inputRef.current) {
          const newPos = start + 1;
          inputRef.current.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Auto-format input with commas for large numbers
  const autoFormatInput = (input: string): string => {
    // Don't auto-format if user is in the middle of typing a decimal
    if (input.includes(".") && input.split(".")[1] !== undefined) {
      return input;
    }

    // Split by common math operators to format each number separately
    const parts = input.split(/([+\-×÷=()])/);

    return parts
      .map((part) => {
        const trimmed = part.trim();
        // Check if this part is a number
        const cleanNum = normalizeNumberString(trimmed);
        const num = parseFloat(cleanNum);

        if (!isNaN(num) && /^\d+$/.test(cleanNum) && cleanNum.length >= 4) {
          return formatNumberWithCommas(cleanNum);
        }
        return part;
      })
      .join("");
  };

  // Handle toggle sign (+/-)
  const handleToggleSign = () => {
    if (currentQuestion?.isAnswered) return;

    if (userAnswer.startsWith("-")) {
      // Remove negative sign
      const newValue = userAnswer.substring(1);
      setUserAnswer(newValue);
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = Math.max(0, cursorPosition - 1);
          inputRef.current.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
          inputRef.current.focus();
        }
      }, 0);
    } else if (userAnswer === "") {
      // Add negative sign to empty input
      setUserAnswer("-");
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(1, 1);
          setCursorPosition(1);
          inputRef.current.focus();
        }
      }, 0);
    } else {
      // Add negative sign to positive number
      const newValue = "-" + userAnswer;
      setUserAnswer(newValue);
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = cursorPosition + 1;
          inputRef.current.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Handle symbol insertion
  const handleSymbolClick = (symbol: string) => {
    if (currentQuestion?.isAnswered) return;

    if (userAnswer.length < 50) {
      const start = cursorPosition;
      const newValue =
        userAnswer.substring(0, start) + symbol + userAnswer.substring(start);
      setUserAnswer(newValue);

      setTimeout(() => {
        if (inputRef.current) {
          const newPos = start + symbol.length;
          inputRef.current.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Enhanced backspace handling
  const handleBackspace = () => {
    if (currentQuestion?.isAnswered) return;

    if (cursorPosition > 0) {
      const charToDelete = userAnswer[cursorPosition - 1];
      const newValue =
        userAnswer.substring(0, cursorPosition - 1) +
        userAnswer.substring(cursorPosition);

      // If we deleted a comma, check if we need to reformat
      let finalValue = newValue;
      if (charToDelete === "," || /\d/.test(charToDelete)) {
        finalValue = autoFormatInput(newValue);
      }

      setUserAnswer(finalValue);

      setTimeout(() => {
        if (inputRef.current) {
          const lengthDiff = finalValue.length - newValue.length;
          const newPos = Math.max(0, cursorPosition - 1 + lengthDiff);
          inputRef.current.setSelectionRange(newPos, newPos);
          setCursorPosition(newPos);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Handle clear
  const handleClear = () => {
    if (currentQuestion?.isAnswered) return;
    setUserAnswer("");
    setCursorPosition(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input change with auto-formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentQuestion?.isAnswered) return;
    const rawValue = e.target.value;
    const formattedValue = autoFormatInput(rawValue);
    setUserAnswer(formattedValue);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Handle selection change
  const handleSelectionChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  // Enhanced answer normalization for flexible comparison
  const normalizeAnswerForComparison = (answer: string): string => {
    return answer
      .trim()
      .toLowerCase()
      .replace(/,/g, "") // Remove all commas
      .replace(/\s+/g, "") // Remove all spaces
      .replace(/\*/g, "×")
      .replace(/\//g, "÷");
  };

  // Enhanced answer validation with comma-agnostic comparison
  const validateAnswer = (): boolean => {
    if (!currentQuestion || !userAnswer.trim()) return false;

    const normalizedUser = normalizeAnswerForComparison(userAnswer);
    const normalizedCorrect = normalizeAnswerForComparison(
      currentQuestion.answer
    );

    // Direct match (ignoring commas and spaces)
    if (normalizedUser === normalizedCorrect) return true;

    // Try to evaluate as numeric expressions for mathematical equivalence
    try {
      // Simple numeric comparison
      const userNum = parseFloat(normalizedUser);
      const correctNum = parseFloat(normalizedCorrect);

      if (!isNaN(userNum) && !isNaN(correctNum)) {
        // Use a small tolerance for floating point comparison
        return Math.abs(userNum - correctNum) < 0.001;
      }

      // Check for common equivalent forms (without commas)
      const equivalentForms = [
        normalizedCorrect,
        normalizedCorrect.replace(/x=/g, ""),
        normalizedCorrect.replace(/=/g, ""),
        `x=${normalizedCorrect}`,
        normalizedCorrect.replace(/^x/, ""), // Remove leading x
        normalizedCorrect.replace(/x$/, ""), // Remove trailing x
      ];

      return equivalentForms.some(
        (form) => normalizeAnswerForComparison(form) === normalizedUser
      );
    } catch (error) {
      console.log("Error evaluating answer:", error);
      return false;
    }
  };

  // Handle continue to next question
  const handleContinue = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    const isCorrect = validateAnswer();

    // Mark question as answered and set correctness
    setProcessedQuestions((prev) =>
      prev.map((q, qIndex) => {
        if (qIndex === currentIndex) {
          return { ...q, isAnswered: true, isCorrect, userAnswer };
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
        setUserAnswer("");
        setCursorPosition(0);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  // Enhanced number buttons with comma support
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
    { value: "0", label: "0" },
    { value: ",", label: "," },
  ];

  const mathSymbols = [
    { symbol: "×", name: "Multiply", color: "from-pink-400 to-pink-600" },
    { symbol: "÷", name: "Divide", color: "from-pink-400 to-pink-600" },
    { symbol: "+", name: "Plus", color: "from-blue-400 to-blue-600" },
    { symbol: "-", name: "Minus", color: "from-blue-400 to-blue-600" },
    { symbol: "=", name: "Equals", color: "from-green-400 to-green-600" },
    { symbol: "(", name: "Open", color: "from-teal-400 to-teal-600" },
    { symbol: ")", name: "Close", color: "from-teal-400 to-teal-600" },
    { symbol: "√", name: "Root", color: "from-purple-400 to-purple-600" },
    { symbol: "²", name: "Square", color: "from-purple-400 to-purple-600" },
    { symbol: "π", name: "Pi", color: "from-indigo-400 to-indigo-600" },
  ];

  return (
    <div className="fixed inset-0 flex flex-col pt-24 overflow-hidden">
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
        <div className="min-h-full flex items-center justify-center p-2 md:p-3 lg:p-4 pb-36 md:pb-40 lg:pb-44">
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
                <div className="space-y-3 md:space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calculator className="text-emerald-600" size={20} />
                    <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-700">
                      {getHintText()}
                    </h2>
                  </div>

                  {/* Equation display */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className=" p-4  rounded-lg lg:rounded-xl "
                  >
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900 text-center font-mono leading-relaxed">
                      {currentQuestion.equation}
                    </div>
                  </motion.div>

                  {/* Answer input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`
                     rounded-lg lg:rounded-xl
                      transition-all duration-300
                    `}
                  >
                    <div className="space-y-2">
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 text-center">
                        Your Answer:
                      </label>
                      <div className="relative">
                        <textarea
                          ref={inputRef}
                          value={userAnswer}
                          onChange={handleInputChange}
                          onSelect={handleSelectionChange}
                          onKeyUp={handleSelectionChange}
                          onClick={handleSelectionChange}
                          placeholder="Enter your answer..."
                          rows={1}
                          disabled={currentQuestion.isAnswered}
                          className={`
                            w-full p-3 rounded-2xl border-2 
                            focus:outline-none font-mono text-base md:text-lg lg:text-xl 
                            transition-all duration-300 text-center resize-none
                            ${
                              currentQuestion.isAnswered
                                ? currentQuestion.isCorrect
                                  ? "border-green-400 bg-green-50 text-green-800"
                                  : "border-red-400 bg-red-50 text-red-800"
                                : "border-gray-300 focus:border-purple-500 bg-white"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                          style={{
                            minHeight: "3rem",
                            boxShadow:
                              userAnswer && !currentQuestion.isAnswered
                                ? "0 4px 12px rgba(168, 85, 247, 0.2)"
                                : "none",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Continue button */}
                  <div className="flex items-center justify-center mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      disabled={
                        !userAnswer.trim() || currentQuestion.isAnswered
                      }
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
          {/* Mobile/Tablet layout */}
          <div className="max-w-2xl mx-auto lg:hidden">
            {/* Math symbols row */}
            <div className="mb-1.5">
              <div className="grid grid-cols-5 gap-1">
                {mathSymbols.slice(0, 5).map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSymbolClick(item.symbol)}
                    disabled={currentQuestion?.isAnswered}
                    className={`
                      bg-gradient-to-br ${item.color} border border-white/70 text-white text-xs md:text-sm font-bold 
                      h-7 md:h-8 rounded-md hover:brightness-110 transition-all 
                      flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    title={item.name}
                  >
                    {item.symbol}
                  </motion.button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {mathSymbols.slice(5, 10).map((item, index) => (
                  <motion.button
                    key={index + 5}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSymbolClick(item.symbol)}
                    disabled={currentQuestion?.isAnswered}
                    className={`
                      bg-gradient-to-br ${item.color} border border-white/70 text-white text-xs md:text-sm font-bold 
                      h-7 md:h-8 rounded-md hover:brightness-110 transition-all 
                      flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    title={item.name}
                  >
                    {item.symbol}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Numbers grid */}
            <div className="grid grid-cols-6 gap-1">
              {/* Number buttons */}
              {numberButtons.map((btn, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (btn.value === ",") {
                      handleCommaClick();
                    } else {
                      handleNumberClick(btn.value);
                    }
                  }}
                  disabled={currentQuestion?.isAnswered}
                  className={`
                    ${
                      btn.value === "." || btn.value === ","
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : "bg-gradient-to-br from-orange-400 to-red-500"
                    }
                    border border-white/70 text-white text-sm md:text-base font-bold 
                    h-8 md:h-10 rounded-md hover:brightness-110 transition-all 
                    flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {btn.label}
                </motion.button>
              ))}

              {/* Plus/Minus toggle button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleSign}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-purple-400 to-purple-600 border border-white/70 text-white font-bold h-8 md:h-10 rounded-md hover:brightness-110 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xs md:text-sm">±</span>
              </motion.button>

              {/* Backspace button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-gray-400 to-gray-600 border border-white/70 text-white font-bold h-8 md:h-10 rounded-md hover:brightness-110 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Delete size={14} className="md:w-4 md:h-4" />
              </motion.button>

              {/* Clear button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-red-400 to-red-600 text-white border border-white/70 font-bold h-8 md:h-10 rounded-md hover:brightness-110 transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} className="md:w-4 md:h-4" />
              </motion.button>
            </div>
          </div>

          {/* Large screen horizontal layout */}
          <div className="hidden lg:block">
            {/* Math symbols row */}
            <div className="mb-2">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {mathSymbols.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSymbolClick(item.symbol)}
                    disabled={currentQuestion?.isAnswered}
                    className={`
                      bg-gradient-to-br ${item.color} border-2 border-white/70 text-white 
                      text-sm font-bold py-1.5 px-3 
                      rounded-lg hover:brightness-110 transition-all flex items-center justify-center 
                      shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] h-9
                    `}
                    title={item.name}
                  >
                    {item.symbol}
                  </motion.button>
                ))}

                {/* Plus/Minus toggle button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleSign}
                  disabled={currentQuestion?.isAnswered}
                  className="bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white/70 text-white text-sm font-bold py-1.5 px-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] h-9"
                >
                  ±
                </motion.button>
              </div>
            </div>

            {/* Numbers row */}
            <div className="flex items-center justify-center gap-1.5 xl:gap-2 flex-wrap">
              {/* Number buttons 1-9, 0 */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={currentQuestion?.isAnswered}
                  className="bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {num}
                </motion.button>
              ))}

              {/* Decimal point button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(".")}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                .
              </motion.button>

              {/* Comma button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCommaClick}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ,
              </motion.button>

              {/* Clear button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={currentQuestion?.isAnswered}
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

export default MathEquationGameplay;
