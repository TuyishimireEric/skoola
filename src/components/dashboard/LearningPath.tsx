import React, { useState, useEffect } from "react";
import {
  Star,
  Lock,
  CheckCircle,
  PlayCircle,
  MapPin,
  Compass,
} from "lucide-react";
import { useDailyRecommendations } from "@/hooks/recommendations/useRecommendations";
import { useDailyProgress } from "@/hooks/recommendations/useTodayProgress";
import { RecommendedCourseI } from "@/types/Course";
import { useRouter } from "next/navigation";

interface LearningPathProps {
  studentId: string;
}

const LearningPath: React.FC<LearningPathProps> = ({ studentId }) => {
  const router = useRouter();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [pathAnimated, setPathAnimated] = useState(false);
  const [nodesAnimated, setNodesAnimated] = useState(false);
  const [starsAnimated, setStarsAnimated] = useState(false);
  const [animatedStars, setAnimatedStars] = useState<Record<string, number>>(
    {}
  );

  const { data: recommendations, isLoading } =
    useDailyRecommendations(studentId);
  const { data: dailyProgress } = useDailyProgress(
    recommendations?.map((rec) => rec.GameId) ?? [],
    studentId
  );

  // Create a map for quick lookup of stars by GameId
  const progressMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    dailyProgress?.forEach((item) => {
      map[item.GameId] = item.stars;
    });
    return map;
  }, [dailyProgress]);

  // Enhanced recommendations with progress data
  const enhancedRecommendations = React.useMemo(() => {
    if (!recommendations) return [];

    return recommendations.map((rec) => ({
      ...rec,
      stars: progressMap[rec.GameId] ?? 0,
      status:
        progressMap[rec.GameId] > 0 ? ("completed" as const) : rec.status,
    }));
  }, [recommendations, progressMap]);

  // Trigger animations when data loads
  useEffect(() => {
    if (enhancedRecommendations && enhancedRecommendations.length > 0) {
      // Start path animation immediately
      setPathAnimated(true);

      // Start nodes animation after path completes
      const nodesTimer = setTimeout(() => {
        setNodesAnimated(true);
      }, 800);

      // Start stars animation after nodes appear
      const starsTimer = setTimeout(() => {
        setStarsAnimated(true);
        // Animate all stars at once on entry
        animateAllStars();
      }, 1300);

      return () => {
        clearTimeout(nodesTimer);
        clearTimeout(starsTimer);
      };
    }
  }, [enhancedRecommendations]);

  // Function to animate all stars at once on entry
  const animateAllStars = () => {
    if (!enhancedRecommendations) return;

    enhancedRecommendations.forEach((rec, courseIndex) => {
      if (rec.stars > 0) {
        // Set all stars for this course immediately with staggered animation
        setTimeout(() => {
          setAnimatedStars((prev) => ({
            ...prev,
            [rec.GameId]: rec.stars,
          }));
        }, courseIndex * 150); // Stagger by course
      } else {
        setAnimatedStars((prev) => ({
          ...prev,
          [rec.GameId]: 0,
        }));
      }
    });
  };

  // Handle level click - navigate to game or set selected level
  const handleLevelClick = (level: RecommendedCourseI) => {
    if (level.status === "locked") return;

    // Navigate to games page
    router.push(`/games/${level.GameId}`);
  };

  // Fixed level positioning with predefined variations
  const getLevelPositions = (levelCount: number) => {
    const positions = [];
    const minY = 15;
    const maxY = 90;
    const yRange = maxY - minY;

    const predefinedVariations = [
      0, 2.8, 5.6, 1.4, -5.4, -5.7, -0.8, 4.2, 5.9, 3.0,
    ];

    for (let i = 0; i < levelCount; i++) {
      const progress = i / Math.max(levelCount - 1, 1);
      const yPosition = minY + progress * yRange;

      const isEven = i % 2 === 0;
      let baseX = isEven ? 5 : 80;

      if (i === 0 || i === levelCount - 1) {
        baseX = 50;
      }

      const variation =
        predefinedVariations[i % predefinedVariations.length] || 0;

      positions.push({
        x: Math.max(20, Math.min(90, baseX + variation)),
        y: yPosition,
        side: isEven ? "left" : "right",
      });
    }

    return positions;
  };

  const positions = enhancedRecommendations
    ? getLevelPositions(enhancedRecommendations.length)
    : [];

  // Get status-based styles
  const getStatusStyles = (level: RecommendedCourseI) => {
    switch (level.status) {
      case "completed":
        return {
          container:
            "bg-gradient-to-br from-green-300 to-emerald-200 border-green-400",
          overlay: "opacity-0",
        };
      case "current":
        return {
          container:
            "bg-gradient-to-br from-orange-300 to-yellow-200 border-orange-400",
          overlay: "opacity-0",
        };
      case "locked":
        return {
          container:
            "bg-gradient-to-br from-gray-200 to-gray-100 border-gray-300",
          overlay: "opacity-50",
        };
      default:
        return {
          container:
            "bg-gradient-to-br from-orange-100 to-pink-100 border-orange-300",
          overlay: "opacity-0",
        };
    }
  };

  // Get tooltip text based on status
  const getTooltipText = (level: RecommendedCourseI) => {
    if (level.status === "completed") {
      return "✅ Completed!";
    } else if (level.status === "current" || level.status !== "locked") {
      return "🎮 Play Now!";
    } else {
      return "🔒 Unlock Previous Levels";
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60" />

        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce opacity-20"
              style={{
                left: `${20 + i * 15}%`,
                top: `${15 + i * 12}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "2s",
              }}
            >
              <div className="text-2xl">
                {["🎯", "⭐", "🚀", "💡", "🎓", "🌟"][i]}
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Compass
                size={48}
                className="text-blue-500 animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <div
                className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"
                style={{ animationDuration: "1.5s" }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-700 animate-pulse">
              Crafting Your Learning Journey
            </h3>
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bunce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Mapping out the perfect path for you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No Data State
  if (!enhancedRecommendations || enhancedRecommendations.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-30"
              style={{
                left: `${20 + i * 20}%`,
                top: `${20 + i * 15}%`,
              }}
            >
              <MapPin size={24} className="text-gray-400" />
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Compass size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              No Learning Path Found
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We couldn&apos;t find a learning path for you at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-10 left-10 text-4xl sm:text-6xl animate-bounce"
          style={{ animationDelay: "0s" }}
        >
          ⭐
        </div>
        <div
          className="absolute top-32 right-16 text-3xl sm:text-4xl animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          🌟
        </div>
        <div
          className="absolute bottom-20 left-20 text-4xl sm:text-5xl animate-bounce"
          style={{ animationDelay: "2s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-40 right-12 text-2xl sm:text-3xl animate-bounce"
          style={{ animationDelay: "1.5s" }}
        >
          💫
        </div>
      </div>

      {/* SVG Path with Animation */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f9e6c5" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#a3b18a" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="4"
          points={positions.map((pos) => `${pos.x},${pos.y}`).join(" ")}
          className={`transition-all duration-1000 ease-out ${
            pathAnimated ? "opacity-100" : "opacity-0"
          }`}
          style={{
            strokeDasharray: pathAnimated ? "none" : "1000",
            strokeDashoffset: pathAnimated ? "0" : "1000",
            transition:
              "stroke-dashoffset 1.5s ease-out, opacity 0.3s ease-out",
          }}
        />
      </svg>

      {/* Level Nodes */}
      {enhancedRecommendations?.map((level, idx) => {
        const pos = positions[idx];
        const styles = getStatusStyles(level);
        const isClickable = level.status !== "locked";
        const currentStars = animatedStars[level.GameId] ?? 0;

        return (
          <div
            key={level.id}
            className={`absolute group transition-all duration-500 ${
              isClickable
                ? "cursor-pointer hover:scale-105"
                : "cursor-not-allowed"
            } ${
              nodesAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              left: `calc(${pos.x}% - 32px)`,
              top: `calc(${pos.y}% - 32px)`,
              zIndex:
                level.status === "current"
                  ? 20
                  : hoveredLevel === level.id
                  ? 15
                  : 10,
              transitionDelay: `${idx * 100}ms`,
            }}
            onClick={() => handleLevelClick(level)}
            onMouseEnter={() => setHoveredLevel(level.id)}
            onMouseLeave={() => setHoveredLevel(null)}
          >
            {/* Main Level Circle */}
            <div
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex flex-col items-center justify-center 
              border-3 shadow-lg transition-all duration-300 ${styles.container}
              ${
                hoveredLevel === level.id && isClickable
                  ? "scale-110 shadow-xl"
                  : ""
              }
              ${level.status === "current" ? "scale-105 shadow-xl" : ""}`}
            >
              {/* Emoji */}
              <div className="flex items-center justify-center">
                <span className="text-xl sm:text-2xl">{level.emoji}</span>
              </div>

              {/* Status Icon */}
              <div className="absolute top-1 right-1">
                {level.status === "completed" && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white" size={8} />
                  </div>
                )}
                {level.status === "current" && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <PlayCircle className="text-white" size={8} />
                  </div>
                )}
                {level.status === "locked" && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full flex items-center justify-center">
                    <Lock className="text-white" size={6} />
                  </div>
                )}
              </div>

              {/* Locked Overlay */}
              <div
                className={`absolute inset-0 bg-gray-400 rounded-full transition-opacity duration-300 ${styles.overlay}`}
              />
            </div>

            {/* Level Number Badge */}
            <div
              className={`absolute top-0 -left-2 w-4 h-4 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                level.status === "completed"
                  ? "bg-green-500"
                  : level.status === "current"
                  ? "bg-orange-500"
                  : "bg-gray-400"
              }`}
            >
              {level.id}
            </div>

            {/* Enhanced Animated Stars Display */}
            <div className="absolute -bottom-5 sm:-bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-1 rounded-full">
              {[...Array(level.maxStars || 3)].map((_, i) => {
                const isEarned = i < currentStars;
                const shouldAnimate = isEarned && starsAnimated;

                return (
                  <div
                    key={i}
                    className={`transition-all duration-700 ${
                      shouldAnimate
                        ? "scale-110"
                        : isEarned
                        ? "scale-100"
                        : "scale-90"
                    }`}
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationDuration: "1.2s",
                      animationFillMode: "forwards",
                    }}
                  >
                    <Star
                      size={16}
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 ${
                        isEarned
                          ? "text-yellow-500 fill-yellow-400 drop-shadow-lg filter brightness-110"
                          : level.status === "locked"
                          ? "text-gray-300"
                          : "text-orange-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Level Name */}
            <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 transform -translate-x-1/2 text-center">
              <span
                className={`font-bold text-xs whitespace-nowrap ${
                  level.status === "locked" ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {level.title}
              </span>
            </div>

            {/* Enhanced Tooltip */}
            {hoveredLevel === level.id && (
              <div
                className={`absolute left-1/2 -translate-x-1/2 ${
                  pos.y < 30 ? "top-20 sm:top-28" : "-top-20 sm:-top-24"
                } bg-white border-2 border-orange-200 rounded-2xl shadow-xl px-3 sm:px-4 py-2 sm:py-3 z-30 min-w-40 sm:min-w-48 animate-in fade-in-0 zoom-in-95 duration-200`}
              >
                <div className="text-center">
                  <div className="text-base sm:text-lg font-black text-gray-800 mb-1">
                    {level.emoji} {level.title}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                    {level.subject} • {level.estimatedTime}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(level.maxStars || 3)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < currentStars
                            ? "text-yellow-500 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-full transition-colors duration-200 ${
                      level.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : level.status === "current" ||
                          level.status !== "locked"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getTooltipText(level)}
                  </div>
                </div>
                {/* Tooltip Arrow */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
                    pos.y < 30
                      ? "-top-2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"
                      : "-bottom-2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningPath;
