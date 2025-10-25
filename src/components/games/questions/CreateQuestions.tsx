import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Eye,
  Save,
  Calculator,
  ChevronRight,
  Home,
  Gamepad2,
  MessageCircle,
  Plus,
} from "lucide-react";
import { useGameById } from "@/hooks/games/useGames";
import { useCreateQuestion } from "@/hooks/questions/useCreateQuestion";
import QuestionDetailsStep from "@/components/question/QuestionDetailsStep";
import AddQuestionsStep from "@/components/question/AddQuestionStep";
import PreviewStep from "@/components/question/PreviewStep";
import {
  DifficultyLevel,
  MathQuestionInput,
  QuestionDataI,
  QuestionType,
} from "@/types/Questions";
import AfricanLoader from "@/components/loader/AfricanLoader";
import { GameDataI } from "@/types/Course";

const Breadcrumb = ({
  game,
  handleBack,
}: {
  game: GameDataI | undefined;
  handleBack: () => void;
}) => {
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
      onClick: handleBack,
    },
    {
      label: "Add",
      icon: Plus,
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

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface CreateQuestionsProps {
  setIsAddingQuestions: (value: boolean) => void;
}

const CreateQuestionsPage = ({
  setIsAddingQuestions,
}: CreateQuestionsProps) => {
  const params = useParams();
  const gameId = params?.id as string;

  const { data: game, isLoading: gameLoading } = useGameById(gameId);
  const { onSubmit, isPending, onSuccess } = useCreateQuestion();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [questionDetails, setQuestionDetails] = useState({
    QuestionType: "MissingNumber" as QuestionType,
    Tags: "",
  });
  const [mathQuestions, setMathQuestions] = useState<MathQuestionInput[]>([]);
  const [newEquation, setNewEquation] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>("Easy");

  const steps = [
    { number: 1, title: "Question Details", icon: BookOpen },
    { number: 2, title: "Add Questions", icon: Calculator },
    { number: 3, title: "Preview & Save", icon: Eye },
  ];

  const handleBack = () => {
    setIsAddingQuestions(false);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const addMathQuestion = () => {
    if (newEquation.trim()) {
      setMathQuestions([
        ...mathQuestions,
        {
          equation: newEquation.trim(),
          explanation: newExplanation.trim(),
          difficulty: newDifficulty,
        },
      ]);
      setNewEquation("");
      setNewExplanation("");
      setNewDifficulty("Easy");
    }
  };

  const removeMathQuestion = (index: number) => {
    setMathQuestions(mathQuestions.filter((_, i) => i !== index));
  };

  // New function to handle editing questions
  const editMathQuestion = (
    index: number,
    updatedQuestion: MathQuestionInput
  ) => {
    const updatedQuestions = [...mathQuestions];
    updatedQuestions[index] = updatedQuestion;
    setMathQuestions(updatedQuestions);
  };

  const generateQuestionsArray = (): QuestionDataI[] => {
    return mathQuestions.map((mathQ) => ({
      QuestionText: mathQ.equation,
      QuestionType: questionDetails.QuestionType,
      MediaType: "text",
      MediaUrl: "",
      Options: "",
      CorrectAnswer: mathQ.equation,
      Explanation: mathQ.explanation,
      Difficulty: mathQ.difficulty.toLowerCase(),
      Language: "en",
      GameId: gameId,
    }));
  };

  const handleSaveQuestions = async () => {
    const questionsData = generateQuestionsArray();
    await onSubmit(questionsData);
    onSuccess?.();
    setMathQuestions([]);
    setCurrentStep(1);
  };

  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 1:
        return questionDetails.QuestionType;
      case 2:
        return mathQuestions.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, questionDetails, mathQuestions]);

  // Loading state
  if (gameLoading) {
    return (
      <AfricanLoader
        Title="Loading Game Details! 🎮"
        Description="Preparing your question creation workspace... 🌟"
      />
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border-4 border-red-300 max-w-md">
          <div className="text-8xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4 font-comic">
            Game Not Found
          </h1>
          <p className="text-gray-700 mb-6 font-comic">
            We couldn&apos;t find this game to create questions for.
          </p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg"
          >
            🏠 Back to Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-comic">
      {/* Decorative African Elements */}
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
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-20 left-20 text-7xl opacity-20"
        >
          🌍
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-40 left-40 text-6xl opacity-20"
        >
          🦁
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="relative z-20  pb-12 px-4 w-full pt-7 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <Breadcrumb game={game} handleBack={handleBack} />
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-primary-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    <step.icon size={20} />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`font-bold ${
                        currentStep >= step.number
                          ? "text-primary-600"
                          : "text-gray-500"
                      }`}
                    >
                      Step {step.number}
                    </p>
                    <p className="text-sm text-gray-600">{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-4 rounded transition-all duration-300 ${
                        currentStep > step.number
                          ? "bg-primary-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <QuestionDetailsStep
              questionDetails={questionDetails}
              setQuestionDetails={setQuestionDetails}
              game={game}
            />
          )}
          {currentStep === 2 && (
            <AddQuestionsStep
              questionType={questionDetails.QuestionType}
              mathQuestions={mathQuestions}
              newEquation={newEquation}
              setNewEquation={setNewEquation}
              newExplanation={newExplanation}
              setNewExplanation={setNewExplanation}
              newDifficulty={newDifficulty}
              setNewDifficulty={setNewDifficulty}
              addMathQuestion={addMathQuestion}
              removeMathQuestion={removeMathQuestion}
              editQuestion={editMathQuestion}
            />
          )}
          {currentStep === 3 && (
            <PreviewStep questionsData={generateQuestionsArray()} game={game} />
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
              currentStep === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg"
            }`}
          >
            Previous
          </motion.button>

          {currentStep === 3 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveQuestions}
              disabled={isPending || mathQuestions.length === 0}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isPending ? "Saving..." : "Save Questions"}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextStep}
              disabled={!canProceedToNext}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                canProceedToNext
                  ? "bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </motion.button>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CreateQuestionsPage;
