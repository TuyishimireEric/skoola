import { GameDataI } from "@/types/Course";
import { QuestionDataI } from "@/types/Questions";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Pause, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface FillInTheBlankOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface ProcessedBlank {
  options: FillInTheBlankOption[];
  correctAnswer: string;
  userAnswer: string;
}

interface FillInTheBlankQuestion {
  questionText: string;
  blanks: ProcessedBlank[];
  explanation?: string;
  difficulty: string;
  originalQuestion: string;
  audioUrl?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
}

interface FillInTheBlankGameplayProps {
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

const FillInTheBlankGameplay: React.FC<FillInTheBlankGameplayProps> = ({
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
  const [showResults, setShowResults] = useState(false);
  const [processedQuestions, setProcessedQuestions] = useState<
    FillInTheBlankQuestion[]
  >([]);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement>(null);

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

  // Parse question data to extract audio URL
  const parseQuestionData = (questionText: string): { audioUrl?: string } => {
    try {
      const parsedData = JSON.parse(questionText);
      if (parsedData.audioUrl) {
        return { audioUrl: parsedData.audioUrl };
      }
    } catch (e) {
      const err = e as Error;
      console.error("Error parsing question data:", err.message);

      const audioMatch = questionText.match(/audioUrl:([^|]+)/);
      if (audioMatch) {
        return { audioUrl: audioMatch[1].trim() };
      }
    }
    return {};
  };

  // Process questions to create fill-in-the-blank problems
  useEffect(() => {
    const formatFillInTheBlankQuestions = (
      questions: QuestionDataI[]
    ): FillInTheBlankQuestion[] => {
      return questions.map((q) => {
        let audioUrl: string | undefined;

        try {
          const parsedData = JSON.parse(q.QuestionText);
          const audioData = parseQuestionData(q.QuestionText);
          audioUrl = audioData.audioUrl;

          if (
            parsedData.question &&
            parsedData.options &&
            parsedData.correctAnswers
          ) {
            const blanks: ProcessedBlank[] = [];
            const options: FillInTheBlankOption[] = parsedData.options.map(
              (option: string, index: number) => ({
                id: (index + 1).toString(),
                text: option,
                isCorrect: parsedData.correctAnswers.includes(option),
              })
            );

            const numBlanks = parsedData.blanksCount || 1;
            for (let i = 0; i < numBlanks; i++) {
              const correctAnswer =
                parsedData.correctAnswers[i] || parsedData.correctAnswers[0];
              blanks.push({
                options: options,
                correctAnswer: correctAnswer,
                userAnswer: "",
              });
            }

            return {
              questionText: parsedData.question,
              blanks,
              explanation: q.Explanation,
              difficulty: q.Difficulty,
              originalQuestion: parsedData.question,
              audioUrl,
              isAnswered: false,
            };
          }
        } catch (e) {
          console.error("Error parsing question:", e);
          const audioData = parseQuestionData(q.QuestionText);
          audioUrl = audioData.audioUrl;
        }

        // Fallback: Create a simple fill-in-the-blank from text
        const questionText = q.QuestionText || "";
        const blanks: ProcessedBlank[] = [];
        const blankMatches = questionText.match(/___/g);
        const numBlanks = blankMatches ? blankMatches.length : 1;

        for (let i = 0; i < Math.min(numBlanks, 2); i++) {
          blanks.push({
            options: [
              { id: "1", text: q.CorrectAnswer || "Answer", isCorrect: true },
              { id: "2", text: "Option 2", isCorrect: false },
              { id: "3", text: "Option 3", isCorrect: false },
            ],
            correctAnswer: q.CorrectAnswer || "Answer",
            userAnswer: "",
          });
        }

        return {
          questionText,
          blanks,
          explanation: q.Explanation,
          difficulty: q.Difficulty,
          originalQuestion: questionText,
          audioUrl,
          isAnswered: false,
        };
      });
    };

    if (questions.length > 0) {
      const processed = formatFillInTheBlankQuestions(questions);
      setProcessedQuestions(processed);
    }
  }, [questions]);

  // Reset states when question changes
  useEffect(() => {
    setIsPlayingAudio(false);
    setSelectedBlankIndex(0);
  }, [currentIndex]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion || gameOver || showResults) return;

      if (e.key >= "1" && e.key <= "9") {
        const optionIndex = parseInt(e.key) - 1;
        const currentBlank = currentQuestion.blanks[selectedBlankIndex];
        if (currentBlank && optionIndex < currentBlank.options.length) {
          handleOptionSelect(
            selectedBlankIndex,
            currentBlank.options[optionIndex].text
          );
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (currentQuestion.blanks.length > 1) {
          setSelectedBlankIndex(
            (prev) => (prev + 1) % currentQuestion.blanks.length
          );
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allBlanksFilled()) {
          handleContinue();
        }
      } else if (e.key === "Backspace" || e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, selectedBlankIndex, gameOver, showResults]);

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

  // Calculate final results
  const calculateResults = () => {
    let correctCount = 0;
    const missedQuestions: string[] = [];

    processedQuestions.forEach((question, index) => {
      if (question.isAnswered) {
        const isCorrect = question.blanks.every(
          (blank) => blank.userAnswer.trim() === blank.correctAnswer.trim()
        );

        if (isCorrect) {
          correctCount++;
        } else {
          missedQuestions.push(questions[index].Id || "");
        }
      } else {
        // Unanswered questions are considered missed
        missedQuestions.push(questions[index].Id || "");
      }
    });

    const completedOn = new Date().toISOString();
    const timeSpent = (game.Duration || 300) - timeLeft;

    // Calculate percentage for current game only
    const currentGameScore =
      processedQuestions.length > 0
        ? ((correctCount / processedQuestions.length) * 100).toFixed(2)
        : "0";

    // Update cumulative score (total points across all games)
    setTotalScore(totalScore + correctCount);

    onComplete({
      Score: currentGameScore, // This should always be 0-100%
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

  // Handle option selection
  const handleOptionSelect = (blankIndex: number, optionText: string) => {
    if (!currentQuestion || currentQuestion.isAnswered) return;

    setProcessedQuestions((prev) =>
      prev.map((q, qIndex) => {
        if (qIndex === currentIndex) {
          const newBlanks = [...q.blanks];
          newBlanks[blankIndex] = {
            ...newBlanks[blankIndex],
            userAnswer: optionText,
          };
          return { ...q, blanks: newBlanks };
        }
        return q;
      })
    );
  };

  // Handle clear
  const handleClear = () => {
    if (!currentQuestion || currentQuestion.isAnswered) return;

    setProcessedQuestions((prev) =>
      prev.map((q, qIndex) => {
        if (qIndex === currentIndex) {
          const newBlanks = q.blanks.map((blank) => ({
            ...blank,
            userAnswer: "",
          }));
          return { ...q, blanks: newBlanks };
        }
        return q;
      })
    );
    setSelectedBlankIndex(0);
  };

  // Check if all blanks are filled
  const allBlanksFilled = (): boolean => {
    if (!currentQuestion) return false;
    return currentQuestion.blanks.every(
      (blank) => blank.userAnswer.trim() !== ""
    );
  };

  // Handle continue to next question
  const handleContinue = () => {
    if (!currentQuestion || !allBlanksFilled()) return;

    // Mark question as answered
    setProcessedQuestions((prev) =>
      prev.map((q, qIndex) => {
        if (qIndex === currentIndex) {
          return { ...q, isAnswered: true };
        }
        return q;
      })
    );

    // Move to next question or finish
    if (currentIndex < processedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const newCurrentQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newCurrentQuestionIndex);
      setSelectedBlankIndex(0);
    } else {
      setShowResults(true);
    }
  };

  const renderQuestionWithBlanks = () => {
    if (!currentQuestion) return null;

    const questionText = currentQuestion.questionText;
    let blankIndex = 0;
    const parts = questionText.split(/___+/);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        result.push(
          <span key={`text-${i}`} className="whitespace-pre-wrap">
            {parts[i]}
          </span>
        );
      }

      if (i < parts.length - 1 && blankIndex < currentQuestion.blanks.length) {
        const blank = currentQuestion.blanks[blankIndex];
        const isSelected = selectedBlankIndex === blankIndex;

        result.push(
          <motion.button
            key={`blank-${blankIndex}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              inline-block min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[150px] 
              px-2 md:px-3 lg:px-4 py-1 md:py-2 lg:py-3 mx-1 md:mx-2
              text-center rounded-lg md:rounded-xl 
              border-2 md:border-3 lg:border-4 font-bold
              transition-all duration-300 focus:outline-none
              ${
                currentQuestion.isAnswered
                  ? "bg-gray-200 border-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "bg-gradient-to-br from-primary-200 to-primary-300 border-primary-500 ring-2 ring-primary-300"
                  : "bg-gradient-to-br from-yellow-200 to-green-100 border-yellow-500"
              }
              ${blank.userAnswer ? "text-gray-800" : "text-gray-500"}
            `}
            style={{ fontSize: "inherit" }}
            disabled={currentQuestion.isAnswered}
          >
            {blank.userAnswer || `___`}
          </motion.button>
        );

        blankIndex++;
      }
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-1">
        {result}
      </div>
    );
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
          📝
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
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-2 md:p-4 lg:p-6 min-h-[50vh] lg:min-h-[60vh]">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentIndex}
              // variants={questionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-6xl flex flex-col gap-4"
            >
              {/* Question area */}
              <motion.div className="rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 ">
                <div className="text-center space-y-4 md:space-y-6">
                  <h2 className="text-sm md:text-lg lg:text-xl font-bold text-gray-700">
                    Fill in the blank
                    {currentQuestion.blanks.length > 1 ? "s" : ""}
                  </h2>

                  {/* Question with blanks */}
                  <div className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-relaxed">
                    {renderQuestionWithBlanks()}
                  </div>

                  {/* Blank indicator */}
                  {currentQuestion.blanks.length > 1 &&
                    !currentQuestion.isAnswered && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="text-sm text-gray-600 mr-2">
                          Blanks:
                        </span>
                        {currentQuestion.blanks.map((_, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            className={`
                            w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full border-2 
                            cursor-pointer transition-all duration-300
                            ${
                              selectedBlankIndex === index
                                ? "bg-primary-500 border-primary-600"
                                : currentQuestion.blanks[index].userAnswer
                                ? "bg-green-400 border-green-500"
                                : "bg-gray-300 border-gray-400"
                            }
                          `}
                            onClick={() => setSelectedBlankIndex(index)}
                            title={`Blank ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                </div>
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
                  disabled={!allBlanksFilled() || currentQuestion.isAnswered}
                  className="bg-gradient-to-r from-yellow-500 to-green-700 hover:from-green-600 hover:to-yellow-600 text-white font-bold py-3 px-8 md:py-4 md:px-12 lg:py-5 lg:px-16 rounded-full flex items-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-lg transform transition-all"
                >
                  Continue
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options panel */}
      <AnimatePresence>
        {currentQuestion &&
          currentQuestion.blanks[selectedBlankIndex] &&
          !currentQuestion.isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="relative z-20 backdrop-blur-sm border-t border-orange-200 p-2 md:p-3 lg:p-4"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-4">
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-700">
                    Choose the correct answer for Blank {selectedBlankIndex + 1}
                    {currentQuestion.blanks.length > 1 && (
                      <span className="text-xs md:text-sm text-gray-500 block mt-1">
                        (Press Tab to switch between blanks)
                      </span>
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
                  {currentQuestion.blanks[selectedBlankIndex].options.map(
                    (option, index) => (
                      <motion.button
                        key={option.id}
                        custom={index}
                        variants={optionVariants}
                        initial="initial"
                        animate="animate"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          handleOptionSelect(selectedBlankIndex, option.text)
                        }
                        className={`
                      p-3 md:p-4 lg:p-5 rounded-2xl lg:rounded-3xl border-3 md:border-4 
                      font-bold text-sm md:text-lg lg:text-2xl text-center 
                      transition-all duration-300 shadow-lg gap-4 
                      ${
                        currentQuestion.blanks[selectedBlankIndex]
                          .userAnswer === option.text
                          ? "bg-gradient-to-br from-yellow-400 to-primary-400 text-white border-primary-200 ring-4 ring-primary-300"
                          : "bg-gradient-to-br from-yellow-400 to-green-600 text-white border-yellow-400 hover:from-green-500 hover:to-green-600"
                      }
                    `}
                        title={`Press ${index + 1} for this option`}
                      >
                        <span className="text-xs opacity-70 mr-3 bg-white/10 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        {option.text}
                      </motion.button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default FillInTheBlankGameplay;
