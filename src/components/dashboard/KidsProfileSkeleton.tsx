"use client";

import React from "react";
import { motion } from "framer-motion";
import Skeleton from "@mui/material/Skeleton";

const KidsProfileSkeleton = () => {
  return (
    <motion.div
      className="rounded-3xl p-4 sm:p-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Decorative Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 text-6xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌴
        </motion.div>
        <motion.div
          className="absolute top-20 right-20 text-5xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ☀️
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-4xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          🏛️
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 text-5xl"
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          🌺
        </motion.div>
      </div>

      {/* Profile Header Skeleton */}
      <div className="text-center mb-6 relative z-10">
        <div className="relative inline-block mb-4">
          {/* Spinning gradient border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          {/* Avatar circle */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden shadow-2xl">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          {/* Level badge */}
          <Skeleton className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          {/* Crown */}
          <Skeleton className="absolute -top-4 -left-4 w-8 h-8 rounded-full" />
        </div>

        <Skeleton className="w-40 h-6 mx-auto mb-2" />
        <Skeleton className="w-32 h-4 mx-auto mb-2" />
        <Skeleton className="w-28 h-5 mx-auto" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-2 sm:p-2 text-center relative overflow-hidden"
          >
            <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-full" />
            <Skeleton className="w-10 h-3 mx-auto mb-2" />
            <Skeleton className="w-8 h-5 mx-auto mb-1" />
            <Skeleton className="w-12 h-3 mx-auto" />
          </div>
        ))}
      </div>

      {/* Level Progress Skeleton */}
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-orange-200">
        <div className="flex justify-between items-center mb-3">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <Skeleton className="w-full h-6 rounded-full mb-2" />
        <Skeleton className="w-32 h-3 mx-auto" />
      </div>
    </motion.div>
  );
};

export default KidsProfileSkeleton;
