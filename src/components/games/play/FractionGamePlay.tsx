import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FractionQuestion {
  fractionEquation: string;
  answer: string;
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  answerNumerator: string;
  answerDenominator: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface FractionGameplayProps {
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

const FractionGameplay: React.FC<FractionGameplayProps> = ({
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
  const [userNumerator, setUserNumerator] = useState("");
  const [userDenominator, setUserDenominator] = useState("");
  const [activeInput, setActiveInput] = useState<
    "numerator" | "denominator" | null
  >(null);
  const [timeLeft, setTimeLeft] = useState(game.Duration || 300);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<
    FractionQuestion[]
  >([]);

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const numeratorRef = useRef<HTMLInputElement>(null);
  const denominatorRef = useRef<HTMLInputElement>(null);
  const currentQuestion = processedQuestions[currentIndex];

  // Enhanced Fraction Component with better styling
  const FractionComponent = ({
    numerator,
    denominator,
    isInput = false,
    placeholder = "?",
    size = "normal",
  }: {
    numerator: string;
    denominator: string;
    isInput?: boolean;
    placeholder?: string;
    size?: "small" | "normal" | "large";
  }) => {
    const sizeClasses: {
      [key in "small" | "normal" | "large"]: {
        input: string;
        text: string;
        line: string;
      };
    } = {
      small: {
        input: "w-12 h-10 text-lg",
        text: "text-lg",
        line: "w-16 h-0.5 my-1",
      },
      normal: {
        input: "w-16 h-12 text-xl md:text-2xl",
        text: "text-xl md:text-2xl",
        line: "w-20 h-0.5 md:h-1 my-2",
      },
      large: {
        input: "w-24 h-16 md:h-20 text-2xl md:text-3xl lg:text-4xl",
        text: "text-2xl md:text-3xl lg:text-4xl",
        line: "w-28 md:w-32 h-1 md:h-2 my-3 md:my-4",
      },
    };

    const currentSize = sizeClasses[size] || sizeClasses.normal;

    if (isInput) {
      return (
        <div className="inline-flex flex-col items-center mx-2">
          {/* Numerator input */}
          <input
            ref={numeratorRef}
            type="text"
            value={numerator}
            onChange={() => {}} // Controlled by buttons
            onFocus={() => handleInputFocus("numerator")}
            placeholder={placeholder}
            disabled={currentQuestion?.isAnswered}
            className={`
              ${currentSize.input} text-center font-bold min-w-32
              rounded-xl border-3 lg:border-4 focus:outline-none transition-all duration-300 cursor-pointer
              ${
                currentQuestion?.isAnswered
                  ? "bg-gray-100 border-gray-300 text-gray-600"
                  : activeInput === "numerator"
                  ? "bg-yellow-200 border-yellow-500 text-gray-800 shadow-lg"
                  : "bg-white border-pink-400 text-gray-800"
              }
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
            style={{
              boxShadow:
                activeInput === "numerator" && !currentQuestion?.isAnswered
                  ? "0 8px 20px rgba(251, 191, 36, 0.3)"
                  : "none",
            }}
            readOnly
          />

          {/* Fraction line */}
          <div
            className={`${currentSize.line} min-w-24 bg-gray-800 rounded-full`}
          ></div>

          {/* Denominator input */}
          <input
            ref={denominatorRef}
            type="text"
            value={denominator}
            onChange={() => {}} // Controlled by buttons
            onFocus={() => handleInputFocus("denominator")}
            placeholder={placeholder}
            disabled={currentQuestion?.isAnswered}
            className={`
              ${currentSize.input} text-center font-bold min-w-32 p-2
              rounded-xl border-3 lg:border-4 focus:outline-none transition-all duration-300 cursor-pointer
              ${
                currentQuestion?.isAnswered
                  ? "bg-gray-100 border-gray-300 text-gray-600"
                  : activeInput === "denominator"
                  ? "bg-yellow-200 border-yellow-500 text-gray-800 shadow-lg"
                  : "bg-white border-pink-400 text-gray-800"
              }
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
            style={{
              boxShadow:
                activeInput === "denominator" && !currentQuestion?.isAnswered
                  ? "0 8px 20px rgba(251, 191, 36, 0.3)"
                  : "none",
            }}
            readOnly
          />
        </div>
      );
    }

    // Display fraction (non-input)
    return (
      <div className="inline-flex flex-col items-center mx-1">
        <div
          className={`${currentSize.text} font-bold text-gray-800 leading-none text-3xl`}
        >
          {numerator}
        </div>
        <div className={`${currentSize.line} bg-gray-800 rounded-full`}></div>
        <div
          className={`${currentSize.text} font-bold text-gray-800 leading-none text-3xl`}
        >
          {denominator}
        </div>
      </div>
    );
  };

  // Parse and render fraction equation with proper formatting
  const renderFractionEquation = (equation: string) => {
    // Split by spaces and process each part
    const parts = equation.split(" ");

    return (
      <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4">
        {parts.map((part, index) => {
          // Check if part is a fraction (contains /)
          if (part.includes("/") && part !== "=") {
            const [num, den] = part.split("/");
            return (
              <FractionComponent
                key={index}
                numerator={formatNumber(num)}
                denominator={formatNumber(den)}
                size="normal"
              />
            );
          }

          // Regular text (operators, etc.)
          return (
            <span
              key={index}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800"
            >
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  // Format numbers with spaces for thousands separator
  const formatNumber = (num: string | number): string => {
    const numStr = typeof num === "number" ? num.toString() : num;
    const parts = numStr.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add spaces every 3 digits from right to left
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  // Format equation text to include proper number formatting
  const formatEquationText = (text: string): string => {
    // Find all numbers in the text and format them
    return text.replace(/\b\d{4,}\b/g, (match) => formatNumber(match));
  };

  // Parse fraction data from equation string
  const parseFractionData = (
    equation: string
  ): { fractionEquation: string; answer: string } => {
    const parts = equation.split("|");
    const originalEquation = parts[0] || equation;
    const originalAnswer = parts[1] || "";

    return {
      fractionEquation: formatEquationText(originalEquation),
      answer: originalAnswer,
    };
  };

  // Parse answer to get numerator and denominator
  const parseAnswer = (
    answer: string
  ): { numerator: string; denominator: string } => {
    const fractionMatch = answer.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      return {
        numerator: formatNumber(fractionMatch[1]),
        denominator: formatNumber(fractionMatch[2]),
      };
    }
    return { numerator: "", denominator: "" };
  };

  // Process questions to create fraction problems
  useEffect(() => {
    const formatFractionQuestions = (
      questions: QuestionDataI[]
    ): FractionQuestion[] => {
      return questions.map((q) => {
        const parsed = parseFractionData(q.QuestionText);
        const answerParts = parseAnswer(parsed.answer);
        return {
          fractionEquation: parsed.fractionEquation,
          answer: parsed.answer,
          originalQuestion: q.QuestionText,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          answerNumerator: answerParts.numerator,
          answerDenominator: answerParts.denominator,
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatFractionQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Reset states when question changes
  useEffect(() => {
    setUserNumerator("");
    setUserDenominator("");
    setActiveInput(null);
  }, [currentIndex]);

  // Keyboard event handling
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
        if (hasAnswered()) {
          handleContinue();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "-") {
        e.preventDefault();
        handleToggleSign();
      } else if (e.key === "Tab") {
        e.preventDefault();
        // Switch between numerator and denominator
        if (activeInput === "numerator") {
          setActiveInput("denominator");
          denominatorRef.current?.focus();
        } else {
          setActiveInput("numerator");
          numeratorRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userNumerator, userDenominator, activeInput, currentQuestion]);

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

  // Get hint text
  const getHintText = (): string => {
    return "Complete the fraction equation";
  };

  // Handle number input
  const handleNumberClick = (value: string) => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (activeInput === "numerator") {
      if (userNumerator.length < 10) {
        setUserNumerator((prev) => prev + value);
      }
    } else if (activeInput === "denominator") {
      if (userDenominator.length < 10) {
        setUserDenominator((prev) => prev + value);
      }
    }
  };

  // Handle toggle sign (+/-)
  const handleToggleSign = () => {
    if (!activeInput || currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (activeInput === "numerator") {
      if (userNumerator.startsWith("-")) {
        // Remove negative sign
        setUserNumerator(userNumerator.substring(1));
      } else if (userNumerator === "") {
        // Add negative sign to empty input
        setUserNumerator("-");
      } else {
        // Add negative sign to positive number
        setUserNumerator("-" + userNumerator);
      }
    } else if (activeInput === "denominator") {
      if (userDenominator.startsWith("-")) {
        // Remove negative sign
        setUserDenominator(userDenominator.substring(1));
      } else if (userDenominator === "") {
        // Add negative sign to empty input
        setUserDenominator("-");
      } else {
        // Add negative sign to positive number
        setUserDenominator("-" + userDenominator);
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (activeInput === "numerator") {
      setUserNumerator((prev) => prev.slice(0, -1));
    } else if (activeInput === "denominator") {
      setUserDenominator((prev) => prev.slice(0, -1));
    }
  };

  // Handle clear
  const handleClear = () => {
    if (currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    setUserNumerator("");
    setUserDenominator("");
    setActiveInput(null);
  };

  // Handle input focus
  const handleInputFocus = (inputType: "numerator" | "denominator") => {
    if (!currentQuestion?.isAnswered) {
      setActiveInput(inputType);
    }
  };

  // Normalize answer for comparison (remove spaces and formatting)
  const normalizeAnswer = (answer: string): string => {
    return answer.trim().replace(/\s+/g, "");
  };

  // Validate answer
  const validateAnswer = (): boolean => {
    if (!currentQuestion || !userNumerator.trim() || !userDenominator.trim())
      return false;

    const normalizedUserNum = normalizeAnswer(userNumerator);
    const normalizedUserDen = normalizeAnswer(userDenominator);
    const normalizedCorrectNum = normalizeAnswer(
      currentQuestion.answerNumerator
    );
    const normalizedCorrectDen = normalizeAnswer(
      currentQuestion.answerDenominator
    );

    const userNum = parseInt(normalizedUserNum);
    const userDen = parseInt(normalizedUserDen);
    const correctNum = parseInt(normalizedCorrectNum);
    const correctDen = parseInt(normalizedCorrectDen);

    // Check for exact match
    if (userNum === correctNum && userDen === correctDen) return true;

    // Check for equivalent fractions by cross multiplication
    if (
      !isNaN(userNum) &&
      !isNaN(userDen) &&
      !isNaN(correctNum) &&
      !isNaN(correctDen)
    ) {
      if (userDen !== 0 && correctDen !== 0) {
        return userNum * correctDen === correctNum * userDen;
      }
    }

    return false;
  };

  // Check if user has answered both parts
  const hasAnswered = (): boolean => {
    return userNumerator.trim() !== "" && userDenominator.trim() !== "";
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
          setUserNumerator("");
          setUserDenominator("");
          setActiveInput(null);
        } else {
          setShowResults(true);
        }
      },
      isCorrect ? 2000 : 300
    );
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
    <div className="relative w-full font-comic overflow-hidden flex flex-col min-h-screen">
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
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-2 md:p-4">
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
              <motion.div className="rounded-2xl lg:rounded-3xl p-3">
                <div className="text-center space-y-3 md:space-y-6">
                  <h2 className="text-sm md:text-xl lg:text-2xl font-bold text-gray-700 lg:mb-8">
                    {getHintText()}
                  </h2>

                  {/* Enhanced Fraction equation display with inline answer */}
                  <div className="flex items-center justify-center flex-wrap gap-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-relaxed">
                    <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4">
                      {/* Render the question part */}
                      {currentQuestion.fractionEquation.includes("=") ? (
                        <>
                          {renderFractionEquation(
                            currentQuestion.fractionEquation
                          )}
                          {/* Interactive answer fraction directly inline */}
                          <FractionComponent
                            numerator={userNumerator}
                            denominator={userDenominator}
                            isInput={true}
                            placeholder="?"
                            size="normal"
                          />
                        </>
                      ) : (
                        <>
                          {renderFractionEquation(
                            currentQuestion.fractionEquation
                          )}
                          <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mx-2">
                            =
                          </span>
                          {/* Interactive answer fraction directly inline */}
                          <FractionComponent
                            numerator={userNumerator}
                            denominator={userDenominator}
                            isInput={true}
                            placeholder="?"
                            size="normal"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-6 mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinue}
                  disabled={!hasAnswered() || currentQuestion.isAnswered}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-8 md:py-4 md:px-12 lg:py-6 lg:px-16 xl:py-7 xl:px-20 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg lg:text-xl transform transition-all border-2 border-white/30"
                >
                  Continue
                  <ArrowRight
                    size={18}
                    className="md:w-6 md:h-6 lg:w-7 lg:h-7"
                  />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                  disabled={currentQuestion?.isAnswered}
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
                disabled={currentQuestion?.isAnswered}
                className="col-span-2 bg-gradient-to-br from-gray-400 to-gray-600 border border-white/70 text-white font-bold h-8 md:h-10 rounded-md md:rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Delete size={14} className="md:w-4 md:h-4" />
              </motion.button>

              {/* Clear current button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={currentQuestion?.isAnswered}
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
                disabled={currentQuestion?.isAnswered}
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
                  disabled={currentQuestion?.isAnswered}
                  className="bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {num}
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(".")}
                disabled={currentQuestion?.isAnswered}
                className="bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/70 text-white text-base xl:text-lg font-bold w-12 h-12 xl:w-14 xl:h-14 rounded-lg hover:brightness-110 transition-all flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                .
              </motion.button>

              {/* Clear current button */}
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

export default FractionGameplay;
