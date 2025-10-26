import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Heart,
  BookOpen,
  Target,
  CheckCircle,
  Edit,
  Home,
  Gamepad2,
  ChevronRight,
} from "lucide-react";

import { useGameById } from "@/hooks/games/useGames";
import { RelatedGames } from "./RelatedGames";
import AddGameForm from "./AddGame";
import { GameDataI } from "@/types/Course";
import { useLikeGame } from "@/hooks/reviews/useLikes";
import { useClientSession } from "@/hooks/user/useClientSession";
import { FaMarker } from "react-icons/fa6";

interface GameDetailsPageProps {
  isAdmin?: boolean;
}

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Breadcrumb = ({ game }: { game: GameDataI | undefined }) => {
  const router = useRouter();

  const breadcrumbItems = [
    {
      label: "Dashboard",
      icon: Home,
      onClick: () => router.push("/dashboard"),
    },
    {
      label: "Courses",
      icon: Gamepad2,
      onClick: () => router.push("/courses"),
    },
    {
      label: game?.Title || "Game",
      icon: null,
      onClick: null,
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      <div className="flex-1 backdrop-blur-sm rounded-2xl p-2">
        <ol className="flex items-center space-x-2 text-sm font-semibold">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const Icon = item.icon;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}

                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-green-100 cursor-pointer ${isLast
                      ? "text-green-600 bg-green-100"
                      : "text-gray-600 hover:text-primary-600"
                      }`}
                    type="button"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </button>
                ) : (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isLast
                      ? "text-green-600 bg-green-50 font-bold"
                      : "text-gray-600"
                      }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="truncate max-w-[150px]">{item.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
};

const HeartParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, -Math.random() * 60 - 20],
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        >
          <Heart
            size={20}
            className="fill-red-500 text-red-500"
            style={{
              filter: `hue-rotate(${i * 15}deg)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

const GameDetailsPage: React.FC<GameDetailsPageProps> = ({
  isAdmin = false,
}) => {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;

  const { userRoleId } = useClientSession();

  const [editGame, setEditGame] = useState<GameDataI | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const { data: game, isLoading, error } = useGameById(gameId);

  const likeGameMutation = useLikeGame();

  // Check if user is admin - use prop or fallback to session
  const isUserAdmin = isAdmin || false;

  const handlePerformance = () => {
    if (game?.Id) {
      router.push(`/courses/${game.Id}/performance`);
    }
  };

  const handleEditGame = () => {
    if (game) {
      setEditGame(game);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = async () => {
    if (!userRoleId || !game?.Id) return;

    setShowHeartAnimation(true);
    setIsFavorite(!isFavorite);

    try {
      await likeGameMutation.mutateAsync({ gameId: game.Id });

      setTimeout(() => {
        setShowHeartAnimation(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsFavorite(!isFavorite);
      setShowHeartAnimation(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h3 className="w-full h-full">Loading course details...</h3>
      </div>
    );
  }

  // Error or game not found
  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border-4 border-red-300 max-w-md">
          <div className="text-8xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 font-comic">
            Course Not Found
          </h1>
          <p className="text-gray-700 mb-6 font-comic">
            Oops! We couldn&apos;t find this Course. It might have been moved or
            deleted.
          </p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg"
            aria-label="Go back to games list"
          >
            🏠 Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full max-w-7xl min-h-screen overflow-hidden font-comic`}>
      {/* Main Content */}
      <main
        id="main-content"
        className={`relative z-20 ${isUserAdmin ? "pr-4  pt-2" : "pt-4"
          } pb-12 max-w-[1400px] mx-auto`}
      >
        {/* Admin Header */}
        {isUserAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between">
              <Breadcrumb game={game} />

              <div className="flex items-center gap-3">
                <div className="bg-white/90 hover:bg-blue-100 cursor-pointer backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-purple-300">
                  <span onClick={handlePerformance} className="text-purple-700 font-bold ">Student Performance</span>
                </div>
                <button
                  onClick={handleEditGame}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Course</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div
          className={`w-full`}
        >
          {/* Game Hero Section */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-orange-200"
            aria-labelledby="game-title"
          >
            <div className="relative">
              <img
                src={game.ImageUrl}
                alt={`${game.Title} game preview`}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />

              {/* Status and Difficulty Badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {game.Status === "Published" && (
                  <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <CheckCircle size={16} />
                    <span>Active</span>
                  </div>
                )}
                {isUserAdmin && (
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    P{game.Grade || "N/A"}
                  </div>
                )}
              </div>

              {/* Favorite Button - Only for non-admin */}
              {!isUserAdmin && (
                <div className="absolute top-4 right-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleFavorite}
                    disabled={!userRoleId || likeGameMutation.isPending}
                    className={`relative bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg focus:ring-4 focus:ring-red-300 ${!userRoleId ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    aria-label={
                      isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <motion.div
                      animate={
                        showHeartAnimation
                          ? {
                            scale: [1, 1.3, 1],
                            rotate: [0, -10, 10, 0],
                          }
                          : {}
                      }
                      transition={{ duration: 0.4 }}
                    >
                      <Heart
                        size={24}
                        className={
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500"
                        }
                      />
                    </motion.div>
                    {showHeartAnimation && <HeartParticles />}
                  </motion.button>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1
                  id="game-title"
                  className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600"
                >
                  {game.Title}
                </h1>
              </div>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {game.Description}
              </p>

              {/* Game Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {game.Duration && (
                  <div className="bg-orange-100 p-3 rounded-2xl text-center">
                    <Clock
                      className="mx-auto text-orange-600 mb-1"
                      size={24}
                    />
                    <p className="text-sm font-bold text-gray-800">
                      {game.Duration} min
                    </p>
                  </div>
                )}
                {game.NumberOfLevels && (
                  <div className="bg-primary-100 p-3 rounded-2xl text-center">
                    <Target
                      className="mx-auto text-primary-500 mb-1"
                      size={24}
                    />
                    <p className="text-sm font-bold text-gray-800">
                      {game.NumberOfLevels} levels
                    </p>
                  </div>
                )}
                {game.StudentsAttended && (
                  <div className="bg-green-100 p-3 rounded-2xl text-center">
                    <Users
                      className="mx-auto text-green-600 mb-1"
                      size={24}
                    />
                    <p className="text-sm font-bold text-gray-800">
                      {game.StudentsAttended} players
                    </p>
                  </div>
                )}
                {game.Subject && (
                  <div className="bg-orange-100 p-3 rounded-2xl text-center">
                    <BookOpen
                      className="mx-auto text-orange-600 mb-1"
                      size={24}
                    />
                    <p className="text-sm font-bold text-gray-800">
                      {game.Subject}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {game.Tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {game.Tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Play Button - Different for admin */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePerformance}
                  className={`w-full py-4 px-8 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white focus:ring-4 ${isUserAdmin
                    ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 focus:ring-blue-300"
                    : "bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 hover:from-orange-500 hover:via-red-500 hover:to-yellow-500 focus:ring-orange-300"
                    } text-white`}
                  aria-label={`${isUserAdmin ? "Preview" : "Start playing"} ${game.Title
                    }`}
                >
                  <FaMarker size={28} className="fill-white" />
                  <span>
                    Student Performance
                  </span>
                  <motion.span
                    animate={{ rotate: 10 }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                    className="text-2xl"
                    aria-hidden="true"
                  >
                  </motion.span>
                </motion.button>

              </div>
            </div>
          </motion.section>
        </div>
        {editGame && (
          <AddGameForm
            show={editGame != null}
            onClose={() => setEditGame(null)}
            course={editGame}
            isEditing={true}
          />
        )}
        {/* Related Games Section - Only show for non-admin */}
        {!isUserAdmin && <RelatedGames game={game} />}
      </main>
    </div>
  );
};

export default GameDetailsPage;
