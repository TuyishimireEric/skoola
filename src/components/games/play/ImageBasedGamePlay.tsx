import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  ImageIcon,
  Delete,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  unit: string;
}

interface ImageProblemQuestion {
  imageUrl: string;
  imageDescription: string;
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
}

interface ImageBasedGameplayProps {
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

const ImageBasedGameplay: React.FC<ImageBasedGameplayProps> = ({
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
    ImageProblemQuestion[]
  >([]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
  const currentQuestion = processedQuestions[currentIndex];

  // Cloudinary URL optimization helper
  const optimizeCloudinaryUrl = useCallback((url: string): string => {
    if (!url || !url.includes("cloudinary")) return url;

    // Check if already optimized
    if (url.includes("/f_auto,q_auto/") || url.includes("/f_auto/")) {
      return url;
    }

    // Add Cloudinary optimizations for image problems
    const cloudinaryTransformations =
      "f_auto,q_auto,w_1000,h_800,c_fit,dpr_auto";

    // Handle different Cloudinary URL formats
    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/${cloudinaryTransformations}/`);
    } else if (url.includes("/image/upload/")) {
      return url.replace(
        "/image/upload/",
        `/image/upload/${cloudinaryTransformations}/`
      );
    }

    return url;
  }, []);

  // Preload images for better performance
  const preloadImage = useCallback(
    (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (preloadedImages.has(url)) {
          resolve();
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          setPreloadedImages((prev) => new Set(prev).add(url));
          resolve();
        };
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = optimizeCloudinaryUrl(url);
      });
    },
    [optimizeCloudinaryUrl, preloadedImages]
  );

  // Parse image problem from equation string
  const parseImageProblem = (
    equation: string
  ): {
    imageUrl: string;
    imageDescription: string;
    subQuestions: SubQuestion[];
  } => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 3) {
        const imageUrl = parts[0] || "";
        const imageDescription = parts[1] || "";
        const subQuestionsStr = parts[2] || "";
        const subQuestions = subQuestionsStr ? JSON.parse(subQuestionsStr) : [];
        return { imageUrl, imageDescription, subQuestions };
      }
    } catch (error) {
      console.error("Error parsing image problem:", error);
    }

    return {
      imageUrl: "",
      imageDescription: "",
      subQuestions: [],
    };
  };

  // Process questions and preload images
  useEffect(() => {
    const formatImageProblems = (
      questions: QuestionDataI[]
    ): ImageProblemQuestion[] => {
      return questions.map((q) => {
        const parsed = parseImageProblem(q.QuestionText);
        return {
          imageUrl: parsed.imageUrl,
          imageDescription: parsed.imageDescription,
          subQuestions: parsed.subQuestions,
          originalQuestion: q.QuestionText,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatImageProblems(questions);
      setProcessedQuestions(processed);

      // Preload all images in the background
      const preloadAllImages = async () => {
        const imageUrls = processed
          .map((q) => q.imageUrl)
          .filter(Boolean) as string[];

        // Preload current and next few images with priority
        const priorityUrls = imageUrls.slice(0, Math.min(2, imageUrls.length));

        try {
          await Promise.all(priorityUrls.map((url) => preloadImage(url)));
        } catch (error) {
          console.warn("Some images failed to preload:", error);
        }

        // Preload remaining images in background
        if (imageUrls.length > 2) {
          imageUrls.slice(2).forEach((url) => {
            preloadImage(url).catch((err) =>
              console.warn("Background preload failed:", err)
            );
          });
        }
      };

      preloadAllImages();
    }
  }, [questions, preloadImage]);

  // Initialize sub-question answers when question changes and manage image loading
  useEffect(() => {
    if (currentQuestion) {
      const initialAnswers = currentQuestion.subQuestions.map((sq) => ({
        id: sq.id,
        userAnswer: "",
      }));
      setSubQuestionAnswers(initialAnswers);
      setActiveInputId(currentQuestion.subQuestions[0]?.id || null);

      // Handle image loading state
      const currentImg = currentQuestion.imageUrl;
      if (currentImg) {
        setImageLoading(!preloadedImages.has(currentImg));
        setImageError(false);

        // Preload next image
        const nextIndex = currentIndex + 1;
        if (nextIndex < processedQuestions.length) {
          const nextImageUrl = processedQuestions[nextIndex]?.imageUrl;
          if (nextImageUrl && !preloadedImages.has(nextImageUrl)) {
            preloadImage(nextImageUrl).catch((err) =>
              console.warn("Next image preload failed:", err)
            );
          }
        }
      } else {
        setImageLoading(false);
        setImageError(false);
      }
    }
  }, [
    currentIndex,
    currentQuestion,
    preloadedImages,
    processedQuestions,
    preloadImage,
  ]);

  // Enhanced keyboard event handling for number pad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeInputId || currentQuestion?.isAnswered) return;

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
  }, [subQuestionAnswers, activeInputId, currentQuestion]);

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

  const handleNumberClick = (value: string) => {
    if (!activeInputId || currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const currentAnswer = subQuestionAnswers.find(
      (sq) => sq.id === activeInputId
    );
    if (currentAnswer && currentAnswer.userAnswer.length < 10) {
      updateSubQuestionAnswer(activeInputId, currentAnswer.userAnswer + value);
    }
  };

  // Handle backspace from number pad
  const handleBackspace = () => {
    if (!activeInputId || currentQuestion?.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

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

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

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

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Handle image error with retry logic
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);

    // Remove from preloaded images cache on error
    if (currentQuestion?.imageUrl) {
      setPreloadedImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestion.imageUrl);
        return newSet;
      });
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

    subQuestionAnswers.forEach((sqAnswer) => {
      const subQuestion = currentQuestion.subQuestions.find(
        (sq) => sq.id === sqAnswer.id
      );
      if (!subQuestion) {
        allCorrect = false;
        return;
      }

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
    });

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
          setSubQuestionAnswers([]);
          setActiveInputId(null);
        } else {
          setShowResults(true);
        }
      },
      isCorrect ? 2000 : 300
    );
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
    <div className="relative w-full h-full font-comic overflow-hidden flex flex-col">
      {/* African decorative elements */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-6 right-6 md:top-10 md:right-10 text-3xl md:text-4xl lg:text-6xl opacity-10"
        >
          🏺
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-3xl md:text-4xl lg:text-6xl opacity-10"
        >
          🌍
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-16 left-16 md:top-20 md:left-20 text-2xl md:text-3xl lg:text-5xl opacity-10"
        >
          🦁
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative px-4 z-20 flex-1 flex flex-col justify-start items-center p-2 md:p-4 lg:p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-7xl flex flex-col gap-4"
            >
              {/* Question area */}
              <motion.div className="rounded-2xl">
                <div className="space-y-3 flex flex-col sm:flex-row w-full gap-4">
                  {/* Image display */}
                  <div className="rounded-xl lg:rounded-2xl w-full sm:w-1/2">
                    {/* Image description */}
                    {currentQuestion.imageDescription && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-lg border border-blue-200 p-3 mb-4"
                      >
                        <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
                          <span className="font-semibold text-primary-800">
                            Description:{" "}
                          </span>
                          {currentQuestion.imageDescription}
                        </p>
                      </motion.div>
                    )}

                    <div className="relative">
                      {/* Optimized image with better loading states */}
                      <div className="relative inset-0 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                        <Image
                          src={optimizeCloudinaryUrl(currentQuestion.imageUrl)}
                          alt="Problem Image"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          className="w-full h-auto max-h-48 md:max-h-52 lg:max-h-60 object-contain rounded-lg border-2 border-gray-200"
                          width={1000}
                          height={800}
                          priority={currentIndex < 2}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />

                        {/* Loading overlay */}
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                              <Loader2
                                className="text-blue-500 animate-spin"
                                size={32}
                              />
                              <span className="text-gray-600 font-semibold">
                                Loading image...
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Error overlay */}
                        {imageError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3 text-red-600">
                              <ImageIcon size={48} />
                              <span className="font-semibold">
                                Image could not be loaded
                              </span>
                              <span className="text-sm">
                                Please continue with the description
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub-questions */}
                  <div className="space-y-3 w-full sm:w-1/2">
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
                          className="p-4 rounded-xl lg:rounded-2xl transition-all duration-300"
                        >
                          <div className="space-y-3">
                            {/* Question */}
                            <div className="flex items-start gap-3">
                              <span className="font-bold text-purple-700 text-lg lg:text-xl min-w-[28px]">
                                {getSubQuestionLetter(index)})
                              </span>
                              <span className="text-base md:text-lg lg:text-xl text-gray-800 flex-1">
                                {subQ.question}
                              </span>
                            </div>

                            {/* Answer input */}
                            <div className="ml-8">
                              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
                                Your Answer:
                              </label>
                              <div className="flex gap-3">
                                <div className="relative flex-1">
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
                                    placeholder="Enter your answer..."
                                    disabled={currentQuestion.isAnswered}
                                    className={`
                                      w-full p-4 md:p-5 lg:p-4 rounded-xl lg:rounded-2xl border-2 lg:border-4 
                                      focus:outline-none font-mono text-base md:text-lg lg:text-xl 
                                      transition-all duration-300
                                      ${
                                        currentQuestion.isAnswered
                                          ? "border-gray-300 bg-gray-50 text-gray-600"
                                          : isActive
                                          ? "border-yellow-500 bg-gradient-to-br from-yellow-200 to-yellow-100 shadow-lg"
                                          : "border-gray-300 focus:border-purple-500 bg-white"
                                      }
                                      disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                    style={{
                                      boxShadow:
                                        isActive && !currentQuestion.isAnswered
                                          ? "0 8px 20px rgba(251, 191, 36, 0.3)"
                                          : "none",
                                    }}
                                  />
                                  {isActive && !currentQuestion.isAnswered && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
                                    >
                                      Active
                                    </motion.div>
                                  )}
                                </div>
                                {subQ.unit && (
                                  <div className="flex items-center px-4 lg:px-6 bg-gray-100 rounded-xl lg:rounded-2xl border-2 lg:border-4 border-gray-300">
                                    <span className="text-gray-600 font-semibold text-base md:text-lg">
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

                    {/* Continue button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      disabled={!allAnswersFilled || currentQuestion.isAnswered}
                      className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 ml-8 mt-4 px-8 md:py-4 md:px-12 lg:py-5 lg:px-16 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transform transition-all duration-300"
                      style={{ touchAction: "manipulation" }}
                    >
                      Continue
                      <ArrowRight size={16} className="w-5 h-5 lg:w-6 lg:h-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Number pad */}
      <div className="relative z-20 bg-white/40 backdrop-blur-sm border-t border-emerald-200 p-2 md:p-3 lg:p-4">
        {/* Mobile/Tablet grid layout */}
        <div className="w-full mx-auto lg:hidden pb-2">
          <div className="grid grid-cols-5 gap-2 md:gap-2">
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
                  border-2 border-white/70 text-white text-lg md:text-xl font-bold 
                  h-12 md:h-14 rounded-xl hover:brightness-110 transition-all 
                  flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
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
              disabled={currentQuestion?.isAnswered || !activeInputId}
              className="bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white/70 text-white font-bold h-12 md:h-14 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <Delete size={18} className="md:w-5 md:h-5" />
            </motion.button>

            {/* Clear current button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearCurrent}
              disabled={currentQuestion?.isAnswered || !activeInputId}
              className="bg-gradient-to-br from-red-400 to-red-600 text-white border-2 border-white/70 font-bold h-12 md:h-14 rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <RotateCcw size={18} className="md:w-5 md:h-5" />
            </motion.button>
          </div>
        </div>

        {/* Large screen horizontal layout */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4 flex-wrap">
            {/* Negative button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick("-")}
              disabled={currentQuestion?.isAnswered || !activeInputId}
              className="bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-white/70 text-white font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              <span className="text-xl md:text-2xl lg:text-3xl">-</span>
            </motion.button>

            {/* Backspace button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackspace}
              disabled={currentQuestion?.isAnswered || !activeInputId}
              className="bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-white/70 text-white font-bold py-3 px-4 md:py-4 md:px-6 lg:py-5 lg:px-6 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
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
                disabled={currentQuestion?.isAnswered || !activeInputId}
                className="bg-gradient-to-br from-emerald-400 to-green-500 border-4 border-white/70 text-white text-xl md:text-2xl lg:text-3xl font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ touchAction: "manipulation" }}
              >
                {num}
              </motion.button>
            ))}

            {/* Decimal button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick(".")}
              disabled={currentQuestion?.isAnswered || !activeInputId}
              className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white/70 text-white text-xl md:text-2xl lg:text-3xl font-bold w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: "manipulation" }}
            >
              .
            </motion.button>

            {/* Clear current button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearCurrent}
              disabled={currentQuestion?.isAnswered || !activeInputId}
              className="bg-gradient-to-br from-red-400 to-red-600 text-white border-4 border-white/70 text-sm md:text-lg lg:text-xl font-bold py-3 px-4 md:py-4 md:px-6 lg:py-6 lg:px-6 rounded-xl hover:brightness-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ImageBasedGameplay;
