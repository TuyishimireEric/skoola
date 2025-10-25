"use client";

import React from "react";
import TopMenu from "@/components/menu/TopMenu";

const Page: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 justify-between w-full h-full">
      <TopMenu
        title={"Students"}
        subTitle={
          "List of all Students"
        }
        searchInput={false}
      />

      <div className="flex flex-col h-full w-full gap-0">
        <div className="border-[20px] relative border-primary-400 rounded-[48px] shadow-md grid p-4 gap-6 w-full overflow-hidden h-full">
        </div>
      </div>
    </div>
  );
};

export default Page;
