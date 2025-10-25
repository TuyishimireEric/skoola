"use client";

import { RenderGameRetry } from "@/components/games/play/RenderGameRetry";
import AfricanLoader from "@/components/loader/AfricanLoader";
import { useGameById } from "@/hooks/games/useGames";
import { useQuestions } from "@/hooks/questions/useQuestions";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const RetryPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract gameId from path params and questionIds from query params
  const gameId = params.id as string;
  const questionIdsParam = searchParams.get("questions");

  // Parse question IDs with proper type safety
  const questionIds = useMemo(() => {
    if (!questionIdsParam) return [];
    return questionIdsParam.split(",").filter((id) => id.trim() !== "");
  }, [questionIdsParam]);

  // Fetch game data
  const {
    data: game,
    isLoading: gameLoading,
    error: gameError,
  } = useGameById(gameId);

  const maximum = questionIds.length > 10 ? 10 : questionIds.length;

  // Fetch questions data
  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestions({
    GameId: gameId,
    limit: maximum,
    questionIds: questionIds,
  });

  const isLoading = gameLoading || questionsLoading;
  const hasError = gameError || questionsError;

  const handleBack = (): void => {
    router.push("/kids");
  };

  if (isLoading) {
    return (
      <AfricanLoader
        Title="Loading Amazing Games! 🎮"
        Description="The village animals are gathering the best games for you... 🌟"
      />
    );
  }

  // Error states
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          {gameError ? "Could not load game data" : "Could not load questions"}
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Game not found
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Game Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The game you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Questions not found
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No Questions Found
        </h2>
        <p className="text-gray-600 mb-4">
          No questions are available for this game retry.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Main render
  return (
    <RenderGameRetry
      questionIds={questionIds}
      questions={questions}
      game={game}
      isLoading={isLoading}
      onBack={handleBack}
    />
  );
};

export default RetryPage;
