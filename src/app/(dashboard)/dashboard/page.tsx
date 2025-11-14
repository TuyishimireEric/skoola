"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
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
          Loading ...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <TopMenu
        title={"School Dashboard"}
        subTitle={"System Overview"}
        searchInput={false}
      />

      <div className="flex-1 overflow-auto">
        <DashboardStats />
      </div>
    </div>
  );
};

export default Dashboard;
