import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  Volume2,
  Pause,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

interface SelectChoiceQuestion {
  questionText: string;
  options: string[];
  correctAnswers: string[];
  allowMultiple: boolean;
  originalQuestion: string;
  explanation?: string;
  difficulty: string;
  imageUrl?: string;
  imageDescription?: string;
  audioUrl?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface SelectChoiceGameplayProps {
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

const SelectChoiceGameplay: React.FC<SelectChoiceGameplayProps> = ({
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
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(game.Duration || 300);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<
    SelectChoiceQuestion[]
  >([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  // Track correct answers for this section only
  const [sectionCorrectCount, setSectionCorrectCount] = useState(0);

  const currentQuestion = processedQuestions[currentIndex];

  const optionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    }),
  };

  // Cloudinary URL optimization helper
  const optimizeCloudinaryUrl = useCallback((url: string): string => {
    if (!url || !url.includes("cloudinary")) return url;

    if (url.includes("/f_auto,q_auto/") || url.includes("/f_auto/")) {
      return url;
    }

    const cloudinaryTransformations =
      "f_auto,q_auto,w_800,h_600,c_fit,dpr_auto";

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

  // Parse question data from equation string - Enhanced to support audio
  const parseQuestionData = (questionText: string): { audioUrl?: string } => {
    try {
      const parsedData = JSON.parse(questionText);
      if (parsedData.audioUrl) {
        return { audioUrl: parsedData.audioUrl };
      }
    } catch (e) {
      console.log(e);
      // Silently handle non-JSON data - this is expected for regular question text
      const audioMatch = questionText.match(/audioUrl:([^|]+)/);
      if (audioMatch) {
        return { audioUrl: audioMatch[1].trim() };
      }
    }
    return {};
  };

  // Parse choice question
  const parseChoiceQuestion = (equation: string): SelectChoiceQuestion => {
    let audioUrl: string | undefined;

    try {
      // First, try to extract audio data (this might fail for regular text, which is fine)
      const audioData = parseQuestionData(equation);
      audioUrl = audioData.audioUrl;

      // Try to parse as pipe-separated format
      const parts = equation.split("|");
      if (parts.length >= 4) {
        const questionText = parts[0] || "";
        const optionsStr = parts[1] || "";
        const correctAnswersStr = parts[2] || "";
        const allowMultipleStr = parts[3] || "false";
        const imageUrl = parts[4] || "";
        const imageDescription = parts[5] || "";

        try {
          const options = optionsStr ? JSON.parse(optionsStr) : [];
          const correctAnswers = correctAnswersStr
            ? JSON.parse(correctAnswersStr)
            : [];
          const allowMultiple = allowMultipleStr === "true";

          return {
            questionText,
            options,
            correctAnswers,
            allowMultiple,
            originalQuestion: equation,
            explanation: "",
            difficulty: "Medium",
            imageUrl: imageUrl.trim() || undefined,
            imageDescription: imageDescription.trim() || undefined,
            audioUrl,
            isAnswered: false,
          };
        } catch (jsonError) {
          console.warn("Error parsing JSON parts in question:", jsonError);
        }
      }
    } catch (error) {
      console.warn("Error parsing choice question format:", error);
    }

    // Fallback: treat as plain text question
    return {
      questionText: equation,
      options: [],
      correctAnswers: [],
      allowMultiple: false,
      originalQuestion: equation,
      explanation: "",
      difficulty: "Medium",
      audioUrl,
      isAnswered: false,
    };
  };

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

  // Process questions and preload images
  useEffect(() => {
    const formatChoiceQuestions = (
      questions: QuestionDataI[]
    ): SelectChoiceQuestion[] => {
      return questions.map((q) => {
        const parsed = parseChoiceQuestion(q.QuestionText);
        return {
          ...parsed,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          originalQuestion: q.QuestionText,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatChoiceQuestions(questions);
      setProcessedQuestions(processed);

      // Preload all images in the background
      const preloadAllImages = async () => {
        const imageUrls = processed
          .map((q) => q.imageUrl)
          .filter(Boolean) as string[];

        const priorityUrls = imageUrls.slice(0, Math.min(3, imageUrls.length));

        try {
          await Promise.all(priorityUrls.map((url) => preloadImage(url)));
        } catch (error) {
          console.warn("Some images failed to preload:", error);
        }

        if (imageUrls.length > 3) {
          imageUrls.slice(3).forEach((url) => {
            preloadImage(url).catch((err) =>
              console.warn("Background preload failed:", err)
            );
          });
        }
      };

      preloadAllImages();
    }
  }, [questions, preloadImage]);

  // Reset states when question changes
  useEffect(() => {
    setIsPlayingAudio(false);
    setSelectedAnswers([]);

    const currentImg = currentQuestion?.imageUrl;
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
  }, [
    currentIndex,
    currentQuestion,
    preloadedImages,
    processedQuestions,
    preloadImage,
  ]);

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

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          handleOptionSelect(currentQuestion.options[optionIndex]);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedAnswers.length > 0) {
          handleContinue();
        }
      } else if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAnswers, currentQuestion, gameOver, showResults]);

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

    // Calculate percentage for current game type only (for display purposes)
    const currentGameScore =
      processedQuestions.length > 0
        ? ((sectionCorrectCount / processedQuestions.length) * 100).toFixed(2)
        : "0";

    // Update cumulative score (this is already updated per question in handleContinue)
    // Total score across all games is maintained in the parent component

    onComplete({
      Score: currentGameScore, // This is just for display (0-100%)
      MissedQuestions: missedQuestions.join(", "),
      StartedOn: startTime,
      CompletedOn: completedOn,
      TimeSpent: timeSpent,
    });
  };

  // Audio functions
  const playAudio = () => {
    if (audioElementRef.current && currentQuestion?.audioUrl) {
      setIsPlayingAudio(true);
      audioElementRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlayingAudio(false);
      });
    }
  };

  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  const getInstructionText = (question: SelectChoiceQuestion): string => {
    if (question.allowMultiple) {
      return "Select all correct answers";
    }
    return "Choose the correct answer";
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (!currentQuestion || currentQuestion.isAnswered) return;

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (currentQuestion.allowMultiple) {
      // Multiple selection mode
      if (selectedAnswers.includes(option)) {
        setSelectedAnswers(selectedAnswers.filter((ans) => ans !== option));
      } else {
        setSelectedAnswers([...selectedAnswers, option]);
      }
    } else {
      // Single selection mode
      setSelectedAnswers([option]);
    }
  };

  // Handle clear
  const handleClear = () => {
    if (!currentQuestion || currentQuestion.isAnswered) return;
    setSelectedAnswers([]);
  };

  // Validate answer
  const validateAnswer = (): boolean => {
    if (!currentQuestion || selectedAnswers.length === 0) return false;

    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...currentQuestion.correctAnswers].sort();

    return (
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((answer, index) => answer === sortedCorrect[index])
    );
  };

  // Check if answers are selected
  const hasSelectedAnswers = (): boolean => {
    return selectedAnswers.length > 0;
  };

  // Handle continue to next question
  const handleContinue = () => {
    if (!currentQuestion || !hasSelectedAnswers()) return;

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
        setSelectedAnswers([]);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);

    if (currentQuestion?.imageUrl) {
      setPreloadedImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestion.imageUrl!);
        return newSet;
      });
    }
  };

  // Get option letter (A, B, C, etc.)
  const getOptionLetter = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  // Get dynamic styling for options
  const getOptionStyle = (isSelected: boolean) => {
    if (isSelected) {
      return `
        bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-400 
        text-white border-orange-300 ring-4 ring-orange-200 shadow-2xl
        transform scale-105 shadow-orange-300/50
      `;
    }
    return `
      bg-gradient-to-br from-slate-50 to-gray-100 text-gray-800 
      border-gray-300 hover:border-orange-400 
      hover:shadow-xl hover:shadow-orange-200/30
      hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50
      hover:scale-102 hover:-translate-y-1
      active:scale-98 active:translate-y-0
    `;
  };

  // Get dynamic circle styling
  const getCircleStyle = (isSelected: boolean) => {
    if (isSelected) {
      return `
        bg-white text-orange-600 border-white/50 shadow-lg 
        ring-2 ring-white/30 font-black
      `;
    }
    return `
      bg-gray-200 border-gray-400 text-gray-700 
      group-hover:bg-orange-500 group-hover:text-white 
      group-hover:border-orange-600 group-hover:shadow-md
      transition-all duration-300
    `;
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

      {/* Hidden audio element */}
      {currentQuestion?.audioUrl && (
        <audio
          ref={audioElementRef}
          src={currentQuestion.audioUrl}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      )}

      {/* Main content */}
      <div className="relative z-20 flex-1 flex flex-col justify-start items-center p-2 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentIndex}
              initial="initial"
              exit="exit"
              className="w-full max-w-6xl flex flex-col gap-4"
            >
              {/* Question area */}
              <motion.div className="rounded-2xl lg:rounded-3xl">
                {/* Header with instruction */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Target className="text-orange-600" size={24} />
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700">
                    {getInstructionText(currentQuestion)}
                  </h2>
                </div>

                {/* Conditional layout based on image availability */}
                {currentQuestion.imageUrl ? (
                  /* Side-by-side layout when image is available */
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left side - Image display */}
                    <motion.div
                      initial="initial"
                      animate="animate"
                      className="w-full lg:w-1/2"
                    >
                      {/* Image description */}
                      {currentQuestion.imageDescription && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="rounded-xl border-2 p-4 mb-4"
                        >
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            <span className="font-bold text-blue-800">
                              Description:{" "}
                            </span>
                            {currentQuestion.imageDescription}
                          </p>
                        </motion.div>
                      )}

                      <div className="relative">
                        <motion.div
                          className="relative rounded-2xl overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={optimizeCloudinaryUrl(
                              currentQuestion.imageUrl
                            )}
                            alt={
                              currentQuestion.imageDescription ||
                              "Question image"
                            }
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className="w-full h-64 md:h-80 object-contain"
                            width={600}
                            height={400}
                            priority={currentIndex < 3}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          />

                          {/* Loading overlay */}
                          <AnimatePresence>
                            {imageLoading && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                  >
                                    <Loader2
                                      className="text-blue-500"
                                      size={40}
                                    />
                                  </motion.div>
                                  <span className="text-gray-600 font-semibold">
                                    Loading image...
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Error overlay */}
                          <AnimatePresence>
                            {imageError && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm"
                              >
                                <div className="flex flex-col items-center gap-3 text-red-600">
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                    }}
                                  >
                                    <ImageIcon size={48} />
                                  </motion.div>
                                  <span className="font-semibold">
                                    Image could not be loaded
                                  </span>
                                  <span className="text-sm">
                                    Please continue with the description
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Right side - Question and options */}
                    <div className="w-full lg:w-1/2 space-y-2">
                      {/* Question text */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-4"
                      >
                        <div className="text-lg md:text-xl font-bold text-gray-800 leading-relaxed text-start">
                          {currentQuestion.questionText}
                        </div>
                      </motion.div>

                      {/* Options */}
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => {
                          const isSelected = selectedAnswers.includes(option);

                          return (
                            <motion.button
                              key={index}
                              custom={index}
                              variants={optionVariants}
                              initial="initial"
                              animate="animate"
                              whileHover={{
                                scale: isSelected ? 1.05 : 1.02,
                                y: isSelected ? 0 : -4,
                                transition: { duration: 0.2 },
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleOptionSelect(option)}
                              disabled={currentQuestion.isAnswered}
                              className={`
                                group relative w-full p-3 rounded-xl border-3 
                                font-bold text-left transition-all duration-300 shadow-lg
                                ${getOptionStyle(isSelected)}
                                ${
                                  currentQuestion.isAnswered
                                    ? "cursor-not-allowed opacity-70"
                                    : "cursor-pointer"
                                }
                                backdrop-blur-sm
                              `}
                            >
                              <div className="flex items-center gap-3 relative z-10">
                                <div
                                  className={`
                                  w-8 h-8 md:w-10 md:h-10 rounded-full border-2 
                                  flex items-center justify-center font-bold text-sm md:text-base
                                  transition-all duration-300 shadow-md
                                  ${getCircleStyle(isSelected)}
                                `}
                                >
                                  {getOptionLetter(index)}
                                </div>

                                <span className="text-sm md:text-base lg:text-lg flex-1 leading-relaxed font-semibold">
                                  {option}
                                </span>

                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 20,
                                    }}
                                    className="text-lg md:text-xl text-white drop-shadow-lg"
                                  >
                                    ✓
                                  </motion.div>
                                )}
                              </div>

                              {/* Enhanced glow effect for selected options */}
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400/20 via-yellow-400/20 to-amber-400/20 pointer-events-none blur-sm -z-10"
                                />
                              )}

                              {/* Hover shimmer effect */}
                              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                              </div>

                              {/* Selection pulse animation */}
                              {isSelected && (
                                <motion.div
                                  animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                  }}
                                  transition={{
                                    duration: 2,
                                    ease: "easeInOut",
                                  }}
                                  className="absolute inset-0 rounded-xl bg-orange-400/30 pointer-events-none -z-10"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Original centered layout when no image */
                  <div className="">
                    {/* Question text */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed mb-3">
                        {currentQuestion.questionText}
                      </div>
                    </motion.div>

                    {/* Options */}
                    <div
                      className={`grid gap-2 ${
                        currentQuestion.options.length > 4
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswers.includes(option);

                        return (
                          <motion.button
                            key={index}
                            custom={index}
                            variants={optionVariants}
                            initial="initial"
                            animate="animate"
                            whileHover={{
                              scale: isSelected ? 1.01 : 1.01,
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOptionSelect(option)}
                            disabled={currentQuestion.isAnswered}
                            className={`
                              group relative p-4 rounded-2xl
                              font-bold text-left transition-all duration-300 shadow-lg
                              ${getOptionStyle(isSelected)}
                              ${
                                currentQuestion.isAnswered
                                  ? "cursor-not-allowed opacity-70"
                                  : "cursor-pointer"
                              }
                              backdrop-blur-sm overflow-hidden
                            `}
                          >
                            <div className="flex items-center gap-2 relative z-10">
                              <div
                                className={`
                                w-8 h-8 rounded-full border-2 
                                flex items-center justify-center font-bold text-base 
                                transition-all duration-300 shadow-md
                                ${getCircleStyle(isSelected)}
                              `}
                              >
                                {getOptionLetter(index)}
                              </div>

                              <span className="text-base  flex-1 leading-relaxed font-semibold">
                                {option}
                              </span>

                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                  }}
                                  className="text-xl md:text-2xl text-white drop-shadow-lg"
                                >
                                  ✓
                                </motion.div>
                              )}
                            </div>

                            {/* Enhanced glow effect for selected options */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 via-yellow-400/20 to-amber-400/20 pointer-events-none blur-sm -z-10"
                              />
                            )}

                            {/* Hover shimmer effect */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 w-full h-full"
                                animate={{
                                  x: ["-100%", "100%"],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeatDelay: 2,
                                  ease: "easeInOut",
                                }}
                              />
                            </div>

                            {/* Selection pulse animation */}
                            {isSelected && (
                              <motion.div
                                animate={{
                                  scale: [1, 1.05, 1],
                                  opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="absolute inset-0 rounded-2xl bg-orange-400/30 pointer-events-none -z-10"
                              />
                            )}

                            {/* Corner accent for selected */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full shadow-lg z-10"
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Audio and Continue buttons */}
              <div className="flex items-center justify-center gap-4">
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

                {/* Continue button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinue}
                  disabled={!hasSelectedAnswers() || currentQuestion.isAnswered}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-8 md:py-4 md:px-12 lg:py-5 lg:px-16 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-lg transform transition-all"
                >
                  Continue
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SelectChoiceGameplay;
