"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, Users, Trophy, Gamepad2 } from "lucide-react";

interface GameData {
  Id: string;
  Title: string;
  Description: string;
  ImageUrl: string;
  Subject: string;
  AgeGroup: string;
  Type: string;
  TotalStudents: number;
  icon: string;
  color: string;
  bgGradient: string;
}

export const GamesSection = () => {
  const [activeGame, setActiveGame] = useState(0);

  const games: GameData[] = [
    {
      Id: "c5ca1fc8-0656-4ea2-ba72-ced60a655aa1", // World Challenge real ID
      Title: "World Challenge Adventure 🌍",
      Description:
        "Travel the globe! Match flags, find countries on the map, and master capital cities in this exciting geography quest.",
      ImageUrl:
        "https://res.cloudinary.com/dn8vyfgnl/image/upload/v1752281358/20250712_0247_World_Challenge_Activity_remix_01jzy1hv2xfhsbvad0q1vs9xcb_ijm0tk.png",
      Subject: "Geography",
      AgeGroup: "6-12",
      Type: "Adventure Game",
      TotalStudents: 2340,
      icon: "🌍",
      color: "#FFD166",
      bgGradient: "from-yellow-400 to-orange-500",
    },
    {
      Id: "546abf76-3f79-404c-a62b-6a477f848f43", // The Time Travelers real ID
      Title: "Time Travelers Quest ⏰",
      Description:
        "Join time travelers! Fix clocks, solve time puzzles, and master telling time in this thrilling race across time zones.",
      ImageUrl:
        "https://res.cloudinary.com/dn8vyfgnl/image/upload/v1752278404/TIme.png",
      Subject: "Life Skills",
      AgeGroup: "8-14",
      Type: "Simulation Game",
      TotalStudents: 1890,
      icon: "⏰",
      color: "#06D6A0",
      bgGradient: "from-green-400 to-emerald-500",
    },
    {
      Id: "7622a117-0443-4604-97fc-6400f161a4bf", // English Master 3 real ID
      Title: "English Master Quest 📚",
      Description:
        "Become an English hero! Practice phonics, spelling, reading, and listening while meeting fun characters and solving language puzzles.",
      ImageUrl:
        "https://res.cloudinary.com/dn8vyfgnl/image/upload/v1752279466/20250711_2001_3D_English_Learning_Fun_remix_01jzxaa52ke6q9mjpwajkdvq7j_nlq7bo.png",
      Subject: "English",
      AgeGroup: "8-9",
      Type: "Story Game",
      TotalStudents: 3120,
      icon: "📚",
      color: "#FF6B6B",
      bgGradient: "from-red-400 to-orange-500",
    },
    {
      Id: "0f5800b9-704c-4e13-990a-ee6c058d13a7", // Math Adventure 5 real ID
      Title: "Math Champion Quest 🔢",
      Description:
        "Level up your math powers! Solve fractions, decimals, and percentages while unlocking rewards in this exciting math challenge.",
      ImageUrl:
        "https://res.cloudinary.com/dn8vyfgnl/image/upload/v1752279354/20250712_0203_Math_Adventure_Game_Cover_remix_01jzxz100ce52th3qpjwh9bw4w_uf85tc.png",
      Subject: "Mathematics",
      AgeGroup: "10-12",
      Type: "Adventure Game",
      TotalStudents: 2340,
      icon: "🔢",
      color: "#FFD166",
      bgGradient: "from-yellow-400 to-orange-500",
    },
  ];

  const currentGame = games[activeGame];

  return (
    <section className="relative px-8 py-16 sm:py-20 lg:py-24 overflow-hidden bg-white">
      {/* Animated African/Cartoon Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Game Elements with African theme */}
        <motion.div
          className="absolute top-20 left-10 text-4xl opacity-30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🎮
        </motion.div>

        <motion.div
          className="absolute top-40 right-20 text-3xl opacity-25"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          ⭐
        </motion.div>

        <motion.div
          className="absolute bottom-32 left-1/4 text-5xl opacity-20"
          animate={{
            y: [0, -25, 0],
            x: [0, 10, 0],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          🚀
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-10 text-4xl opacity-30"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          🏆
        </motion.div>

        {/* African-themed decorative circles */}
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-200 rounded-full opacity-20 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Gaming Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="bg-gradient-to-r from-yellow-300 to-orange-400 text-white px-6 py-3 rounded-full text-sm sm:text-base font-comic font-bold shadow-lg border-2 border-yellow-200 transform rotate-2">
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Amazing Games to Play
                <Gamepad2 className="w-5 h-5" />
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl font-bold font-comic text-gray-800 mb-4"
          >
            Level Up Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-yellow-500">
              Learning Adventure!
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-700 font-comic max-w-3xl mx-auto"
          >
            <span className="hidden sm:inline">
              Jump into exciting educational games where learning feels like
              playing! Choose your adventure and start having fun.
            </span>
            <span className="sm:hidden">
              Learn through fun games and exciting adventures!
            </span>
          </motion.p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Game Selection */}
          <div className="lg:w-1/3">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xl sm:text-2xl font-bold font-comic text-gray-800 mb-6 flex items-center gap-2"
            >
              <Trophy className="w-6 h-6 text-yellow-500" />
              Choose Your Game
            </motion.h3>

            <div className="space-y-3">
              {games.map((game, index) => (
                <motion.button
                  key={game.Id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveGame(index)}
                  className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-comic text-sm sm:text-base font-bold transition-all duration-300 ${
                    activeGame === index
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105 border-2 border-yellow-300"
                      : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-green-200 hover:border-green-300"
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{game.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{game.Title}</div>
                    <div className="text-xs opacity-75 hidden sm:block">
                      {game.Subject} • {game.AgeGroup} years
                    </div>
                  </div>
                  {activeGame === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active Game Display */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative"
              >
                {/* Game Card */}
                <div
                  className={`bg-gradient-to-br ${currentGame.bgGradient} rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white/50 overflow-hidden relative`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                  </div>

                  <div className="relative z-10 flex flex-col lg:flex-row gap-6">
                    {/* Game Info */}
                    <div className="lg:w-1/2 space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold font-comic text-white">
                            {currentGame.Title}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Users className="w-4 h-4" />
                            <span>
                              {currentGame.TotalStudents.toLocaleString()}{" "}
                              players
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/95 font-comic text-base leading-relaxed"
                      >
                        {currentGame.Description}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap gap-2"
                      >
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-comic border border-white/30">
                          {currentGame.Subject}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-comic border border-white/30">
                          Ages {currentGame.AgeGroup}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-comic border border-white/30">
                          {currentGame.Type}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Link
                          href={`/games/${currentGame.Id}`}
                          className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 bg-white text-gray-800 rounded-full font-bold font-comic text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
                        >
                          <Play className="w-5 h-5" />
                          <span className="hidden sm:inline">
                            Start Playing Now
                          </span>
                          <span className="sm:hidden">Play Now</span>
                        </Link>
                      </motion.div>
                    </div>

                    {/* Game Image */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="lg:w-1/2"
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
                        <div className="relative w-full h-48 sm:h-64 lg:h-80">
                          <Image
                            src={currentGame.ImageUrl}
                            alt={currentGame.Title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-gray-800 ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-2 mt-6"
            >
              {games.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveGame(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeGame === index ? "bg-yellow-500 w-8" : "bg-gray-400"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-full font-bold font-comic text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-green-300"
          >
            <Gamepad2 className="w-6 h-6" />
            <span className="hidden sm:inline">Explore All Games</span>
            <span className="sm:hidden">All Games</span>
            <Star className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
