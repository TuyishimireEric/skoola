import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Type,
  Shuffle,
  Move,
  GripVertical,
  BookOpen,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";


interface SentenceQuestion {
  sentence: string;
  words: string[];
  explanation?: string;
  difficulty: string;
  originalQuestion: string;
}

interface SentenceSortingGameplayProps {
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
  draggedWord: string | null;
  draggedFromSlot: number | null;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  offset: { x: number; y: number };
}

// Vibrant color palette for word cards
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

const SentenceSortingGameplay: React.FC<SentenceSortingGameplayProps> = ({
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
    SentenceQuestion[]
  >([]);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | null;
    message: string;
  }>({ type: null, message: "" });

  // Game state
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [sortedSlots, setSortedSlots] = useState<(string | null)[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<number | null>(null);

  // Enhanced touch state
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    draggedWord: null,
    draggedFromSlot: null,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentQuestion = processedQuestions[currentIndex];

  // Parse sentence data
  const parseSentenceData = (
    sentenceText: string
  ): { words: string[]; sentence: string } => {
    try {
      // Clean the sentence and split into words
      const cleanSentence = sentenceText.trim();
      const words = cleanSentence
        .split(/\s+/)
        .filter((word) => word.length > 0);

      return { words, sentence: cleanSentence };
    } catch {
      return { words: [], sentence: "" };
    }
  };

  // Shuffle array
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
    word: string,
    fromSlot?: number
  ) => {
    e.preventDefault();

    const touch = getTouchPosition(e);
    const rect = e.currentTarget.getBoundingClientRect();

    setTouchState({
      isDragging: true,
      draggedWord: word,
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

    if (dropTarget && touchState.draggedWord !== null) {
      if (dropTarget.type === "slot") {
        handleDropInSlot(dropTarget.index);
      } else if (dropTarget.type === "available") {
        handleDropInAvailable();
      }
    }

    // Reset touch state
    setTouchState({
      isDragging: false,
      draggedWord: null,
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

  // Process questions
  useEffect(() => {
    const formatSentenceQuestions = (
      questions: QuestionDataI[]
    ): SentenceQuestion[] => {
      return questions.map((q) => {
        const parsed = parseSentenceData(q.QuestionText);

        return {
          sentence: parsed.sentence,
          words: parsed.words,
          explanation: q.Explanation,
          difficulty: q.Difficulty || "Easy",
          originalQuestion: q.QuestionText,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatSentenceQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Initialize current question words
  useEffect(() => {
    if (currentQuestion) {
      setAvailableWords(shuffleArray([...currentQuestion.words]));
      setSortedSlots(new Array(currentQuestion.words.length).fill(null));
    }
  }, [currentIndex, currentQuestion]);

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

  // Enhanced drop handlers
  const handleDropInSlot = (dropIndex: number) => {
    if (touchState.draggedWord === null) return;

    // If slot is occupied, move that word back to available
    if (sortedSlots[dropIndex] !== null) {
      setAvailableWords((prev) => [...prev, sortedSlots[dropIndex]!]);
    }

    // Create new sorted slots
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[dropIndex] = touchState.draggedWord;
    setSortedSlots(newSortedSlots);

    // Remove from available words if coming from available area
    if (touchState.draggedFromSlot === null) {
      setAvailableWords((prev) =>
        prev.filter((word) => word !== touchState.draggedWord)
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
    if (touchState.draggedWord === null || touchState.draggedFromSlot === null)
      return;

    // Move word back to available area
    setAvailableWords((prev) => [...prev, touchState.draggedWord!]);

    // Clear the slot
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[touchState.draggedFromSlot] = null;
    setSortedSlots(newSortedSlots);
  };

  // Traditional drag and drop handlers (for desktop)
  const handleDragStart = (
    e: React.DragEvent,
    word: string,
    fromSlot?: number
  ) => {
    setDraggedItem(word);
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

    // If slot is occupied, move that word back to available
    if (sortedSlots[dropIndex] !== null) {
      setAvailableWords((prev) => [...prev, sortedSlots[dropIndex]!]);
    }

    // Create new sorted slots
    const newSortedSlots = [...sortedSlots];
    newSortedSlots[dropIndex] = draggedItem;
    setSortedSlots(newSortedSlots);

    // Remove from available words if coming from available area
    if (draggedFromSlot === null) {
      setAvailableWords((prev) => prev.filter((word) => word !== draggedItem));
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

    // Move word back to available area
    setAvailableWords((prev) => [...prev, draggedItem]);

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

  // Clear all words
  const handleClear = () => {
    // Reset sorting - move all words back to available area
    setAvailableWords(shuffleArray([...currentQuestion.words]));
    setSortedSlots(new Array(currentQuestion.words.length).fill(null));
  };

  // Validate answer
  const validateAnswer = (): boolean => {
    if (!currentQuestion) return false;

    // Check if all slots are filled
    if (sortedSlots.some((slot) => slot === null)) {
      return false;
    }

    // Check if the sentence matches the correct order
    const userSentence = sortedSlots.filter((slot) => slot !== null).join(" ");
    const correctSentence = currentQuestion.sentence;

    return (
      userSentence.toLowerCase().trim() === correctSentence.toLowerCase().trim()
    );
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
      setFeedback({
        type: "correct",
        message: "Excellent! Perfect sentence! 🎉",
      });

      setTimeout(() => {
        if (currentIndex < processedQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          const newCurrentQuestionIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(newCurrentQuestionIndex);
          setShowCelebration(false);
          setFeedback({ type: null, message: "" });
          setHasFailedOnce(false);
        } else {
          setGameOver(true);
        }
      }, 2000);
    } else {
      setHasFailedOnce(true);
      setFeedback({
        type: "incorrect",
        message: "Try again! Check the word order! 🤔",
      });

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

  // Get word color based on index
  const getWordColor = (word: string, index: number): string => {
    const colorIndex =
      availableWords.indexOf(word) !== -1
        ? availableWords.indexOf(word)
        : index;
    return colorPalette[colorIndex % colorPalette.length];
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
          📚
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 left-10 text-4xl md:text-6xl opacity-10"
        >
          ✍️
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 left-20 text-3xl md:text-5xl opacity-10"
        >
          💭
        </motion.div>
      </div>

      {/* Drag preview for touch devices */}
      {touchState.isDragging && touchState.draggedWord !== null && (
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
              ${getWordColor(touchState.draggedWord, 0)} 
              text-white shadow-2xl border-4 border-white rounded-2xl 
              px-4 py-2 scale-110 opacity-90
            `}
          >
            <span className="text-lg md:text-xl font-bold">
              {touchState.draggedWord}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-2 md:p-4 lg:p-6 min-h-[50vh] lg:min-h-[60vh]">
        {currentQuestion && (
          <div className="w-full max-w-6xl flex flex-col gap-4">
            {/* Question area */}
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl lg:rounded-3xl shadow-xl p-3 md:p-6 lg:p-8 border-2 lg:border-4 border-purple-200"
            >
              <div className="text-center space-y-4 md:space-y-6">
                {/* Instruction */}
                <div className="flex items-center justify-center gap-3">
                  <Type className="text-purple-600" size={24} />
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700">
                    Arrange the words to form the correct sentence
                  </h2>
                  <BookOpen className="text-purple-600" size={24} />
                </div>

                {/* Sentence slots */}
                <div className="w-full flex justify-center">
                  <div className="space-y-4">
                    {/* Sentence building area */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Build Your Sentence Here
                      </h3>
                      <div className="flex flex-wrap justify-center items-center gap-3 min-h-[100px] bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-xl p-4">
                        {sortedSlots.map((slotValue, index) => (
                          <div
                            key={`slot-${index}`}
                            className={`
                              drop-slot min-w-[80px] h-16 md:h-20
                              border-4 border-dashed border-gray-400 rounded-2xl
                              flex items-center justify-center relative px-2
                              transition-all duration-200
                              ${
                                dragOverIndex === index
                                  ? "border-green-400 bg-green-50 scale-105"
                                  : "bg-gray-50"
                              }
                              ${
                                slotValue !== null
                                  ? "border-solid border-green-400 bg-green-100"
                                  : ""
                              }
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
                                  ${getWordColor(slotValue, index)} 
                                  text-white shadow-lg border-4 border-white rounded-2xl 
                                  w-full h-full min-w-[70px]
                                  flex items-center justify-center relative cursor-grab px-2
                                  transition-all duration-200 hover:scale-105 select-none
                                  ${
                                    draggedItem === slotValue ||
                                    touchState.draggedWord === slotValue
                                      ? "opacity-50 scale-95"
                                      : ""
                                  }
                                `}
                                style={{
                                  cursor:
                                    draggedItem === slotValue ||
                                    touchState.draggedWord === slotValue
                                      ? "grabbing"
                                      : "grab",
                                  touchAction: "none",
                                }}
                              >
                                <span className="text-sm md:text-base lg:text-lg font-bold pointer-events-none text-center">
                                  {slotValue}
                                </span>
                                <GripVertical className="absolute top-1 right-1 w-3 h-3 opacity-60 pointer-events-none" />
                                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 rounded-2xl pointer-events-none"></div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-lg">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Available words area */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Available Words
                      </h3>
                      <div
                        className="drop-available min-h-[90px] bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-4 flex flex-wrap justify-center items-center gap-3"
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={handleDragDropInAvailable}
                      >
                        {availableWords.map((word, index) => (
                          <div
                            key={`available-${word}-${index}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, word)}
                            onDragEnd={handleDragEnd}
                            onTouchStart={(e) => handleTouchStart(e, word)}
                            className={`
                              ${getWordColor(word, index)} 
                              text-white shadow-lg border-4 border-white rounded-2xl 
                              px-4 py-3 min-w-[70px]
                              flex items-center justify-center relative cursor-grab
                              transition-all duration-200 hover:scale-105 select-none
                              ${
                                draggedItem === word ||
                                touchState.draggedWord === word
                                  ? "opacity-50 scale-95"
                                  : ""
                              }
                            `}
                            style={{
                              cursor:
                                draggedItem === word ||
                                touchState.draggedWord === word
                                  ? "grabbing"
                                  : "grab",
                              touchAction: "none",
                            }}
                          >
                            <span className="text-sm md:text-base lg:text-lg font-bold pointer-events-none text-center">
                              {word}
                            </span>
                            <GripVertical className="absolute top-1 right-1 w-3 h-3 opacity-60 pointer-events-none" />
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 rounded-2xl pointer-events-none"></div>
                          </div>
                        ))}
                        {availableWords.length === 0 && (
                          <p className="text-gray-500 text-sm italic">
                            All words have been placed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 md:gap-4 lg:gap-6 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg text-sm md:text-base transform transition-all"
              >
                <Shuffle size={16} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                Reset
              </motion.button>

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
                Check Sentence
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions for mobile/touch devices */}
      <div className="relative z-20 bg-white/40 backdrop-blur-sm border-t border-purple-200 p-2 md:p-3 lg:p-4">
        <div className="text-center text-gray-600 text-sm md:text-base">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Move className="text-purple-600" size={20} />
            <span className="font-semibold">
              Touch and drag words to build the sentence
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
            <span>
              Drag words from the yellow area to the green sentence slots
            </span>
            <Type className="text-purple-600" size={16} />
          </div>
        </div>
      </div>

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

export default SentenceSortingGameplay;
