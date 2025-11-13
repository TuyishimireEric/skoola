"use client";

import AttendancePage from "@/components/dashboard/Attendance";
import TopMenu from "@/components/menu/TopMenu";
import { useClientSession } from "@/hooks/user/useClientSession";
import { Loader2 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { isLoading } = useClientSession();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">
          Loading Attendance Management...
        </p>
      </div>
    );
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
