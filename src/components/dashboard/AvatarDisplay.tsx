"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { FaCrown } from "react-icons/fa";
import { AvatarData } from "@/types/Avatar";

interface AvatarDisplayProps {
  avatarData: AvatarData;
  size?: "sm" | "md" | "lg" | "xl";
  showCrown?: boolean;
  level?: number;
  className?: string;
  editable?: boolean;
  onClick?: () => void;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarData,
  size = "md",
  showCrown = false,
  level,
  className = "",
  editable = true,
  onClick,
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-12 h-12",
      text: "text-lg",
      crown: 12,
      level: "text-xs w-6 h-6",
    },
    md: {
      container: "w-16 h-16",
      text: "text-2xl",
      crown: 16,
      level: "text-xs w-8 h-8",
    },
    lg: {
      container: "w-24 h-24",
      text: "text-4xl",
      crown: 24,
      level: "text-sm w-10 h-10",
    },
    xl: {
      container: "w-32 h-32 sm:w-40 sm:h-40",
      text: "text-6xl sm:text-7xl",
      crown: 32,
      level: "text-base sm:text-lg w-10 h-10 sm:w-12 sm:h-12",
    },
  };

  const config = sizeConfig[size];

  const renderAvatarContent = () => {
    if (
      avatarData.avatarType === "custom" &&
      (avatarData.customAvatar || avatarData.imageUrl)
    ) {
      return (
        <div className="absolute inset-1 rounded-full overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-200">
          <Image
            src={avatarData.customAvatar || avatarData.imageUrl || ""}
            alt="Profile avatar"
            fill
            className="object-cover"
            sizes={`${config.container.split(" ")[0].replace("w-", "")}px`}
            priority
          />
        </div>
      );
    }

    return (
      <div className="absolute inset-1 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-yellow-300 group-hover:to-orange-400 transition-colors">
        <motion.span
          className={`${config.text}`}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {avatarData.avatar}
        </motion.span>
      </div>
    );
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        {/* Decorative rotating border */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-60"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Main Avatar Button */}
        <motion.button
          onClick={onClick}
          className={`relative ${
            config.container
          } bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl ${
            editable ? "cursor-pointer group" : "cursor-default"
          }`}
          whileHover={editable ? { scale: 1.1 } : {}}
          whileTap={editable ? { scale: 0.95 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
          disabled={!editable}
        >
          {renderAvatarContent()}

          {/* Edit overlay on hover */}
          {editable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 className="text-white w-4 h-4" />
            </div>
          )}
        </motion.button>

        {/* Level Badge */}
        {level && (
          <motion.div
            className={`absolute bottom-0 right-0 bg-gradient-to-r from-green-500 to-yellow-500 text-white ${config.level} rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            whileHover={{ scale: 1.2 }}
          >
            {level}
          </motion.div>
        )}

        {/* Crown */}
        {showCrown && (
          <motion.div
            className="absolute -top-2 -left-2 text-yellow-500"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.2, rotate: 15 }}
          >
            <FaCrown size={config.crown} className="drop-shadow-lg" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AvatarDisplay;
