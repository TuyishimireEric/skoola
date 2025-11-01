"use client";

import StudentDetailPage from "@/components/dashboard/StudentsProfile";
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
        title={"Students Management"}
        subTitle={" Manage and monitor all your students in one place"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <StudentDetailPage />
      </div>
    </div>
  );
};

export default Dashboard;
