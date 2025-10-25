"use client";

import { RenderGameplay } from "@/components/games/play/RenderComponent";
import AfricanLoader from "@/components/loader/AfricanLoader";
import { useGameById } from "@/hooks/games/useGames";
import { useQuestions } from "@/hooks/questions/useQuestions";
import { useParams, useRouter } from "next/navigation";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;

  const { data: game, isLoading: gameLoading } = useGameById(gameId);
  const { data: questions, isLoading: gamesLoading } = useQuestions({
    GameId: gameId,
    limit: 10,
  });

  const onBack = () => {
    router.push(`/games/${gameId}`);
  };

  return (
    <>
      {(gameLoading || gamesLoading) && (
        <AfricanLoader
          Title={"Loading Amazing Games! 🎮"}
          Description={
            " The village animals are gathering the best games for you... 🌟"
          }
        />
      )}
      {!gameLoading && !gamesLoading && !game && <div>Game not found: </div>}

      {game && questions && (
        <RenderGameplay
          questions={questions || []}
          game={game}
          isLoading={gameLoading || gamesLoading}
          onBack={onBack}
          isCompleted={() => {}}
        />
      )}
    </>
  );
};

export default Page;
