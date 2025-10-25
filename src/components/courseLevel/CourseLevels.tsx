import { GameDataI, CourseSectionI } from "@/types/Course";
import { ChevronLeft, Star } from "lucide-react";
import LevelBox from "./LevelBox";
import { BiSolidBadgeCheck } from "react-icons/bi";
import { GiTrophyCup } from "react-icons/gi";

const CourseLevels = ({
  onBack,
  course,
  sections,
  setSelected,
}: {
  onBack: () => void;
  sections: CourseSectionI[] | [];
  course: GameDataI;
  setSelected: (selected: CourseSectionI | "none") => void;
}) => {
  const sortedSections = sections.sort(
    (a, b) =>
      new Date(a.CompletedOn).getTime() - new Date(b.CompletedOn).getTime()
  );

  const completedSections = sortedSections.filter(
    (section) => Number(section.Score) >= (course.PassScore ?? 50)
  );

  const totalLevels = course.NumberOfLevels ?? 12;
  const completionPercentage = (completedSections.length / totalLevels) * 100;

  const handleSelect = () => {
    if (sections.length === 0) {
      setSelected("none");
      return;
    }
    if (completedSections.length >= totalLevels) {
      return;
    }
    const lastSection = sortedSections[sortedSections.length - 1];
    setSelected(lastSection);
    return;
  };

  // Get stars based on completion percentage for visual reward
  const getStarsCount = () => {
    if (completionPercentage < 33) return 1;
    if (completionPercentage < 66) return 2;
    if (completionPercentage < 100) return 3;
    return 4; // All complete!
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 font-comic animate__animated animate__fadeIn relative">
      <div className="w-full flex items-center gap-4 h-14 rounded-full shadow-md bg-primary-200 px-2">
        {/* Back button with subtle hover effect */}
        <button
          onClick={onBack}
          className="flex rounded-full items-center gap-2 text-white font-medium bg-primary-400 px-4 py-2 hover:bg-primary-300 transition-colors duration-300 shadow-sm"
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>

        {/* Learning Journey text with gradient */}
        <span className="text-lg font-bold text-primary-500 mr-3">
          My Learning Journey
        </span>

        {/* Progress bar with smooth gradient */}
        <div className="flex-grow">
          <div className="relative h-6 bg-white rounded-full overflow-hidden border border-primary-300 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-300 to-primary-300 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-white drop-shadow-md">
                {Math.round(completionPercentage)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Completion stats with subtle design */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full ml-3 border border-blue-100 shadow-sm">
          <BiSolidBadgeCheck className="w-5 h-5 text-primary-600" />
          <span className="text-primary-800 font-bold text-sm">
            {completedSections.length}/{totalLevels}
          </span>
          <span className="text-primary-700 text-xs">Levels</span>
          <div className="flex ml-1">
            {[...Array(getStarsCount())].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="text-amber-400 fill-amber-400"
              />
            ))}
          </div>
          {getStarsCount() >= 4 && (
            <GiTrophyCup className="ml-1 text-amber-500 w-5 h-5" />
          )}
        </div>
      </div>

      {/* Level boxes grid */}
      <div
        className="grid grid-cols-5 gap-4 overflow-y-auto w-full rounded-2xl p-2 shadow-sm"
        style={{ height: "calc(100vh - 200px)" }}
      >
        {[...Array(totalLevels)].map((_, index) => {
          const completedSection = completedSections[index];
          return (
            <LevelBox
              key={index}
              level={index + 1}
              totalLevels={totalLevels}
              score={completedSection?.Score || "0"}
              isCompleted={!!completedSection}
              isCurrent={index === completedSections.length}
              onClick={handleSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CourseLevels;
