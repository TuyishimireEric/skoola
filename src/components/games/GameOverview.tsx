import { GameDataI } from "@/types/Course";
import { motion } from "framer-motion";
import { Brain, CheckCircle, Gamepad2, Rocket } from "lucide-react";

export const GameOverview = ({ game }: { game: GameDataI }) => {
  return (
    <motion.div
      key="overview"
      role="tabpanel"
      id="overview-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-primary-600 mb-4 flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">
            🌟
          </span>
          What You&apos;ll Learn
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              🧮
            </span>
            <div>
              <h4 className="font-bold text-gray-800">Subject Skills</h4>
              <p className="text-gray-600">
                Master {game.Subject || "various topics"} through interactive
                gameplay
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              🧩
            </span>
            <div>
              <h4 className="font-bold text-gray-800">Problem Solving</h4>
              <p className="text-gray-600">
                Develop critical thinking with engaging puzzles
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              🏆
            </span>
            <div>
              <h4 className="font-bold text-gray-800">Achievement System</h4>
              <p className="text-gray-600">
                Earn rewards and unlock new challenges
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              🎨
            </span>
            <div>
              <h4 className="font-bold text-gray-800">African Culture</h4>
              <p className="text-gray-600">
                Explore beautiful African village themes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-primary-600 mb-4 flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">
            🎯
          </span>
          Game Features
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-2xl text-center">
            <Gamepad2 className="mx-auto text-orange-600 mb-2" size={32} />
            <h4 className="font-bold text-gray-800">Interactive Play</h4>
            <p className="text-sm text-gray-600 mt-1">
              Engaging African village adventures
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-primary-100 p-4 rounded-2xl text-center">
            <Brain className="mx-auto text-primary-600 mb-2" size={32} />
            <h4 className="font-bold text-gray-800">Smart Learning</h4>
            <p className="text-sm text-gray-600 mt-1">
              Adapts to your learning pace
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl text-center">
            <Rocket className="mx-auto text-pink-600 mb-2" size={32} />
            <h4 className="font-bold text-gray-800">Progress Tracking</h4>
            <p className="text-sm text-gray-600 mt-1">
              See your amazing growth
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">
            📊
          </span>
          Learning Goals
        </h3>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
          <ul className="space-y-3" role="list">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-1" size={20} />
              <span className="text-gray-700">
                Master key concepts in {game.Subject || "your subject"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-1" size={20} />
              <span className="text-gray-700">
                Solve problems quickly and accurately
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-1" size={20} />
              <span className="text-gray-700">
                Apply learning in real-world scenarios
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-1" size={20} />
              <span className="text-gray-700">
                Build confidence and love for learning
              </span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
