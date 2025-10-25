import { ClassesI } from "@/types/Classes";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { MdKeyboardBackspace } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";

export const getClassTheme = (index: number) => {
  if (index === 1)
    return {
      gradient: "from-sky-400 to-blue-500",
      border: "border-sky-300",
      icon: "🌈",
      title: "Primary 1",
      description: "Early Adventures",
    };
  if (index === 2)
    return {
      gradient: "from-emerald-400 to-green-500",
      border: "border-emerald-300",
      icon: "🦄",
      title: "Primary 2",
      description: "Magic Journey",
    };
  if (index === 3)
    return {
      gradient: "from-amber-400 to-yellow-500",
      border: "border-amber-300",
      icon: "🚀",
      title: "Primary 3",
      description: "Space Explorer",
    };
  if (index === 4)
    return {
      gradient: "from-rose-400 to-red-500",
      border: "border-rose-300",
      icon: "🦸",
      title: "Primary 4",
      description: "Super Heroes",
    };
  if (index === 5)
    return {
      gradient: "from-violet-400 to-purple-500",
      border: "border-violet-300",
      icon: "🧙",
      title: "Primary 5",
      description: "Wizard Academy",
    };
  if (index === 6)
    return {
      gradient: "from-indigo-400 to-blue-600",
      border: "border-indigo-300",
      icon: "🏆",
      title: "Primary 6",
      description: "Champion League",
    };

  // Fallback theme
  return {
    gradient: "from-teal-400 to-cyan-600",
    border: "border-teal-300",
    icon: "🎓",
    title: "Primary",
    description: "Learning Adventure",
  };
};

interface StudentFlowProps {
  setStep: (step: number) => void;
  filteredClasses: ClassesI[];
  selectedClass: ClassesI | null;
  handleClassSelect: (classData: ClassesI) => void;
  handleSubmitClass: () => void;
  isPending: boolean;
}

export const StudentFlow = ({
  setStep,
  filteredClasses,
  selectedClass,
  handleClassSelect,
  handleSubmitClass,
  isPending,
}: StudentFlowProps) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl shadow-xl w-full overflow-hidden relative font-comic">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-30" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-30" />
        <div className="absolute top-32 right-20 w-12 h-12 bg-indigo-200 rounded-full opacity-30" />
      </div>

      <div className="px-6 py-4 relative z-10">
        <div className="mb-4">
          <div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center text-indigo-700 hover:text-indigo-900 transition-colors font-medium"
            >
              <div className="flex items-center gap-1 bg-purple-200/50 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-x-1">
                <MdKeyboardBackspace className="text-lg" />
                <span>Back</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-2 h-full overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredClasses.map((classData, index) => {
              const theme = getClassTheme(index);
              const isSelected = selectedClass?.Id === classData.Id;

              return (
                <motion.div
                  key={classData.Id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: isSelected ? 1.05 : 1,
                    y: isSelected ? -5 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                  }}
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <button
                    className={`bg-gradient-to-br ${
                      theme.gradient
                    } p-4 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden w-full h-full ${
                      isSelected
                        ? `${theme.border} shadow-lg`
                        : "border-white hover:border-indigo-200"
                    }`}
                    onClick={() => handleClassSelect(classData)}
                  >
                    <div className="absolute -bottom-6 -right-6 text-8xl opacity-20">
                      {theme.icon}
                    </div>

                    <div className="text-4xl mb-2 relative z-10">
                      {theme.icon}
                    </div>
                    <div className="text-center relative z-10">
                      <div className="font-bold text-white">
                        {classData.Name}
                      </div>
                      <div className="text-xs text-white mt-1 bg-white/30 rounded-full px-2 py-1">
                        {classData.Type}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-4 flex justify-between items-center border-t border-indigo-200 relative z-10">
        <div className="flex items-center">
          {selectedClass && (
            <div className="flex items-center bg-white rounded-full py-1 px-3 border border-indigo-300 shadow-sm">
              {selectedClass && (
                <span className="text-lg mr-2">
                  {getClassTheme(selectedClass.Order).icon}
                </span>
              )}
              <span className="font-medium text-indigo-800">
                {selectedClass?.Name}
              </span>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={selectedClass && !isPending ? { y: [0, -3, 0] } : { y: 0 }}
          transition={
            selectedClass && !isPending
              ? { repeat: Infinity, duration: 1.5 }
              : {}
          }
        >
          <button
            onClick={handleSubmitClass}
            disabled={!selectedClass || isPending}
            className={`px-8 py-3 rounded-full text-white font-bold transition-all duration-300 flex items-center ${
              selectedClass && !isPending
                ? "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 shadow-md hover:shadow-lg"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <span className="flex items-center w-full justify-center min-w-56 gap-4">
                <ClipLoader color="#ffffff" size={20} loading={true} />
                Loading...
              </span>
            ) : (
              <>
                <span>Start Your Adventure!</span>
                <Star size={16} className="ml-2" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
