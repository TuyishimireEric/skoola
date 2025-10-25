import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Lock } from "lucide-react";
import { BiSolidBadgeCheck } from "react-icons/bi";
import { IoPlayForwardCircleSharp } from "react-icons/io5";

interface LevelBoxProps {
  score: string;
  totalLevels: number;
  level: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

const LevelBox = ({
  score,
  totalLevels,
  level,
  isCompleted,
  isCurrent,
  onClick,
}: LevelBoxProps) => {
  const [hover, setHover] = useState(false);

  const getStars = (score: number) => {
    if (score >= 80) return 3;
    if (score >= 70) return 2;
    if (score >= 60) return 1;
    return 0;
  };

  // Define themes for different level ranges
  const getLevelTheme = (level: number) => {
    if (level <= totalLevels / 3)
      return {
        gradient: "from-blue-400 to-blue-600",
        border: "border-blue-300",
        icon: "🌱",
        title: "Sprout",
      };
    if (level <= (2 * totalLevels) / 3)
      return {
        gradient: "from-green-400 to-green-600",
        border: "border-green-300",
        icon: "🌿",
        title: "Seedling",
      };
    if (level <= totalLevels)
      return {
        gradient: "from-yellow-400 to-yellow-600",
        border: "border-yellow-300",
        icon: "🌳",
        title: "Sapling",
      };
    return {
      gradient: "from-purple-400 to-purple-600",
      border: "border-purple-300",
      icon: "🌲",
      title: "Tree",
    };
  };

  const theme = getLevelTheme(level);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <div
        onClick={onClick}
        className={`
          w-full h-32 rounded-3xl relative overflow-hidden font-comic
          ${
            isCompleted
              ? `bg-gradient-to-br ${theme.gradient} cursor-pointer`
              : isCurrent
              ? "bg-gradient-to-br from-primary-300 to-primary-500 cursor-pointer"
              : "bg-gray-200 cursor-not-allowed"
          }
          border-4 ${
            theme.border
          } shadow-lg transform transition-all duration-300
        `}
      >
        {/* Badge section */}
        {isCompleted ? (
          <div className="absolute top-2 right-2 z-10">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: hover ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <BiSolidBadgeCheck className="w-12 h-12 text-green-400 drop-shadow-md" />
            </motion.div>
          </div>
        ) : isCurrent ? (
          <div className="absolute flex items-center justify-center text-green-400 z-10 w-full h-full">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <IoPlayForwardCircleSharp className="w-12 h-12 filter drop-shadow-lg" />
            </motion.div>
          </div>
        ) : (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -bottom-6 -right-6 text-8xl opacity-20">
            {theme.icon}
          </div>
        </div>

        {/* Content */}
        <div className="h-full flex flex-col justify-between p-4 relative z-5">
          <div className="text-center">
            <h3
              className={`text-xl font-bold ${
                isCompleted || isCurrent ? "text-white" : "text-gray-500"
              }`}
            >
              Level {level}
            </h3>
          </div>

          {isCompleted && (
            <>
              <div className="flex justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        i < getStars(Number(score))
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="text-center text-white font-bold text-sm">
                Score: {Number(score).toFixed(0)}%
              </div>
            </>
          )}

          {isCurrent && (
            <div className="text-center text-white font-bold mt-4">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Start Now!
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LevelBox;
