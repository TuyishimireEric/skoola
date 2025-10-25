import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useGames } from "@/hooks/games/useGames";
import { GameDataI } from "@/types/Course";

export const RelatedGames = ({ game }: { game: GameDataI }) => {
  const { data: games } = useGames({
    page: 1,
    pageSize: 4,
    searchText: "",
    subject: game.Subject,
    grade: game.Grade?.toString(),
  });

  const router = useRouter();
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-12"
      aria-labelledby="related-games-title"
    >
      <h2
        id="related-games-title"
        className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600"
      >
        More Amazing Games! 🎮
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games
          ?.filter((g) => g.Id !== game.Id)
          .slice(0, 3)
          .map((relatedGame, index) => (
            <motion.div
              key={relatedGame.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm border-2 border-primary-200 rounded-2xl shadow-xl overflow-hidden border-3 border-orange-200 hover:border-orange-400 transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(`/games/${relatedGame.Id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/games/${relatedGame.Id}`);
                }
              }}
              aria-label={`Navigate to ${relatedGame.Title} game`}
            >
              <div className="relative">
                <img
                  src={relatedGame.ImageUrl}
                  alt={`${relatedGame.Title} preview`}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Play size={32} className="text-white fill-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                  {relatedGame.Title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {relatedGame.Description}
                </p>
                {relatedGame.Subject && (
                  <div className="mt-3">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {relatedGame.Subject}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </motion.section>
  );
};
