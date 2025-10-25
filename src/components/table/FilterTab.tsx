"use client";

import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useClasses } from "@/hooks/classes/useClasses";
import { ClassesI } from "@/types/Classes";

interface Props {
  handleFilter: (args: {
    studentClass: number | null;
    activeOnly: boolean;
  }) => void;
}

const FilterTab = ({ handleFilter }: Props) => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [classes, setClasses] = useState<ClassesI[] | undefined>([]);
  const { data, isLoading } = useClasses();

  const handleReset = () => {
    setSelectedClass(null);
    setActiveOnly(false);
  };
  useEffect(() => {
    if (!isLoading) setClasses(data);
    console.log(data);
  }, [data]);

  return (
    <div className="w-full p-2 flex flex-col md:flex-row md:justify-between lg:justify-start lg:gap-2 items-center gap-4 font-comic">
      {/* Classes Dropdown with Icon */}
      <div className="relative w-full md:w-1/4">
        <select
          value={selectedClass?.toString() || ""}
          onChange={(e) => setSelectedClass(parseInt(e.target.value))}
          className="w-full appearance-none px-4 py-2 border border-primary-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All classes</option>
          {classes?.map((item) => (
            <option key={item.Id} value={item.Id}>
              {item.Name}
            </option>
          ))}
        </select>
        <ExpandMoreIcon className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {/* Checkbox */}
      <label className="flex items-center gap-2 text-sm">
        <FilterListIcon className="" />
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={() => setActiveOnly(!activeOnly)}
          className="w-4 h-4"
        />
        Active Only
      </label>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-xl  "
        >
          <RestartAltIcon fontSize="small" />
          Reset
        </button>
        <button
          onClick={() =>
            handleFilter({ studentClass: selectedClass, activeOnly })
          }
          className="flex items-center gap-1 px-4 py-2 text-sm bg-primary-500 text-white hover:bg-primary-500 rounded-xl hover:scale-105 transition-all duration-500 ease-in-out"
        >
          <FilterListIcon fontSize="small" />
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterTab;
