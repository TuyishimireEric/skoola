"use client";

import React from "react";
import TopMenu from "@/components/menu/TopMenu";

const CoursesPage = () => {
  return (
    <div className="flex flex-col items-center gap-2 justify-between w-full h-full">
      <TopMenu
        title={"My Profile"}
        subTitle={"View and edit your profile"}
        searchInput={true}
      />
    </div>
  );
};

export default CoursesPage;
