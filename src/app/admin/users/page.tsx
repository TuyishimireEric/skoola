"use client";

import React from "react";
import UserListTable from "@/components/table/UserListTable";
import TopMenu from "@/components/menu/TopMenu";

const page = () => {
  return (
    <div className="flex flex-col items-center gap-2 justify-between w-full h-full">
      <TopMenu
        title={"System Users"}
        subTitle={"List of all Users"}
        searchInput={false}
      />
      <div className="flex flex-col h-full w-full gap-0">
        {/* all users */}
        <div className="border-[20px] border-primary-400 rounded-[48px] shadow-md grid p-4 gap-6 w-full overflow-hidden h-full">
          <UserListTable />
        </div>
      </div>
    </div>
  );
};

export default page;
