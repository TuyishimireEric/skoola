"use client";

import SchoolCoursesView from "@/components/dashboard/games/Courses";
import Loading from "@/components/loader/Loading";
import TopMenu from "@/components/menu/TopMenu";
import { useClientSession } from "@/hooks/user/useClientSession";

const Dashboard: React.FC = () => {
  const { isLoading, organizationId } = useClientSession();

  if (isLoading) {
    return <Loading overlay={true} fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopMenu
        title={"Course Management"}
        subTitle={"Manage Your Educational Content"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <SchoolCoursesView />
      </div>
    </div>
  );
};

export default Dashboard;
