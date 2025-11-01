"use client";

import AttendancePage from "@/components/dashboard/Attendance";
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
        title={"Attendance Management"}
        subTitle={" Record student attendance for today's classes"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <AttendancePage />
      </div>
    </div>
  );
};

export default Dashboard;
