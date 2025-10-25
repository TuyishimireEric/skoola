import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, Sparkles, ChevronLeft } from "lucide-react";
import { useGames } from "@/hooks/games/useGames";
import AfricanLoader from "../loader/AfricanLoader";
import GameCard from "./GameCard";
import { GameDataI } from "@/types/Course";

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Grade configuration
const GRADES = [
  {
    value: "1",
    label: "Grade 1",
    emoji: "1️⃣",
    color: "from-red-400 to-pink-400",
  },
  {
    value: "2",
    label: "Grade 2",
    emoji: "2️⃣",
    color: "from-orange-400 to-yellow-400",
  },
  {
    value: "3",
    label: "Grade 3",
    emoji: "3️⃣",
    color: "from-yellow-400 to-green-400",
  },
  {
    value: "4",
    label: "Grade 4",
    emoji: "4️⃣",
    color: "from-green-400 to-teal-400",
  },
  {
    value: "5",
    label: "Grade 5",
    emoji: "5️⃣",
    color: "from-teal-400 to-blue-400",
  },
  {
    value: "6",
    label: "Grade 6",
    emoji: "6️⃣",
    color: "from-blue-400 to-purple-400",
  },
];

// Subject configuration
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Art",
  "Music",
  "Physical Education",
];

const SUBJECT_EMOJIS: { [key: string]: string } = {
  Mathematics: "🔢",
  Science: "🔬",
  English: "📚",
  History: "🏛️",
  Geography: "🌍",
  Art: "🎨",
  Music: "🎵",
  "Physical Education": "⚽",
};

const GamesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allGames, setAllGames] = useState<GameDataI[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Refs for infinite scroll
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const hasMorePages = useRef(true);

  const {
    data: Games,
    isLoading,
    isFetching,
  } = useGames({
    page: currentPage,
    pageSize: 30,
    searchText: searchQuery,
    subject: selectedSubject,
    grade: selectedGrade,
  });

  // Debounced search handler
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1);
        setAllGames([]);
        isInitialLoad.current = true;
        hasMorePages.current = true;
      }, 300);
    },
    []
  );

  // Handle grade selection
  const handleGradeSelect = useCallback((grade: string) => {
    setSelectedGrade(grade);
    setShowFilters(true);
    setCurrentPage(1);
    setAllGames([]);
    isInitialLoad.current = true;
    hasMorePages.current = true;
  }, []);

  // Handle back to grade selection
  const handleBackToGrades = useCallback(() => {
    setSelectedGrade("");
    setShowFilters(false);
    setCurrentPage(1);
    setAllGames([]);
    isInitialLoad.current = true;
    hasMorePages.current = true;
  }, []);

  // Handle subject change
  const handleSubjectChange = useCallback(
    (subject: string) => {
      setSelectedSubject(subject === selectedSubject ? "" : subject);
      setCurrentPage(1);
      setAllGames([]);
      isInitialLoad.current = true;
      hasMorePages.current = true;
    },
    [selectedSubject]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedGrade("");
    setSelectedSubject("");
    setSearchQuery("");
    setShowFilters(false);
    setCurrentPage(1);
    setAllGames([]);
    isInitialLoad.current = true;
    hasMorePages.current = true;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Load more games
  const loadMoreGames = useCallback(() => {
    if (!isFetching && hasMorePages.current) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching]);

  // Update games list when new data arrives
  useEffect(() => {
    if (Games) {
      if (currentPage === 1) {
        setAllGames(Games);
        isInitialLoad.current = false;
      } else if (Games.length > 0) {
        setAllGames((prevGames) => [...prevGames, ...Games]);
      }

      // Check if we should continue loading
      hasMorePages.current = Games.length === 30;
    }
  }, [Games, currentPage]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() || selectedGrade || selectedSubject;
  }, [searchQuery, selectedGrade, selectedSubject]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          !isInitialLoad.current &&
          !isFetching &&
          hasMorePages.current
        ) {
          loadMoreGames();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [loadMoreGames, isFetching]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Render grade selection screen
  const renderGradeSelection = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-yellow-300 max-w-5xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-comic text-primary-700 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-orange-500">
              Choose Your Grade!
            </span>
            <span className="ml-2">🎓</span>
          </h2>
          <p className="text-lg text-primary-600 font-comic">
            Select your grade to find the perfect games for you! 🌟
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {GRADES.map((grade, index) => (
            <motion.button
              key={grade.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGradeSelect(grade.value)}
              className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${grade.color} text-white font-comic font-bold text-xl md:text-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-white/50 overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl mb-2">{grade.emoji}</div>
                <div>{grade.label}</div>
                <div className="mt-2 text-sm opacity-90">
                  <Sparkles size={16} className="inline mr-1" />
                  Click to explore!
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setShowFilters(true)}
            className="text-primary-500 hover:text-primary-600 font-comic text-sm underline"
          >
            Browse all games <ChevronRight size={16} className="inline" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );

  // Render games grid or loading state
  const renderGamesContent = () => {
    if (isLoading && currentPage === 1) {
      return (
        <div className="col-span-full flex justify-center py-12">
          <AfricanLoader
            Title={"Loading Amazing Games! 🎮"}
            Description={
              selectedGrade
                ? `Finding Grade ${selectedGrade} games for you... 🌟`
                : "The village animals are gathering the best games for you... 🌟"
            }
          />
        </div>
      );
    }

    if (allGames.length === 0 && !isLoading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-4 border-yellow-300 inline-block">
            <div className="text-8xl mb-4">😢</div>
            <p className="font-comic text-primary-600 text-xl mb-2">
              Oops! No games found
            </p>
            <p className="font-comic text-primary-500 text-lg mb-4">
              Try adjusting your search or filters! 🎈
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-comic font-bold text-lg transition-all duration-300 border-2 border-blue-300"
            >
              🔄 Start Over
            </motion.button>
          </div>
        </div>
      );
    }

    return allGames.map((game, index) => (
      <GameCard key={`${game.Id}-${index}`} game={game} index={index} />
    ));
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden font-comic">
      {/* Decorative Elements */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        aria-hidden="true"
      >
        <div className="relative w-full h-full max-w-[1600px] mx-auto">
          <div className="absolute right-0 bottom-0 w-full sm:w-4/5 md:w-3/5 lg:w-1/2 h-full opacity-5 sm:opacity-10 md:opacity-15">
            <div className="relative w-full h-full flex items-end justify-end">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-20 right-20 text-8xl"
              >
                🎮
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-40 right-40 text-7xl"
              >
                🌟
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -25, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                className="absolute top-20 right-32 text-6xl"
              >
                🌈
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-30 min-h-screen ${
          selectedGrade ? "pt-16" : "pt-28 md:pt-32"
        } pb-8 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto`}
      >
        <div className="w-full mx-auto">
          {/* Header Section - Only show when no grade is selected */}
          {!selectedGrade && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="bg-gradient-to-r from-pink-300 to-yellow-400 text-white px-6 py-3 rounded-full text-xl font-comic font-bold shadow-lg transform -rotate-2">
                  <span role="img" aria-label="Game">
                    🎮
                  </span>{" "}
                  Fun Games for Kids!{" "}
                  <span role="img" aria-label="Sparkles">
                    ✨
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl sm:text-5xl font-bold font-comic text-primary-700 mb-3"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-orange-500">
                  Amazing Games to Play!
                </span>
                🎯
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg text-primary-600 font-comic mb-6"
              >
                Pick a game and start your fun adventure! 🚀
              </motion.p>
            </motion.div>
          )}

          {/* Show grade selection or filters based on state */}
          {!showFilters && !selectedGrade ? (
            renderGradeSelection()
          ) : (
            <>
              {/* Compact Filters Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: selectedGrade ? 0 : 0.9 }}
                className={`my-6 ${
                  selectedGrade
                    ? " p-4 rounded-2xl"
                    : ""
                }`}
              >
                <div className="flex gap-4">
                  {selectedGrade && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <button
                        onClick={handleBackToGrades}
                        className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-comic font-bold transition-colors"
                      >
                        <ChevronLeft size={20} />
                        <span>Back to Grades</span>
                      </button>
                    </motion.div>
                  )}
                  {selectedGrade && (
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-3 py-1.5 rounded-full font-comic font-bold flex items-center gap-2 shadow-md text-sm">
                          {GRADES.find((g) => g.value === selectedGrade)?.emoji}
                          <span>Grade {selectedGrade}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Filter Container */}
                <div
                  className={`${
                    selectedGrade
                      ? ""
                      : "bg-white/30 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-white/40 ring-1 ring-blue-100/50"
                  }`}
                >
                  {/* Grade Badge - More compact when grade is selected */}

                  {/* Search Bar */}
                  <div className="relative mb-3">
                    <div className="relative group">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 group-focus-within:text-primary-600 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={
                          selectedGrade
                            ? `Search Grade ${selectedGrade} games...`
                            : "Search amazing games... 🎮✨"
                        }
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={`w-full pl-10 pr-4 py-2.5 bg-white/80 border-2 border-primary-200/60 rounded-2xl font-comic ${
                          selectedGrade ? "text-base" : "text-lg"
                        } text-gray-800 placeholder-primary-400/70 focus:outline-none focus:ring-4 focus:ring-primary-300/40 focus:border-primary-400 transition-all duration-300 shadow-inner`}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Subject Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs">📚</span>
                      </div>
                      <h3 className="font-comic text-blue-700 text-xs font-bold">
                        Subject Areas
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((subject) => (
                        <motion.button
                          key={subject}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubjectChange(subject)}
                          className={`px-2.5 py-1.5 rounded-lg font-comic font-bold text-xs transition-all duration-300 border-2 shadow-sm ${
                            selectedSubject === subject
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400 shadow-md ring-1 ring-blue-300/50"
                              : "bg-white/90 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          {SUBJECT_EMOJIS[subject]} {subject}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters & Actions */}
                  <AnimatePresence>
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 mt-2 border-t border-blue-200/50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs font-comic font-bold text-gray-600 flex items-center gap-1">
                              🎯 Filtering by:
                            </span>
                            {selectedSubject && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-comic text-xs flex items-center gap-1 border border-blue-200 shadow-sm"
                              >
                                {SUBJECT_EMOJIS[selectedSubject]}{" "}
                                {selectedSubject}
                                <button
                                  onClick={() =>
                                    handleSubjectChange(selectedSubject)
                                  }
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-all"
                                >
                                  <X size={10} />
                                </button>
                              </motion.div>
                            )}
                            {searchQuery && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-comic text-xs flex items-center gap-1 border border-purple-200 shadow-sm"
                              >
                                🔍 &quot;{searchQuery}&quot;
                                <button
                                  onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                    setAllGames([]);
                                    isInitialLoad.current = true;
                                  }}
                                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5 transition-all"
                                >
                                  <X size={10} />
                                </button>
                              </motion.div>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={clearFilters}
                            className="bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white px-3 py-1.5 rounded-lg font-comic font-bold transition-all duration-300 border border-red-300 flex items-center gap-1 whitespace-nowrap text-xs shadow-md hover:shadow-lg"
                          >
                            <X size={12} />
                            Start Over
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Games Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: selectedGrade ? 0.2 : 1.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {renderGamesContent()}
              </motion.div>

              {/* Load More Trigger */}
              {allGames.length > 0 && hasMorePages.current && (
                <div
                  ref={loadMoreTriggerRef}
                  className="flex justify-center mt-8 h-20"
                >
                  {isFetching && (
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-lg border-4 border-yellow-300">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                        <p className="font-comic text-primary-600 text-lg">
                          Loading more amazing games... 🎮
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* End of Results Message */}
              {allGames.length > 0 && !hasMorePages.current && !isFetching && (
                <div className="flex justify-center mt-8">
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-4 border-yellow-300">
                    <p className="font-comic text-primary-600 text-lg flex items-center gap-2">
                      🎉 You&apos;ve seen all the games! Great job exploring! 🌟
                    </p>
                  </div>
                </div>
              )}

              {/* Results Count */}
              {allGames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-8"
                >
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-4 border-yellow-300 inline-block">
                    <p className="font-comic text-purple-600 text-lg">
                      Showing {allGames.length} awesome game
                      {allGames.length !== 1 ? "s" : ""} 🎉
                    </p>
                    {selectedGrade && (
                      <p className="font-comic text-primary-500 text-sm mt-2">
                        📚 Grade {selectedGrade} games
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GamesPage;
