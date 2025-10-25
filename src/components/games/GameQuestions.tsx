import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  XCircle,
  Clock,
  MessageCircle,
  ChevronRight,
  Home,
  Gamepad2,
} from "lucide-react";

import AfricanLoader from "../loader/AfricanLoader";
import { useQuestions } from "@/hooks/questions/useQuestions";
import {
  DifficultyLevel,
  FillInTheBlankData,
  isDifficultyLevel,
  isMediaType,
  isQuestionType,
  QuestionDataI,
  QuestionType,
} from "@/types/Questions";
import { GameDataI } from "@/types/Course";
import StatsCard from "../dashboard/StatsCard";
import { QuestionCard } from "./questions/QuestionCard";

type FilterType = "All" | QuestionType;
type FilterDifficulty = "All" | DifficultyLevel;
type FilterApproval = "All" | "Approved" | "Pending";

interface QuestionStats {
  total: number;
  approved: number;
  pending: number;
  byDifficulty: Record<string, number>;
}

// Convert API question type to our local type
function toLocalQuestion(apiQuestion: QuestionDataI): QuestionDataI {
  return {
    ...apiQuestion,
    QuestionType: isQuestionType(apiQuestion.QuestionType)
      ? apiQuestion.QuestionType
      : "Multiple Choice",
    MediaType: isMediaType(apiQuestion.MediaType)
      ? apiQuestion.MediaType
      : "None",
    Difficulty: isDifficultyLevel(apiQuestion.Difficulty)
      ? apiQuestion.Difficulty
      : "medium",
  };
}

interface GameQuestionsProps {
  game: GameDataI | undefined;
  gameLoading: boolean;
  setIsAddingQuestions: (value: boolean) => void;
}

// Breadcrumb Component
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
      onClick: () => router.back(),
    },
    {
      label: "Questions",
      icon: MessageCircle,
      onClick: null, // Current page
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

const GameQuestionsPage = ({
  game,
  gameLoading,
  setIsAddingQuestions,
}: GameQuestionsProps) => {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<FilterDifficulty>("All");
  const [selectedType, setSelectedType] = useState<FilterType>("All");
  const [selectedApproval, setSelectedApproval] =
    useState<FilterApproval>("All");
  const [showAddQuestion, setShowAddQuestion] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDataI | null>(
    null
  );

  const {
    data: questions,
    isLoading: questionsLoading,
    refetch,
  } = useQuestions({ GameId: gameId, limit: 80 });

  // Convert API questions to local type
  const localQuestions = useMemo(() => {
    return questions ? questions.map(toLocalQuestion) : [];
  }, [questions]);

  // Filter questions based on search and filters
  const filteredQuestions = useMemo((): QuestionDataI[] => {
    return localQuestions.filter((question: QuestionDataI) => {
      let searchableText = question.QuestionText;
      if (question.QuestionType === "FillInTheBlank") {
        const parsed: FillInTheBlankData = JSON.parse(question.QuestionText);
        searchableText = parsed.question;
      }

      const matchesSearch = searchableText
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        question.Difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const matchesType =
        selectedType === "All" ||
        question.QuestionType === selectedType ||
        question.QuestionType === "FillInTheBlank" ||
        selectedType === "FillInTheBlank";

      const matchesApproval =
        selectedApproval === "All" ||
        (selectedApproval === "Approved" && question.IsApproved) ||
        (selectedApproval === "Pending" && !question.IsApproved);

      return (
        matchesSearch && matchesDifficulty && matchesType && matchesApproval
      );
    });
  }, [
    localQuestions,
    searchTerm,
    selectedDifficulty,
    selectedType,
    selectedApproval,
  ]);

  const handleBack = (): void => {
    router.back();
  };

  const handleAddQuestion = (): void => {
    setIsAddingQuestions(true);
  };

  const handleEditQuestion = (question: QuestionDataI): void => {
    setEditingQuestion(question);
    setShowAddQuestion(true);
  };

  const handleDeleteQuestion = async (questionId: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      // Implement delete logic here
      console.log("Delete question:", questionId);
      refetch();
    }
  };

  const handleToggleApproval = async (questionId: string): Promise<void> => {
    // Implement approval toggle logic here
    console.log("Toggle approval for question:", questionId);
    refetch();
  };

  const handleCloseForm = (): void => {
    setShowAddQuestion(false);
    setEditingQuestion(null);
    refetch();
  };

  // Statistics
  const stats = useMemo((): QuestionStats | null => {
    if (!localQuestions) return null;

    const total = localQuestions.length;
    const approved = localQuestions.filter(
      (q: QuestionDataI) => q.IsApproved
    ).length;
    const pending = total - approved;
    const byDifficulty = localQuestions.reduce(
      (acc: Record<string, number>, q: QuestionDataI) => {
        const difficulty = q.Difficulty.toLowerCase();
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, approved, pending, byDifficulty };
  }, [localQuestions]);

  if (gameLoading || questionsLoading) {
    return (
      <AfricanLoader
        Title="Loading Game Questions! 📝"
        Description="Gathering all your amazing questions..."
      />
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border-4 border-red-300 max-w-md">
          <div className="text-8xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 font-comic">
            Game Not Found
          </h1>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg"
            type="button"
          >
            🏠 Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-comic">
      {/* Decorative Background */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 text-6xl opacity-10"
        >
          📝
        </motion.div>
        <motion.div
          animate={{ y: -20 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-20 text-5xl opacity-10"
        >
          🎯
        </motion.div>
        <motion.div
          animate={{ scale: 1.2 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute top-40 left-40 text-4xl opacity-10"
        >
          💡
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="relative z-20 p-6 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <Breadcrumb game={game} />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddQuestion}
              className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center gap-2"
              type="button"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Question</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
          >
            <StatsCard
              label="Total Questions"
              value={stats.total ?? "0"}
              icon={MessageCircle}
              color="border-blue-300"
              isLoading={false}
            />

            <StatsCard
              label="Approved"
              value={stats.approved ?? "0"}
              icon={MessageCircle}
              color="border-green-300"
              isLoading={false}
            />

            <StatsCard
              label="Pending"
              value={stats.pending ?? "0"}
              icon={Clock}
              color="border-orange-300"
              isLoading={false}
            />

            <StatsCard
              label="Hard questions"
              value={stats.byDifficulty.hard ?? "0"}
              icon={Clock}
              color="border-purple-300"
              isLoading={false}
            />
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border-4 border-primary-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none font-semibold"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) =>
                setSelectedDifficulty(e.target.value as FilterDifficulty)
              }
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none font-semibold bg-white"
            >
              <option value="All">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as FilterType)}
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none font-semibold bg-white"
            >
              <option value="All">All Types</option>
              <option value="Comparison">Multiple Choice</option>
              <option value="SelectChoice">True/False</option>
              <option value="Short Answer">Short Answer</option>
              <option value="FillInTheBlank">Fill in the Blank</option>
            </select>

            {/* Approval Filter */}
            <select
              value={selectedApproval}
              onChange={(e) =>
                setSelectedApproval(e.target.value as FilterApproval)
              }
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none font-semibold bg-white"
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </motion.div>

        {/* Questions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {filteredQuestions.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border-4 border-gray-200">
              <div className="text-8xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                {searchTerm ||
                selectedDifficulty !== "All" ||
                selectedType !== "All" ||
                selectedApproval !== "All"
                  ? "No questions match your filters"
                  : "No questions yet"}
              </h2>
              <p className="text-gray-500 mb-6">
                {searchTerm ||
                selectedDifficulty !== "All" ||
                selectedType !== "All" ||
                selectedApproval !== "All"
                  ? "Try adjusting your search criteria"
                  : "Start by adding your first question to this game"}
              </p>
              <button
                onClick={handleAddQuestion}
                className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300"
                type="button"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add First Question
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {filteredQuestions.map((question: QuestionDataI) => (
                <QuestionCard
                  key={question.Id}
                  question={question}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                  onToggleApproval={handleToggleApproval}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Add/Edit Question Form Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingQuestion ? "Edit Question" : "Add New Question"}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    type="button"
                  >
                    <XCircle className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Placeholder for AddQuestionForm component */}
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">
                    Your AddQuestionForm component will be integrated here
                  </p>
                  <p className="text-sm mt-2">
                    Game ID:{" "}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {gameId}
                    </span>
                  </p>
                  {editingQuestion && (
                    <p className="text-sm mt-1">
                      Editing Question ID:{" "}
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {editingQuestion.Id}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={handleCloseForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-2xl font-bold shadow-lg transition-all duration-300"
                    type="button"
                  >
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameQuestionsPage;
