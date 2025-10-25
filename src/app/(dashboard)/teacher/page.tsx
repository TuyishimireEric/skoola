"use client";

import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
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
        title={"Staff Management"}
        subTitle={"Teacher Overview"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <TeacherDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
