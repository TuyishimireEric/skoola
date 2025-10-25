import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Hash,
  Shuffle,
  ArrowUp,
  ArrowDown,
  Delete,
  Move,
  GripVertical,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";

interface NumberItem {
  id: string;
  value: number | null;
  isUserInput: boolean;
  originalIndex: number;
}

interface SequenceQuestion {
  numbers: number[];
  gap: number;
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  gameMode: "missing" | "sorting";
  sortOrder?: "ascending" | "descending";
  missingIndices?: number[];
  hasDecimals: boolean;
}

interface NumberSequenceGameplayProps {
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

// Touch state interface
interface TouchState {
  isDragging: boolean;
  draggedNumber: number | null;
  draggedFromSlot: number | null;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  offset: { x: number; y: number };
}

// Vibrant color palette for number cards
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

const NumberSequenceGameplay: React.FC<NumberSequenceGameplayProps> = ({
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
    SequenceQuestion[]
  >([]);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | null;
    message: string;
  }>({ type: null, message: "" });

  // Game state
  const [currentNumbers, setCurrentNumbers] = useState<NumberItem[]>([]);
  const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});

  // Sorting state
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [sortedSlots, setSortedSlots] = useState<(number | null)[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<number | null>(null);

  // Enhanced touch state
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    draggedNumber: null,
    draggedFromSlot: null,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  const inputRefs = useRef<{ [key: number]: HTMLInputElement }>({});
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentQuestion = processedQuestions[currentIndex];

  // Enhanced parse sequence data with decimal support
  const parseSequenceData = (
    equation: string
  ): { numbers: number[]; gap: number; hasDecimals: boolean } => {
    try {
      const numbers = equation
        .split(",")
        .map((n) => parseFloat(n.trim()))
        .filter((n) => !isNaN(n));

      if (numbers.length < 2)
        return { numbers: [], gap: 0, hasDecimals: false };

      const gap = numbers[1] - numbers[0];
      const hasDecimals = numbers.some((num) => num % 1 !== 0);

      return { numbers, gap, hasDecimals };
    } catch {
      return { numbers: [], gap: 0, hasDecimals: false };
    }
  };

  // Shuffle array for sorting games
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get touch position from event
  const getTouchPosition = (e: TouchEvent | React.TouchEvent) => {
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  };

  // Find drop target element at position
  const findDropTarget = (x: number, y: number) => {
    const elements = document.elementsFromPoint(x, y);

    // Look for slot elements
    for (const element of elements) {
      if (element.classList.contains("drop-slot")) {
        return {
          type: "slot",
          index: parseInt(element.getAttribute("data-slot-index") || "-1"),
        };
      }
      if (element.classList.contains("drop-available")) {
        return {
          type: "available",
          index: -1,
        };
      }
    }

    return null;
  };

  // Enhanced touch handlers
  const handleTouchStart = (
    e: React.TouchEvent,
    number: number,
    fromSlot?: number
  ) => {
    e.preventDefault();

    const touch = getTouchPosition(e);
    const rect = e.currentTarget.getBoundingClientRect();

    setTouchState({
      isDragging: true,
      draggedNumber: number,
      draggedFromSlot: fromSlot ?? null,
      startPos: touch,
      currentPos: touch,
      offset: {
        x: touch.x - rect.left,
        y: touch.y - rect.top,
      },
    });

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState.isDragging) return;

    e.preventDefault();
    const touch = getTouchPosition(e);

    setTouchState((prev) => ({
      ...prev,
      currentPos: touch,
    }));

    // Update drag preview position
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.left = `${touch.x - touchState.offset.x}px`;
      dragPreviewRef.current.style.top = `${touch.y - touchState.offset.y}px`;
    }

    // Check for drop targets
    const dropTarget = findDropTarget(touch.x, touch.y);
    if (dropTarget?.type === "slot") {
      setDragOverIndex(dropTarget.index);
    } else {
      setDragOverIndex(null);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchState.isDragging) return;

    e.preventDefault();
    const touch = getTouchPosition(e);
    const dropTarget = findDropTarget(touch.x, touch.y);

    if (dropTarget && touchState.draggedNumber !== null) {
      if (dropTarget.type === "slot") {
        handleDropInSlot(dropTarget.index);
      } else if (dropTarget.type === "available") {
        handleDropInAvailable();
      }
    }

    // Reset touch state
    setTouchState({
      isDragging: false,
      draggedNumber: null,
      draggedFromSlot: null,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
    });

    setDragOverIndex(null);
  };

  // Add global touch event listeners
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (touchState.isDragging) {
        handleTouchMove(e);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (touchState.isDragging) {
        handleTouchEnd(e);
      }
    };

    if (touchState.isDragging) {
      document.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalTouchEnd, {
        passive: false,
      });
    }

    return () => {
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [touchState.isDragging]);

  // Process questions and assign random game modes
  useEffect(() => {
    const formatSequenceQuestions = (
      questions: QuestionDataI[]
    ): SequenceQuestion[] => {
      return questions.map((q) => {
        const parsed = parseSequenceData(q.QuestionText);
        const gameMode = Math.random() < 0.5 ? "missing" : "sorting";

        let missingIndices: number[] = [];
        let sortOrder: "ascending" | "descending" | undefined;

        if (gameMode === "missing") {
          // Remove 1-3 random numbers for missing mode
          const numToRemove = Math.min(
            3,
            Math.max(1, Math.floor(parsed.numbers.length * 0.3))
          );
          const indices = Array.from(
            { length: parsed.numbers.length },
            (_, i) => i
          );
          missingIndices = shuffleArray(indices)
            .slice(0, numToRemove)
            .sort((a, b) => a - b);
        } else {
          // Random sort order for sorting mode
          sortOrder = Math.random() < 0.5 ? "ascending" : "descending";
        }

        return {
          numbers: parsed.numbers,
          gap: parsed.gap,
          originalQuestion: q.QuestionText,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          gameMode,
          sortOrder,
          missingIndices,
          hasDecimals: parsed.hasDecimals,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatSequenceQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Initialize current question numbers
  useEffect(() => {
    if (currentQuestion) {
      if (currentQuestion.gameMode === "missing") {
        // Create number items with missing values
        const numberItems: NumberItem[] = currentQuestion.numbers.map(
          (num, index) => ({
            id: `${index}`,
            value: currentQuestion.missingIndices?.includes(index) ? null : num,
            isUserInput:
              currentQuestion.missingIndices?.includes(index) || false,
            originalIndex: index,
          })
        );
        setCurrentNumbers(numberItems);

        // Initialize user inputs for missing numbers
        const inputs: { [key: number]: string } = {};
        currentQuestion.missingIndices?.forEach((index) => {
          inputs[index] = "";
        });
        setUserInputs(inputs);
        setAvailableNumbers([]);
        setSortedSlots([]);
      } else {
        // Create available numbers and empty slots for sorting
        setAvailableNumbers(shuffleArray([...currentQuestion.numbers]));
        setSortedSlots(new Array(currentQuestion.numbers.length).fill(null));
        setCurrentNumbers([]);
        setUserInputs({});
      }
    }
  }, [currentIndex, currentQuestion]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
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
  }, [timeLeft, gameOver]);

  // Game over effect
  useEffect(() => {
    if (gameOver) {
      const completedOn = new Date().toISOString();
      const timeSpent = (game.Duration || 300) - timeLeft;

      onComplete({
        Score:
          processedQuestions.length > 0
            ? ((score / processedQuestions.length) * 100).toFixed(2)
            : "0",
        MissedQuestions: missedQuestions.join(", "),
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
  ]);

  // Get instruction text based on game mode
  const getInstructionText = (question: SequenceQuestion): string => {
    if (question.gameMode === "missing") {
      return "Fill in the missing numbers to complete the sequence";
    } else {
      return `Sort the numbers in ${question.sortOrder} order`;
    }
  };

  // Handle number input for missing numbers mode - enhanced for decimals
  const handleNumberClick = (value: string) => {
    if (currentQuestion?.gameMode !== "missing") return;

    // Find the first empty input or the one being edited
    const missingIndices = currentQuestion.missingIndices || [];
    for (const index of missingIndices) {
      const currentInput = userInputs[index] || "";
      const maxLength = currentQuestion.hasDecimals ? 6 : 4;

      if (currentInput.length < maxLength) {
        // Handle decimal point - only allow one
        if (value === "." && currentInput.includes(".")) continue;

        // Handle negative sign - only at the start
        if (value === "-" && currentInput.length > 0) continue;

        setUserInputs((prev) => ({
          ...prev,
          [index]: currentInput + value,
        }));
        break;
      }
    }
  };

  // Handle backspace for missing numbers mode
  const handleBackspace = () => {
    if (currentQuestion?.gameMode !== "missing") return;

    const missingIndices = currentQuestion.missingIndices || [];
    // Find the last non-empty input and remove one character
    for (let i = missingIndices.length - 1; i >= 0; i--) {
      const index = missingIndices[i];
      if (userInputs[index] && userInputs[index].length > 0) {
        setUserInputs((prev) => ({
          ...prev,
          [index]: prev[index].slice(0, -1),
        }));
        break;
      }
    }
  };

  // Enhanced input change handler for decimals
  const handleInputChange = (index: number, value: string) => {
    const maxLength = currentQuestion?.hasDecimals ? 6 : 4;
    const regex = currentQuestion?.hasDecimals ? /^-?\d*\.?\d*$/ : /^-?\d*$/;

    if (value.length <= maxLength && regex.test(value)) {
      // Prevent multiple decimal points
      if (value.split(".").length > 2) return;

      setUserInputs((prev) => ({
        ...prev,
        [index]: value,
      }));
    }
  };

  // Enhanced drop handlers
  const handleDropInSlot = (dropIndex: number) => {
    if (touchState.draggedNumber === null) return;

    // If slot is occupied, move that number back to available
    if (sortedSlots[dropIndex] !== null) {
      setAvailableNumbers((prev) => [...prev, sortedSlots[dropIndex]!]);
    }

    // Create new sorted slots
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[dropIndex] = touchState.draggedNumber;
    setSortedSlots(newSortedSlots);

    // Remove from available numbers if coming from available area
    if (touchState.draggedFromSlot === null) {
      setAvailableNumbers((prev) =>
        prev.filter((num) => num !== touchState.draggedNumber)
      );
    } else {
      // If moving from another slot, clear the old slot
      const updatedSlots = [...newSortedSlots];
      updatedSlots[touchState.draggedFromSlot] = null;
      setSortedSlots(updatedSlots);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleDropInAvailable = () => {
    if (
      touchState.draggedNumber === null ||
      touchState.draggedFromSlot === null
    )
      return;

    // Move number back to available area
    setAvailableNumbers((prev) => [...prev, touchState.draggedNumber!]);

    // Clear the slot
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[touchState.draggedFromSlot] = null;
    setSortedSlots(newSortedSlots);
  };

  // Traditional drag and drop handlers (for desktop)
  const handleDragStart = (
    e: React.DragEvent,
    number: number,
    fromSlot?: number
  ) => {
    setDraggedItem(number);
    setDraggedFromSlot(fromSlot ?? null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
    document.body.style.cursor = "grabbing";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragDropInSlot = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedItem === null) return;

    // If slot is occupied, move that number back to available
    if (sortedSlots[dropIndex] !== null) {
      setAvailableNumbers((prev) => [...prev, sortedSlots[dropIndex]!]);
    }

    // Create new sorted slots
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[dropIndex] = draggedItem;
    setSortedSlots(newSortedSlots);

    // Remove from available numbers if coming from available area
    if (draggedFromSlot === null) {
      setAvailableNumbers((prev) => prev.filter((num) => num !== draggedItem));
    } else {
      // If moving from another slot, clear the old slot
      const updatedSlots = [...newSortedSlots];
      updatedSlots[draggedFromSlot] = null;
      setSortedSlots(updatedSlots);
    }

    setDraggedItem(null);
    setDraggedFromSlot(null);
    document.body.style.cursor = "default";
  };

  const handleDragDropInAvailable = (e: React.DragEvent) => {
    e.preventDefault();

    if (draggedItem === null || draggedFromSlot === null) return;

    // Move number back to available area
    setAvailableNumbers((prev) => [...prev, draggedItem]);

    // Clear the slot
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[draggedFromSlot] = null;
    setSortedSlots(newSortedSlots);

    setDraggedItem(null);
    setDraggedFromSlot(null);
    document.body.style.cursor = "default";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromSlot(null);
    setDragOverIndex(null);
    document.body.style.cursor = "default";
  };

  // Clear all inputs
  const handleClear = () => {
    if (currentQuestion?.gameMode === "missing") {
      setUserInputs({});
    } else {
      // Reset sorting - move all numbers back to available area
      setAvailableNumbers(shuffleArray([...currentQuestion.numbers]));
      setSortedSlots(new Array(currentQuestion.numbers.length).fill(null));
    }
  };

  // Enhanced validation for decimals
  const validateAnswer = (): boolean => {
    if (!currentQuestion) return false;

    if (currentQuestion.gameMode === "missing") {
      // Check missing numbers
      const missingIndices = currentQuestion.missingIndices || [];

      // All inputs must be filled
      for (const index of missingIndices) {
        if (!userInputs[index] || userInputs[index].trim() === "") {
          return false;
        }
      }

      // Check if the inputs match the correct numbers
      for (const index of missingIndices) {
        const userValue = parseFloat(userInputs[index]);
        const correctValue = currentQuestion.numbers[index];
        if (isNaN(userValue) || Math.abs(userValue - correctValue) > 0.001) {
          return false;
        }
      }
      return true;
    } else {
      // Check sorting - all slots must be filled and in correct order
      if (sortedSlots.some((slot) => slot === null)) {
        return false;
      }

      const filledNumbers = sortedSlots.filter(
        (slot) => slot !== null
      ) as number[];

      if (currentQuestion.sortOrder === "ascending") {
        return filledNumbers.every(
          (num, index) => index === 0 || num >= filledNumbers[index - 1]
        );
      } else {
        return filledNumbers.every(
          (num, index) => index === 0 || num <= filledNumbers[index - 1]
        );
      }
    }
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (!currentQuestion) return;

    const isCorrect = validateAnswer();

    if (isCorrect) {
      if (!hasFailedOnce) {
        setScore((prev) => prev + 1);
        const globalNewScore = totalScore + 1;
        setTotalScore(globalNewScore);
      }
      setShowCelebration(true);
      setFeedback({ type: "correct", message: "Excellent! 🎉" });
      setTimeout(() => {
        if (currentIndex < processedQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          const newCurrentQuestionIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(newCurrentQuestionIndex);
          setUserInputs({});
          setShowCelebration(false);
          setFeedback({ type: null, message: "" });
          setHasFailedOnce(false);
        } else {
          setGameOver(true);
        }
      }, 2000);
    } else {
      setHasFailedOnce(true);
      setFeedback({ type: "incorrect", message: "Try again! 🤔" });

      if (!missedQuestions.includes(currentQuestion.originalQuestion)) {
        setMissedQuestions((prev) => [
          ...prev,
          currentQuestion.originalQuestion,
        ]);
      }

      setTimeout(() => {
        setFeedback({ type: null, message: "" });
      }, 2000);
    }
  };

  // Enhanced number buttons with decimal support
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
    { value: "-", label: "±" },
  ];

  // Format number display for better readability
  const formatNumber = (num: number): string => {
    if (num % 1 === 0) {
      return num.toString();
    }
    return num.toFixed(2).replace(/\.?0+$/, "");
  };

  return (
    <div
      className="relative w-full h-full font-comic overflow-hidden flex flex-col"
      ref={containerRef}
    >
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

      {/* Drag preview for touch devices */}
      {touchState.isDragging && touchState.draggedNumber !== null && (
        <div
          ref={dragPreviewRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: touchState.currentPos.x - touchState.offset.x,
            top: touchState.currentPos.y - touchState.offset.y,
          }}
        >
          <div
            className={`
              ${
                colorPalette[
                  availableNumbers.indexOf(touchState.draggedNumber) %
                    colorPalette.length
                ]
              } 
              text-white shadow-2xl border-4 border-white rounded-2xl 
              w-16 h-16 md:w-20 md:h-20 
              flex items-center justify-center scale-110 opacity-90
            `}
          >
            <span className="text-lg md:text-xl lg:text-2xl font-bold">
              {formatNumber(touchState.draggedNumber)}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-2 md:p-4 ">
        {currentQuestion && (
          <div className="w-full max-w-6xl flex flex-col gap-4">
            {/* Question area */}
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl lg:rounded-3x"
            >
              <div className="text-center space-y-4 md:space-y-6">
                {/* Instruction */}
                <div className="flex items-center justify-center gap-3">
                  <Hash className="text-orange-600" size={24} />
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700">
                    {getInstructionText(currentQuestion)}
                  </h2>
                  {currentQuestion.gameMode === "sorting" &&
                    (currentQuestion.sortOrder === "ascending" ? (
                      <ArrowUp className="text-green-600" size={24} />
                    ) : (
                      <ArrowDown className="text-red-600" size={24} />
                    ))}
                </div>

                {/* Numbers display */}
                <div className="w-full flex justify-center">
                  {currentQuestion.gameMode === "sorting" ? (
                    // Sorting mode - Available numbers and empty slots
                    <div className="space-y-6">
                      {/* Sorting slots */}
                      <div className="text-center">
                        <div className="flex flex-wrap justify-center items-center gap-3">
                          {sortedSlots.map((slotValue, index) => (
                            <div
                              key={`slot-${index}`}
                              className={`
                                drop-slot w-16 h-16 md:w-20 md:h-20
                                border-4 border-dashed border-gray-400 rounded-2xl
                                flex items-center justify-center relative
                                transition-all duration-200
                                ${
                                  dragOverIndex === index
                                    ? "border-yellow-400 bg-yellow-50 scale-105"
                                    : "bg-gray-50"
                                }
                                ${slotValue !== null ? "border-solid" : ""}
                              `}
                              data-slot-index={index}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDragDropInSlot(e, index)}
                            >
                              {slotValue !== null ? (
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, slotValue, index)
                                  }
                                  onDragEnd={handleDragEnd}
                                  onTouchStart={(e) =>
                                    handleTouchStart(e, slotValue, index)
                                  }
                                  className={`
                                    ${
                                      colorPalette[
                                        sortedSlots.indexOf(slotValue) %
                                          colorPalette.length
                                      ]
                                    } 
                                    text-white shadow-lg border-4 border-white rounded-2xl 
                                    w-full h-full
                                    flex items-center justify-center relative cursor-grab
                                    transition-all duration-200 hover:scale-105 select-none
                                    ${
                                      draggedItem === slotValue ||
                                      touchState.draggedNumber === slotValue
                                        ? "opacity-50 scale-95"
                                        : ""
                                    }
                                  `}
                                  style={{
                                    cursor:
                                      draggedItem === slotValue ||
                                      touchState.draggedNumber === slotValue
                                        ? "grabbing"
                                        : "grab",
                                    touchAction: "none",
                                  }}
                                >
                                  <span className="text-lg md:text-xl lg:text-2xl font-bold pointer-events-none">
                                    {formatNumber(slotValue)}
                                  </span>
                                  <GripVertical className="absolute top-1 right-1 w-3 h-3 opacity-60 pointer-events-none" />
                                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 rounded-2xl pointer-events-none"></div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-2xl">
                                  ?
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Available numbers area */}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                          Available Numbers
                        </h3>
                        <div
                          className="drop-available min-h-[100px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-wrap justify-center items-center gap-3"
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={handleDragDropInAvailable}
                        >
                          {availableNumbers.map((number, index) => (
                            <div
                              key={`available-${number}-${index}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, number)}
                              onDragEnd={handleDragEnd}
                              onTouchStart={(e) => handleTouchStart(e, number)}
                              className={`
                                ${colorPalette[index % colorPalette.length]} 
                                text-white shadow-lg border-4 border-white rounded-2xl 
                                w-16 h-16 md:w-20 md:h-20 
                                flex items-center justify-center relative cursor-grab
                                transition-all duration-200 hover:scale-105 select-none
                                ${
                                  draggedItem === number ||
                                  touchState.draggedNumber === number
                                    ? "opacity-50 scale-95"
                                    : ""
                                }
                              `}
                              style={{
                                cursor:
                                  draggedItem === number ||
                                  touchState.draggedNumber === number
                                    ? "grabbing"
                                    : "grab",
                                touchAction: "none",
                              }}
                            >
                              <span className="text-lg md:text-xl lg:text-2xl font-bold pointer-events-none">
                                {formatNumber(number)}
                              </span>
                              <GripVertical className="absolute top-1 right-1 w-4 h-4 opacity-60 pointer-events-none" />
                              <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 rounded-2xl pointer-events-none"></div>
                            </div>
                          ))}
                          {availableNumbers.length === 0 && (
                            <p className="text-gray-500 text-sm italic">
                              All numbers have been placed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Missing numbers mode - input fields
                    <div className=" flex flex-wrap justify-center items-center gap-2 ">
                      {currentNumbers.map((item, index) => (
                        <div key={index} className="relative">
                          <div
                            className={`
                              ${
                                item.isUserInput
                                  ? "bg-gray-100"
                                  : colorPalette[index % colorPalette.length]
                              } 
                              text-white shadow-lg border-4 
                              ${
                                item.isUserInput
                                  ? "border-dashed border-gray-400"
                                  : "border-white"
                              } 
                              rounded-2xl w-20 h-20 
                              flex items-center justify-center relative
                            `}
                          >
                            {item.isUserInput ? (
                              <input
                                ref={(el) => {
                                  if (el)
                                    inputRefs.current[item.originalIndex] = el;
                                }}
                                type="text"
                                className="w-16 h-16 text-base md:text-lg font-bold text-center bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 border-2"
                                value={userInputs[item.originalIndex] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    item.originalIndex,
                                    e.target.value
                                  )
                                }
                                maxLength={currentQuestion.hasDecimals ? 6 : 4}
                                placeholder="?"
                                disabled={feedback.type === "correct"}
                              />
                            ) : (
                              <span className="text-lg md:text-xl font-bold">
                                {formatNumber(item.value as number)}
                              </span>
                            )}
                            <div
                              className={`absolute top-0 left-0 right-0 bottom-0 ${
                                item.isUserInput ? "" : "bg-white opacity-20"
                              } rounded-2xl pointer-events-none`}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-6 mb-4">
              {currentQuestion.gameMode === "sorting" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg text-sm md:text-base transform transition-all"
                >
                  <Shuffle size={16} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  Shuffle
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={feedback.type === "correct"}
                className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-2 px-6 md:py-3 md:px-8 lg:py-5 lg:px-14 xl:py-6 xl:px-16 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transform transition-all"
              >
                <CheckCircle
                  size={16}
                  className="md:w-5 md:h-5 lg:w-6 lg:h-6"
                />
                Check Answer
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Number pad (only for missing numbers mode) */}
      {currentQuestion?.gameMode === "missing" && (
        <div className="relative z-20 bg-white/40 backdrop-blur-sm border-t border-orange-200 p-2 md:p-3 lg:p-4">
          {/* Mobile/Tablet grid layout */}
          <div className="max-w-lg mx-auto lg:hidden pb-2">
            <div className="grid grid-cols-4 gap-2 md:gap-2">
              {/* Number buttons */}
              {numberButtons.map((btn, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberClick(btn.value)}
                  disabled={feedback.type === "correct"}
                  className={`
                    ${
                      btn.value === "."
                        ? "bg-gradient-to-br from-yellow-400 to-primary-600"
                        : btn.value === "-"
                        ? "bg-gradient-to-br from-purple-400 to-purple-600"
                        : "bg-gradient-to-br from-orange-400 to-red-500"
                    }
                    border-2 border-white/70 text-white text-lg md:text-xl font-bold 
                    h-12 md:h-14 rounded-xl hover:brightness-110 transition-all 
                    flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-95
                  `}
                  style={{ touchAction: "manipulation" }}
                >
                  {btn.label}
                </motion.button>
              ))}

              {/* Backspace button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={feedback.type === "correct"}
                className="bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white/70 text-white font-bold h-12 md:h-14 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                style={{ touchAction: "manipulation" }}
              >
                <Delete size={18} className="md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>

          {/* Large screen horizontal layout */}
          <div className="hidden lg:block max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4 flex-wrap">
              {/* Backspace button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={feedback.type === "correct"}
                className="bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-white/70 text-white font-bold py-3 px-4 md:py-4 md:px-6 lg:py-5 lg:px-6 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Delete size={24} />
              </motion.button>

              {/* Number buttons 1-9, 0 */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={feedback.type === "correct"}
                  className="bg-gradient-to-br from-orange-400 to-red-500 border-4 border-white/70 text-white text-xl md:text-2xl lg:text-3xl font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {num}
                </motion.button>
              ))}

              {/* Decimal point button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(".")}
                disabled={feedback.type === "correct"}
                className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white/70 text-white text-xl md:text-2xl lg:text-3xl font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                .
              </motion.button>

              {/* Negative/Positive button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick("-")}
                disabled={feedback.type === "correct"}
                className="bg-gradient-to-br from-purple-400 to-purple-600 border-4 border-white/70 text-white text-xl md:text-2xl lg:text-3xl font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ±
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Sorting instructions (only for sorting mode) */}
      {currentQuestion?.gameMode === "sorting" && (
        <div className="relative z-20 bg-white/40 backdrop-blur-sm border-t border-orange-200 p-2 md:p-3 lg:p-4">
          <div className="text-center text-gray-600 text-sm md:text-base">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Move className="text-orange-600" size={20} />
              <span className="font-semibold">
                Touch and drag numbers to sort them
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
              <span>
                Sort{" "}
                {currentQuestion.sortOrder === "ascending"
                  ? "smallest to largest"
                  : "largest to smallest"}
              </span>
              {currentQuestion.sortOrder === "ascending" ? (
                <ArrowUp className="text-green-600" size={16} />
              ) : (
                <ArrowDown className="text-red-600" size={16} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback display */}
      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 px-6 py-3 rounded-full font-bold text-white shadow-lg ${
              feedback.type === "correct" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

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

export default NumberSequenceGameplay;
