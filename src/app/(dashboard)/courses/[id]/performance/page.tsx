"use client";

import ManagePerformancePage from "@/components/course/Performance";
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
        title={"Performance Management"}
        subTitle={"Manage Course Performance Data"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto max-w-7xl">
        <ManagePerformancePage />
      </div>
    </div>
  );
};

export default Dashboard;
