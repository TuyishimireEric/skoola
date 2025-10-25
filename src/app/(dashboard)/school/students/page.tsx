"use client";

import Loading from "@/components/loader/Loading";
import TopMenu from "@/components/menu/TopMenu";
import StudentsListing from "@/components/users/StudentList";
import { useClientSession } from "@/hooks/user/useClientSession";

const Dashboard: React.FC = () => {
  const { isLoading } = useClientSession();

  if (isLoading) {
    return <Loading overlay={true} fullScreen={true} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopMenu
        title={"Teachers Management"}
        subTitle={"Manage your school's teaching staff"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <StudentsListing />
      </div>
    </div>
  );
};

export default Dashboard;
