import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Clock,
  Users,
  Star,
  Heart,
  BookOpen,
  Target,
  MessageCircle,
  CheckCircle,
  StarsIcon,
  Settings,
  Edit,
  Home,
  Gamepad2,
  ChevronRight,
} from "lucide-react";

import { useGameById } from "@/hooks/games/useGames";
import AfricanLoader from "../loader/AfricanLoader";
import Image from "next/image";
import LeaderBoard from "../learning/LeaderBoard";
import { RelatedGames } from "./RelatedGames";
import { Reviews } from "./Reviews";
import AddGameForm from "./AddGame";
import { GameDataI } from "@/types/Course";
import { GameOverview } from "./GameOverview";
import { AdminStats } from "./AdminStats";
import { useGameReviews } from "@/hooks/reviews/useGameReviews";
import { useLikeGame } from "@/hooks/reviews/useLikes";
import { useClientSession } from "@/hooks/user/useClientSession";

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
      label: "Games",
      icon: Gamepad2,
      onClick: () => router.push("/school/games"),
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-green-100 cursor-pointer ${
                      isLast
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      isLast
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

  const { data: reviewsData } = useGameReviews({
    gameId,
    page: 1,
    limit: 1,
  });

  const [editGame, setEditGame] = useState<GameDataI | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "champions" | "reviews"
  >("overview");
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const { data: game, isLoading, error } = useGameById(gameId);

  const likeGameMutation = useLikeGame();

  // Check if user is admin - use prop or fallback to session
  const isUserAdmin = isAdmin || false;

  const handlePlayGame = () => {
    if (game?.Id) {
      router.push(`/games/${game.Id}/play`);
    }
  };

  const handleAdminQuestions = () => {
    if (game?.Id) {
      router.push(`/school/games/${game.Id}/questions`);
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

  useEffect(() => {
    if (reviewsData?.gameLikes.isLikedByCurrentUser) {
      setIsFavorite(reviewsData?.gameLikes.isLikedByCurrentUser);
    }
  }, [reviewsData?.gameLikes.isLikedByCurrentUser]);

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

  const difficultyLevel = useMemo(() => {
    if (!game?.NumberOfLevels) return "Easy";
    if (game.NumberOfLevels <= 3) return "Easy";
    if (game.NumberOfLevels <= 5) return "Medium";
    return "Hard";
  }, [game?.NumberOfLevels]);

  const difficultyColor = useMemo(() => {
    switch (difficultyLevel) {
      case "Easy":
        return "from-green-400 to-green-600";
      case "Medium":
        return "from-yellow-400 to-orange-500";
      case "Hard":
        return "from-red-400 to-red-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  }, [difficultyLevel]);

  // Admin Statistics
  const adminStats = useMemo(() => {
    if (!game) return null;

    const completionRate = parseFloat(game.CompletionRate || "0");
    const averageRating = parseFloat(game.AverageRating || "0");
    const totalStudents = parseInt(game.StudentsAttended || "0");
    const activeStudents = Math.floor(totalStudents * 0.7); // Mock active students

    return {
      completionRate,
      averageRating,
      totalStudents,
      activeStudents,
      passRate: Math.min(completionRate + 10, 100), // Mock pass rate
      avgSessionTime: game.Duration || 15, // Use duration or default
    };
  }, [game]);

  // Loading state
  if (isLoading) {
    return (
      <AfricanLoader
        Title="Loading Your Game Adventure! 🎮"
        Description="The village animals are preparing your game... 🌟"
      />
    );
  }

  // Error or game not found
  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border-4 border-red-300 max-w-md">
          <div className="text-8xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 font-comic">
            Game Not Found
          </h1>
          <p className="text-gray-700 mb-6 font-comic">
            Oops! We couldn&apos;t find this game. It might have been moved or
            deleted.
          </p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg"
            aria-label="Go back to games list"
          >
            🏠 Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full min-h-screen overflow-hidden font-comic`}>
      {/* Background Elements - Only show for non-admin */}
      {!isUserAdmin && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="relative w-full h-full mx-auto">
            <div className="fixed right-24 bottom-0 w-full sm:w-4/5 md:w-3/5 lg:w-2/3 h-5/6 opacity-40 sm:opacity-70 md:opacity-100">
              <Image
                src="/pose.png"
                alt="Cartoon characters"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw"
                className="object-contain object-right-bottom"
              />
            </div>
          </div>
        </div>
      )}

      {/* Decorative African Elements - Only show for non-admin */}
      {!isUserAdmin && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 text-8xl opacity-20"
          >
            🏺
          </motion.div>
          <motion.div
            animate={{ y: -20 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute bottom-20 left-20 text-7xl opacity-20"
          >
            🌍
          </motion.div>
          <motion.div
            animate={{ scale: 1.2 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute top-40 left-40 text-6xl opacity-20"
          >
            🦁
          </motion.div>
          <motion.div
            animate={{ rotate: 10 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute top-60 right-40 text-5xl opacity-20"
          >
            🌳
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={`relative z-20 ${
          isUserAdmin ? "p-6 " : "pt-32 px-4 sm:px-6 md:px-12 lg:px-20"
        } pb-12 max-w-[1400px] mx-auto`}
      >
        {/* Admin Header */}
        {isUserAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <Breadcrumb game={game} />

              <div className="flex items-center gap-3">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-purple-300">
                  <span className="text-purple-700 font-bold">Admin View</span>
                </div>
                <button
                  onClick={handleEditGame}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Game</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div
          className={`grid ${
            isUserAdmin ? "lg:grid-cols-3" : "lg:grid-cols-3"
          } gap-8`}
        >
          {/* Main Game Info */}
          <div
            className={`${
              isUserAdmin ? "lg:col-span-2" : "lg:col-span-2"
            } space-y-6`}
          >
            {/* Game Hero Section */}
            <motion.section
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-200"
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
                  <div
                    className={`bg-gradient-to-r ${difficultyColor} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}
                  >
                    {difficultyLevel} Level
                  </div>
                  {game.Status === "Published" && (
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <CheckCircle size={16} />
                      <span>Active</span>
                    </div>
                  )}
                  {isUserAdmin && (
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Grade {game.Grade || "N/A"}
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
                      className={`relative bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg focus:ring-4 focus:ring-red-300 ${
                        !userRoleId ? "opacity-50 cursor-not-allowed" : ""
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
                  <div
                    className="flex items-center gap-1"
                    role="img"
                    aria-label={`Rating: ${reviewsData?.averageRating} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i <
                          Math.floor(
                            parseFloat(reviewsData?.averageRating.score ?? "0")
                          )
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}

                    <span className="ml-2 text-gray-600 font-bold">
                      {parseFloat(
                        reviewsData?.averageRating.score ?? "0"
                      ).toFixed(1) ?? "0"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({reviewsData?.pagination.totalCount} reviews)
                    </span>
                  </div>
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
                    onClick={handlePlayGame}
                    className={`w-full py-4 px-8 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white focus:ring-4 ${
                      isUserAdmin
                        ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 focus:ring-blue-300"
                        : "bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 hover:from-orange-500 hover:via-red-500 hover:to-yellow-500 focus:ring-orange-300"
                    } text-white`}
                    aria-label={`${isUserAdmin ? "Preview" : "Start playing"} ${
                      game.Title
                    }`}
                  >
                    <Play size={28} className="fill-white" />
                    <span>
                      {isUserAdmin ? "Preview Game" : "Start Adventure!"}
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
                      {isUserAdmin ? "👁️" : "🎮"}
                    </motion.span>
                  </motion.button>

                  {/* Admin Questions Button */}
                  {isUserAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAdminQuestions}
                      className="w-full bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white py-4 px-8 rounded-3xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white focus:ring-4 focus:ring-purple-300"
                      aria-label={`Manage questions for ${game.Title}`}
                    >
                      <Settings size={28} />
                      <span>Manage Questions</span>
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
                        ⚙️
                      </motion.span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Tabs Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border-4 border-primary-200"
              aria-labelledby="game-details-tabs"
            >
              {/* Tab Headers */}
              <div className="flex bg-primary-100" role="tablist">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "champions", label: "Champions", icon: StarsIcon },
                  {
                    id: "reviews",
                    label: `Reviews${
                      reviewsData
                        ? ` (${reviewsData.averageRating.totalReviews})`
                        : ""
                    }`,
                    icon: MessageCircle,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() =>
                      setActiveTab(
                        tab.id as "overview" | "champions" | "reviews"
                      )
                    }
                    className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-primary-400 text-white"
                        : "text-gray-600 hover:bg-primary-200"
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && <GameOverview game={game} />}

                  {activeTab === "champions" && (
                    <motion.div
                      key="champions"
                      role="tabpanel"
                      id="champions-panel"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4 min-h-36"
                    >
                      <LeaderBoard course={game} />
                    </motion.div>
                  )}

                  {activeTab === "reviews" && <Reviews gameId={gameId} />}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* Admin Statistics Panel - Only show for admin */}
          {isUserAdmin && adminStats && (
            <AdminStats
              game={game}
              adminStats={adminStats}
              handleEditGame={handleEditGame}
              handleAdminQuestions={handleAdminQuestions}
            />
          )}
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
