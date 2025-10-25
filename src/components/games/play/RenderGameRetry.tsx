import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  memo,
  lazy,
  Suspense,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Play,
  ArrowLeft,
  Clock,
  Sparkles,
  Trophy,
  Gamepad2,
  Volume2,
  VolumeX,
  SkipForward,
} from "lucide-react";

import { useRecordCourseSection } from "@/hooks/courses/useRecordCourseSection";
import { QuestionDataI } from "@/types/Questions";
import Loading from "@/components/loader/Loading";
import LoginModal from "@/components/auth/LoginModal";
import { GameDataI } from "@/types/Course";
import { useAddMissedQuestions } from "@/hooks/games/useMissedQuestions";
import { QUESTION_TYPE_CONFIG, QuestionType } from "@/types/GamePlay";
import { useClientSession } from "@/hooks/user/useClientSession";
import { useUpdatePassedQuestions } from "@/hooks/games/useMissedQuestions";

// Lazy load gameplay components for better performance
const MathGameplay = lazy(() => import("./MathGameplay"));
const ComparisonGameplay = lazy(() => import("./ComparisonGamePlay"));
const SelectChoiceGameplay = lazy(() => import("./SelectChoiceGamePlay"));
const MathEquationGameplay = lazy(() => import("./MathEquationGamePlay"));
const FractionGameplay = lazy(() => import("./FractionGamePlay"));
const NumberSequenceGameplay = lazy(() => import("./NumberSequenceGamePlay"));
const WordProblemsGameplay = lazy(() => import("./WordProblemsGamePlay"));
const ImageBasedGameplay = lazy(() => import("./ImageBasedGamePlay"));
const FillInTheBlankGameplay = lazy(() => import("./FillInBlanksGamePlay"));
const SentenceSortingGamePlay = lazy(() => import("./SentenceSortingGamePlay"));
const WhatIsThisGameplay = lazy(() => import("./WhatIsThisGamePlay"));
const GameOverScreen = lazy(() => import("./RenderGameOverRetry"));

interface GameSession {
  score: number;
  missedQuestions: string;
  startedOn: string;
  completedOn: string;
  isAnonymous: boolean;
  totalQuestions: number;
  timeSpent?: number;
  questionsAnswered: number;
  questionTypeBreakdown: Record<string, { correct: number; total: number }>;
}

interface RenderGameRetryProps {
  questionIds: string[];
  questions: QuestionDataI[];
  game: GameDataI & { TutorialVideo?: string };
  onBack: () => void;
  isCompleted?: (score: string) => void;
  isLoading?: boolean;
}

// Memoized utility function
const getYouTubeVideoId = (url: string): string | null => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

// Memoized format time function
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Memoized loading component
const GameLoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <motion.div
        className="text-6xl mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        🎮
      </motion.div>
      <p className="text-lg font-semibold text-gray-600">Loading game...</p>
    </div>
  </div>
));

GameLoadingSpinner.displayName = "GameLoadingSpinner";

// Memoized header component
const GameHeader = memo(
  ({
    onBack,
    progressPercentage,
    currentQuestionIndex,
    questionsLength,
    currentQuestion,
    timeLeft,
  }: {
    onBack: () => void;
    progressPercentage: number;
    currentQuestionIndex: number;
    questionsLength: number;
    currentQuestion: QuestionDataI | undefined;
    timeLeft: number;
  }) => {
    return (
      <div className="relative z-20 p-2 flex-shrink-0">
        <div className="backdrop-blur-lg rounded-2xl p-2 md:p-3">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-1 md:gap-2 text-white font-bold bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 px-2 md:px-4 py-1.5 rounded-xl shadow-lg text-sm md:text-base"
            >
              <ArrowLeft size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Exit</span>
            </motion.button>

            <div className="flex-1 mx-2 md:mx-4 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xl">
                    {QUESTION_TYPE_CONFIG[
                      (typeof currentQuestion?.QuestionType === "string"
                        ? currentQuestion.QuestionType
                        : String(currentQuestion?.QuestionType)) as QuestionType
                    ]?.emoji || "🎮"}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-gray-700">
                    Question {currentQuestionIndex + 1} of {questionsLength}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                  {currentQuestion
                    ? QUESTION_TYPE_CONFIG[
                        (typeof currentQuestion.QuestionType === "string"
                          ? currentQuestion.QuestionType
                          : String(
                              currentQuestion.QuestionType
                            )) as QuestionType
                      ]?.label || String(currentQuestion.QuestionType)
                    : "Loading..."}
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 md:h-4 border-2 border-orange-300 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  className="absolute h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-3">
              <motion.div
                className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-red-100 to-pink-100 px-2 md:px-3 py-1 rounded-full border-2 border-red-300 shadow-md"
                animate={{ scale: timeLeft < 60 ? [1, 1.1, 1] : 1 }}
                transition={{
                  duration: 1,
                  repeat: timeLeft < 60 ? Infinity : 0,
                }}
              >
                <Clock size={12} className="md:w-6 md:h-6 text-red-600" />
                <span className="font-bold text-red-700 text-xs md:text-sm">
                  {formatTime(timeLeft)}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GameHeader.displayName = "GameHeader";

// Main component with optimizations
export const RenderGameRetry: React.FC<RenderGameRetryProps> = memo(
  ({
    questions,
    game,
    onBack,
    isCompleted,
    questionIds,
    isLoading = false,
  }) => {
    const { onSubmit } = useRecordCourseSection();
    const { onSubmit: submitMissedQuestions } = useAddMissedQuestions();
    const { data: session, status } = useSession();
    const { userName } = useClientSession();
    const { onSubmit: updatePassedQuestions } = useUpdatePassedQuestions();

    // State management
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [allMissedQuestions, setAllMissedQuestions] = useState<string[]>([]);
    const [questionTypeBreakdown, setQuestionTypeBreakdown] = useState<
      Record<string, { correct: number; total: number }>
    >({});
    const [timeLeft, setTimeLeft] = useState(game.Duration || 1800);
    const [gameOver, setGameOver] = useState(false);

    // Use ref to track if game completion has been processed
    const gameCompletionProcessed = useRef(false);

    // Memoized values
    const gameStartTime = useMemo(() => new Date().toISOString(), []);

    const videoId = useMemo(
      () => (game.TutorialVideo ? getYouTubeVideoId(game.TutorialVideo) : null),
      [game.TutorialVideo]
    );

    const isAuthenticated = useMemo(
      () => status === "authenticated" && !!session?.user?.id,
      [status, session?.user?.id]
    );

    // Optimized question organization
    const organizedQuestions = useMemo(() => {
      const groups: Array<{
        type: string;
        questions: QuestionDataI[];
        startIndex: number;
      }> = [];
      const typeGroups: Record<string, QuestionDataI[]> = {};

      questions.forEach((question) => {
        const type =
          typeof question.QuestionType === "string"
            ? question.QuestionType
            : String(question.QuestionType);

        if (!typeGroups[type]) {
          typeGroups[type] = [];
        }
        typeGroups[type].push(question);
      });

      let currentIndex = 0;
      Object.entries(typeGroups).forEach(([type, typeQuestions]) => {
        groups.push({
          type,
          questions: typeQuestions,
          startIndex: currentIndex,
        });
        currentIndex += typeQuestions.length;
      });

      return { groups, allQuestions: questions };
    }, [questions]);

    const currentQuestionGroup = useMemo(() => {
      const group = organizedQuestions.groups.find(
        (group) =>
          currentQuestionIndex >= group.startIndex &&
          currentQuestionIndex < group.startIndex + group.questions.length
      );

      if (!group) return null;

      const indexInGroup = currentQuestionIndex - group.startIndex;
      return {
        type: group.type,
        questions: group.questions,
        currentIndex: indexInGroup,
        groupStartIndex: group.startIndex,
      };
    }, [currentQuestionIndex, organizedQuestions.groups]);

    const currentQuestion = useMemo(
      () => organizedQuestions.allQuestions[currentQuestionIndex],
      [organizedQuestions.allQuestions, currentQuestionIndex]
    );

    const progressPercentage = useMemo(
      () => ((currentQuestionIndex + 1) / questions.length) * 100,
      [currentQuestionIndex, questions.length]
    );

    // Initialize question type breakdown only once
    useEffect(() => {
      const breakdown: Record<string, { correct: number; total: number }> = {};
      organizedQuestions.groups.forEach((group) => {
        breakdown[group.type] = { correct: 0, total: group.questions.length };
      });
      setQuestionTypeBreakdown(breakdown);
    }, [organizedQuestions.groups]);

    // Timer effect with cleanup
    useEffect(() => {
      if (!gameStarted || timeLeft <= 0 || gameOver) return;

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
    }, [gameStarted, timeLeft, gameOver]);

    // Game completion handler - separate from effect
    const handleGameCompletion = useCallback(() => {
      // Prevent multiple executions
      if (gameCompletionProcessed.current) return;
      gameCompletionProcessed.current = true;

      const completedOn = new Date().toISOString();
      const timeSpent = (game.Duration || 1800) - timeLeft;

      const sessionData: GameSession = {
        score: Math.round((totalScore / questions.length) * 100),
        missedQuestions: allMissedQuestions.join(", "),
        startedOn: gameStartTime,
        completedOn,
        isAnonymous: !isAuthenticated,
        totalQuestions: questions.length,
        timeSpent,
        questionsAnswered: currentQuestionIndex,
        questionTypeBreakdown,
      };

      setGameSession(sessionData);

      // Handle session saving
      if (isAuthenticated && session?.user?.id) {
        const correctQuestionIds = questionIds.filter(
          (id) => !allMissedQuestions.includes(id)
        );

        if (session?.user?.id && correctQuestionIds.length > 0) {
          updatePassedQuestions({
            studentId: session.user.id,
            questionIds: correctQuestionIds,
          });
        }
      } else {
        // Handle anonymous session
        const anonymousData = {
          GameId: game.Id,
          score: sessionData.score,
          completedOn,
          GameTitle: game.Title,
        };

        try {
          const existingData = JSON.parse(
            localStorage.getItem("anonymousScores") || "[]"
          );
          existingData.push(anonymousData);
          localStorage.setItem("anonymousScores", JSON.stringify(existingData));
        } catch (error) {
          console.warn("Failed to save anonymous score:", error);
        }
      }
    }, [
      timeLeft,
      totalScore,
      questions.length,
      allMissedQuestions,
      gameStartTime,
      isAuthenticated,
      currentQuestionIndex,
      questionTypeBreakdown,
      session?.user?.id,
      game,
      isCompleted,
      onSubmit,
      submitMissedQuestions,
    ]);

    // Check for game completion conditions
    useEffect(() => {
      if (!gameStarted || gameCompletionProcessed.current) return;

      const isGameComplete =
        gameOver || currentQuestionIndex >= questions.length;

      if (isGameComplete) {
        handleGameCompletion();
      }
    }, [
      gameOver,
      gameStarted,
      currentQuestionIndex,
      questions.length,
      handleGameCompletion,
    ]);

    // Optimized callback functions
    const handlePlayAgain = useCallback(() => {
      // Reset the completion processed flag
      gameCompletionProcessed.current = false;

      setGameSession(null);
      setShowTutorial(true);
      setPlayingVideo(false);
      setGameStarted(false);
      setCurrentQuestionIndex(0);
      setTotalScore(0);
      setAllMissedQuestions([]);
      setTimeLeft(game.Duration || 1800);
      setGameOver(false);

      const breakdown: Record<string, { correct: number; total: number }> = {};
      organizedQuestions.groups.forEach((group) => {
        breakdown[group.type] = { correct: 0, total: group.questions.length };
      });
      setQuestionTypeBreakdown(breakdown);
    }, [organizedQuestions.groups, game.Duration]);

    const handleStartGame = useCallback(() => {
      setShowTutorial(false);
      setPlayingVideo(false);
      setGameStarted(true);
    }, []);

    const handleMainBack = useCallback(() => {
      gameCompletionProcessed.current = false;
      setGameSession(null);
      setShowTutorial(true);
      setPlayingVideo(false);
      setGameStarted(false);
      setCurrentQuestionIndex(0);
      onBack();
    }, [onBack]);

    const handleQuestionTypeComplete = useCallback(
      (results: {
        Score: string;
        MissedQuestions: string;
        StartedOn: string;
        CompletedOn?: string;
        TimeSpent?: number;
      }) => {
        if (!currentQuestionGroup) return;

        const sectionScore = parseFloat(results.Score);
        const sectionCorrect = Math.round(
          (sectionScore / 100) * currentQuestionGroup.questions.length
        );

        if (results.MissedQuestions?.trim()) {
          setAllMissedQuestions((prev) => [
            ...prev,
            ...results.MissedQuestions.split(", ").filter((q) => q.trim()),
          ]);
        }

        setQuestionTypeBreakdown((prev) => ({
          ...prev,
          [currentQuestionGroup.type]: {
            ...prev[currentQuestionGroup.type],
            correct: sectionCorrect,
          },
        }));

        const nextGroupIndex = organizedQuestions.groups.findIndex(
          (group) => group.startIndex > currentQuestionIndex
        );

        if (nextGroupIndex !== -1) {
          const nextGroup = organizedQuestions.groups[nextGroupIndex];
          setCurrentQuestionIndex(nextGroup.startIndex);
        } else {
          setGameOver(true);
        }
      },
      [currentQuestionGroup, organizedQuestions.groups, currentQuestionIndex]
    );

    // Optimized gameplay renderer with lazy loading
    const renderCurrentGameplay = useCallback(() => {
      if (!currentQuestionGroup || !gameStarted) return null;

      const typeQuestions = currentQuestionGroup.questions;
      const gameForType = {
        ...game,
        Title: `${game.Title} - ${
          QUESTION_TYPE_CONFIG[
            currentQuestionGroup.type as keyof typeof QUESTION_TYPE_CONFIG
          ]?.label || currentQuestionGroup.type
        }`,
        Duration: undefined,
      };

      const commonProps = {
        questions: typeQuestions,
        game: gameForType,
        onBack: handleMainBack,
        onComplete: handleQuestionTypeComplete,
        setTotalScore,
        setCurrentQuestionIndex,
        timeLeft,
        totalScore,
        totalQuestions: questions.length,
        currentQuestionIndex,
      };

      const GameplayComponent = (() => {
        switch (currentQuestionGroup.type) {
          case "MissingNumber":
            return MathGameplay;
          case "Comparison":
            return ComparisonGameplay;
          case "SelectChoice":
            return SelectChoiceGameplay;
          case "WordProblems":
            return WordProblemsGameplay;
          case "MathEquation":
            return MathEquationGameplay;
          case "Fraction":
            return FractionGameplay;
          case "NumberSequence":
            return NumberSequenceGameplay;
          case "ImageBased":
            return ImageBasedGameplay;
          case "FillInTheBlank":
            return FillInTheBlankGameplay;
          case "SentenceSorting":
            return SentenceSortingGamePlay;
          case "Reading":
            return WhatIsThisGameplay;
          default:
            return null;
        }
      })();

      if (!GameplayComponent) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300">
            <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-orange-400">
              <div className="text-6xl mb-4">🚧</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Coming Soon!
              </h1>
              <p className="text-gray-600 mb-6">
                {currentQuestionGroup.type} gameplay is under development.
              </p>
              <button
                onClick={handleMainBack}
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg"
              >
                Back
              </button>
            </div>
          </div>
        );
      }

      return (
        <Suspense fallback={<GameLoadingSpinner />}>
          <GameplayComponent {...commonProps} />
        </Suspense>
      );
    }, [
      currentQuestionGroup,
      gameStarted,
      game,
      handleMainBack,
      handleQuestionTypeComplete,
      timeLeft,
      totalScore,
      questions.length,
      currentQuestionIndex,
    ]);

    // Early returns for loading and error states
    if (isLoading) {
      return <Loading overlay={true} fullScreen={false} />;
    }

    if (!questions?.length) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300">
          <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-red-400">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Questions Available
            </h1>
            <p className="text-gray-600 mb-6">
              This game doesn&apos;t have any questions yet.
            </p>
            <button
              onClick={handleMainBack}
              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg"
            >
              Back
            </button>
          </div>
        </div>
      );
    }

    // Game over screen
    if (gameSession) {
      return (
        <Suspense fallback={<GameLoadingSpinner />}>
          <GameOverScreen
            totalMissedQuestions={questionIds.length}
            correctAnswersInRetry={
              questionIds.length - allMissedQuestions.length
            }
            onPlayAgain={handlePlayAgain}
            onBackToHome={onBack}
            playerName={userName}
            gameName={game.Title}
          />

          {showLoginModal && (
            <LoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              message="Login to save your progress and compete on the leaderboard!"
            />
          )}
        </Suspense>
      );
    }

    // Tutorial screen
    if (showTutorial && !gameStarted) {
      const hasTutorial = !!game.TutorialVideo && !!videoId;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          <div
            className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-5xl text-center border-4 border-orange-400 relative z-10`}
          >
            {!playingVideo ? (
              <>
                <div className="text-5xl md:text-6xl mb-4">🎓</div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  {hasTutorial ? "Learn How to Play!" : "Ready to Play?"}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6">
                  {hasTutorial ? (
                    <>
                      Watch the tutorial for <strong>{game.Title}</strong> or
                      jump straight in!
                    </>
                  ) : (
                    <>
                      Let&apos;s start playing <strong>{game.Title}</strong>!
                    </>
                  )}
                </p>

                {hasTutorial && (
                  <div className="mb-6">
                    <div
                      className="relative w-full h-32 sm:h-40 md:h-48 lg:h-80 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-2xl border-4 border-orange-400 flex items-center justify-center overflow-hidden shadow-lg cursor-pointer"
                      onClick={() => setPlayingVideo(true)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="Tutorial"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-3 md:p-4 shadow-xl border-4 border-orange-400">
                          <Play
                            size={24}
                            className="text-orange-500 ml-1 md:w-10 md:h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleMainBack}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                  {hasTutorial && (
                    <button
                      onClick={() => setPlayingVideo(true)}
                      className="bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Play size={20} />
                      Watch Tutorial
                    </button>
                  )}
                  <button
                    onClick={handleStartGame}
                    className="bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Gamepad2 size={20} />
                    Start Playing!
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    {game.Title} - Tutorial
                  </h2>
                  <button
                    onClick={() => setVideoMuted(!videoMuted)}
                    className="p-2 bg-gradient-to-r from-yellow-100 to-green-100 rounded-lg border-2 border-green-300"
                  >
                    {videoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>

                <div className="flex-1 relative rounded-2xl overflow-hidden border-4 border-orange-400 shadow-xl bg-black">
                  <div className="relative w-full h-0 pb-[56.25%]">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${
                        videoMuted ? 1 : 0
                      }&rel=0&modestbranding=1`}
                      title={`${game.Title} Tutorial`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setPlayingVideo(false)}
                    className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    Start Playing!
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold py-2.5 md:py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <SkipForward size={18} />
                    Skip to Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Game started - show gameplay with header
    if (gameStarted) {
      return (
        <div className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col">
          <GameHeader
            onBack={handleMainBack}
            progressPercentage={progressPercentage}
            currentQuestionIndex={currentQuestionIndex}
            questionsLength={questions.length}
            currentQuestion={currentQuestion}
            timeLeft={timeLeft}
          />
          <div className="flex-1 relative z-10 pb-4">
            {renderCurrentGameplay()}
          </div>
        </div>
      );
    }

    // Game overview screen
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300 relative overflow-hidden">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full text-center border-4 border-orange-400 relative z-10">
          <div className="text-5xl md:text-6xl mb-4">
            <Gamepad2 className="w-16 h-16 md:w-20 md:h-20 mx-auto text-orange-500" />
          </div>

          <div className="flex justify-center gap-2 mb-2">
            {[...Array(3)].map((_, i) => (
              <Sparkles key={i} className="w-4 h-4 text-yellow-400" />
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {game.Title}
          </h1>
          <p className="text-gray-600 mb-6 text-base md:text-lg">
            Complete{" "}
            <span className="font-bold text-orange-500">
              {questions.length}
            </span>{" "}
            fun questions across{" "}
            <span className="font-bold text-green-500">
              {organizedQuestions.groups.length}
            </span>{" "}
            different activities!
          </p>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 mb-6 border-2 border-orange-300">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Activities to Play:
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {organizedQuestions.groups.map((group) => {
                const config = QUESTION_TYPE_CONFIG[
                  group.type as QuestionType
                ] || {
                  icon: Play,
                  label: group.type,
                  color: "from-gray-400 to-gray-600",
                  emoji: "🎮",
                };
                const Icon = config.icon;

                return (
                  <div
                    key={group.type}
                    className="flex items-center justify-between bg-white rounded-xl p-2 border-2 border-orange-200"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`bg-gradient-to-r ${config.color} p-1.5 rounded-lg text-white shadow-md`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-gray-700 font-semibold text-sm">
                        {config.label}
                      </span>
                      <span className="text-xl">{config.emoji}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-orange-600 text-lg">
                        {group.questions.length}
                      </span>
                      <span className="text-xs text-gray-500">questions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 border-2 border-purple-300 shadow-md">
              <div className="text-2xl font-bold text-purple-600">
                {questions.length}
              </div>
              <div className="text-xs text-purple-600 font-semibold">
                Total Questions
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-3 border-2 border-blue-300 shadow-md">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-blue-600 font-semibold">
                Time Limit
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleMainBack}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={handleStartGame}
              className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Let&apos;s Play!
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-600 font-semibold">
            You&apos;ve got this! 🎉
          </p>
        </div>
      </div>
    );
  }
);

RenderGameRetry.displayName = "RenderGameRetry";
