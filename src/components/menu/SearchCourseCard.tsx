import React from "react";
import Image from "next/image";
import { Rocket } from "lucide-react";
import type { GameDataI } from "@/types/Course";

interface CourseCardProps {
  course: GameDataI;
  onSelect: () => void;
}

const CourseCard = ({ course, onSelect }: CourseCardProps) => {
  return (
    <div
      onClick={onSelect}
      className="group h-min relative overflow-hidden rounded-3xl border-4 border-transparent hover:border-primary bg-primary-400 transition-all duration-500 shadow-lg hover:shadow-xl cursor-pointer"
    >
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold shadow-md">
        {course.Type}
      </div>

      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={course.ImageUrl}
          alt={course.Title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-700 to-transparent opacity-20"></div>

        <div className="absolute bottom-4 left-4 bg-white w-8 h-8 rounded-full opacity-70 animate-bounce"></div>
        <div className="absolute top-4 left-4 bg-primary-400 w-6 h-6 rounded-full opacity-70 animate-pulse"></div>
      </div>

      <div className="p-4 bg-primary-100 relative">
        <h2 className="font-comic text-primary-600 font-bold text-xl leading-tight group-hover:text-primary-dark transition-colors duration-300">
          {course.Title}
        </h2>
        <button
          className="w-full mt-2 py-2 px-4 bg-primary-400 hover:bg-secondary-dark text-white font-comic rounded-full transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            onSelect();
          }}
          type="button"
        >
          <Rocket className="w-5 h-5" />
          <span className="font-bold">Start Your Adventure!</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCard;