import { motion } from "framer-motion";
import { Eye, CheckCircle, Book, Target } from "lucide-react";
import { QuestionDataI } from "@/types/Questions";
import { GameDataI } from "@/types/Course";

interface PreviewStepProps {
  questionsData: QuestionDataI[];
  game: GameDataI;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ questionsData, game }) => {
  const difficultyColors = {
    Easy: "from-green-400 to-green-600",
    Medium: "from-yellow-400 to-orange-500",
    Hard: "from-red-400 to-red-600",
  };

  const difficultyStats = questionsData.reduce(
    (acc, q) => {
      acc[q.Difficulty as keyof typeof acc] =
        (acc[q.Difficulty as keyof typeof acc] || 0) + 1;
      return acc;
    },
    { Easy: 0, Medium: 0, Hard: 0 }
  );

  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Summary Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-3 rounded-2xl">
            <Eye className="text-green-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Preview & Save</h2>
        </div>

        {/* Game and Questions Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Game Info */}
          <div className="bg-gradient-to-r from-primary-50 to-orange-50 p-6 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Book className="text-primary-600" size={20} />
              Target Game
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={game.ImageUrl}
                alt={game.Title}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white"
              />
              <div>
                <h4 className="font-bold text-primary-600">{game.Title}</h4>
                <p className="text-gray-600 text-sm">{game.Subject}</p>
              </div>
            </div>
          </div>

          {/* Questions Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-green-600" size={20} />
              Questions Summary
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-bold text-green-600">
                {questionsData.length} Total Questions
              </p>
              <div className="flex gap-2 text-sm">
                {Object.entries(difficultyStats).map(
                  ([level, count]) =>
                    count > 0 && (
                      <span
                        key={level}
                        className={`bg-gradient-to-r ${
                          difficultyColors[
                            level as keyof typeof difficultyColors
                          ]
                        } text-white px-2 py-1 rounded-full text-xs font-bold`}
                      >
                        {count} {level}
                      </span>
                    )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <h4 className="font-bold text-green-800">Ready to Save!</h4>
          </div>
          <p className="text-gray-700">
            Your questions are ready to be added to{" "}
            <strong>{game.Title}</strong>. Students will be able to practice
            with these engaging math problems.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewStep;
