"use client";

import StudentDetailPage from "@/components/dashboard/StudentsProfile";
import TopMenu from "@/components/menu/TopMenu";
import { useClientSession } from "@/hooks/user/useClientSession";
import { Loader2 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { isLoading, userRoleId } = useClientSession();

  if (isLoading) {
    return (
      <div className=" h-full  rounded-xl shadow-sm border p-12 text-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">
          Loading ...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopMenu
        title={userRoleId == 6 ? "My Students" : "Students Management"}
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
