"use client";

import GameQuestionsPage from "@/components/games/GameQuestions";
import CreateQuestionsPage from "@/components/games/questions/CreateQuestions";
import Loading from "@/components/loader/Loading";
import TopMenu from "@/components/menu/TopMenu";
import { useGameById } from "@/hooks/games/useGames";
import { useClientSession } from "@/hooks/user/useClientSession";
import { useParams } from "next/navigation";
import { useState } from "react";

const Dashboard: React.FC = () => {
  const { isLoading } = useClientSession();

  const params = useParams();
  const gameId = params?.id as string;

  const { data: game, isLoading: gameLoading } = useGameById(gameId);

  const [isAddingQuestions, setIsAddingQuestions] = useState<boolean>(false);

  if (isLoading) {
    return <Loading overlay={true} fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopMenu
        title={`${
          isAddingQuestions
            ? `Create questions for ${game?.Title} `
            : `${game?.Title}  - Questions`
        }s`}
        subTitle={"Manage all questions for this amazing game"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        {isAddingQuestions ? (
          <CreateQuestionsPage setIsAddingQuestions={setIsAddingQuestions} />
        ) : (
          <GameQuestionsPage
            game={game}
            gameLoading={gameLoading}
            setIsAddingQuestions={setIsAddingQuestions}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
