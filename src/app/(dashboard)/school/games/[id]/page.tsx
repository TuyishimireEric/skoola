"use client";

import GameDescriptionPage from "@/components/games/GameDetails";
import Loading from "@/components/loader/Loading";
import TopMenu from "@/components/menu/TopMenu";
import { useClientSession } from "@/hooks/user/useClientSession";

const Dashboard: React.FC = () => {
  const { isLoading } = useClientSession();

  if (isLoading) {
    return <Loading overlay={true} fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopMenu
        title={"Games Management "}
        subTitle={"Manage Your Educational Content"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <GameDescriptionPage isAdmin={true} />
      </div>
    </div>
  );
};

export default Dashboard;
