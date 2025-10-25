import { GameDataI } from "@/types/Course";
import { QuestionType } from "@/types/Questions";
import { motion } from "framer-motion";
import { BookOpen, Target } from "lucide-react";

interface QuestionDetailsStepProps {
  questionDetails: {
    QuestionType: QuestionType;
    Tags: string;
  };
  setQuestionDetails: React.Dispatch<
    React.SetStateAction<{
      QuestionType: QuestionType;
      Tags: string;
    }>
  >;
  game: GameDataI;
}

const QuestionDetailsStep: React.FC<QuestionDetailsStepProps> = ({
  questionDetails,
  setQuestionDetails,
  game,
}) => {
  const questionTypes: {
    value: QuestionType;
    label: string;
    description: string;
    emoji: string;
  }[] = [
    {
      value: "MissingNumber",
      label: "Missing Number",
      description: "Create mathematical equations with solutions",
      emoji: "🧮",
    },
    {
      value: "Comparison",
      label: "Comparison Statements",
      description: "Create statements comparing numbers or expressions",
      emoji: "⚖️",
    },
    {
      value: "NumberSequence",
      label: "Number Sequences",
      description: "Generate sequences of numbers with patterns",
      emoji: "🔢",
    },
    {
      value: "MathEquation",
      label: "Math Equations",
      description: "Create complex mathematical equations",
      emoji: "➗",
    },
    {
      value: "Fraction",
      label: "Fraction Questions",
      description: "Questions involving fractions and their operations",
      emoji: "➗",
    },
    {
      value: "SelectChoice",
      label: "Select Choice",
      description: "Questions with multiple choice answers",
      emoji: "📋",
    },
    {
      value: "WordProblems",
      label: "Word Problems",
      description: "Create real-world math problems in text form",
      emoji: "📝",
    },
    {
      value: "ImageBased",
      label: "Image Based Questions",
      description: "Questions that involve images or diagrams",
      emoji: "🖼️",
    },
    {
      value: "FillInTheBlank",
      label: "Fill in the Blank",
      description: "Questions where users fill in missing words or numbers",
      emoji: "✏️",
    },
    // {
    //   value: "Reading",
    //   label: "Reading Comprehension",
    //   description: "Questions based on reading passages",
    //   emoji: "📖",
    // },
    {
      value: "SentenceSorting",
      label: "Sentence Sorting",
      description: "Questions where users sort sentences in order",
      emoji: "🔤",
    },
  ];

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <BookOpen className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Question Details</h2>
        </div>

        {/* Game Info Display */}
        <div className="bg-gradient-to-r from-primary-50 to-orange-50 p-6 rounded-2xl mb-6">
          <h3 className="font-bold text-gray-800 mb-2">
            Creating questions for:
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={game.ImageUrl}
              alt={game.Title}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white"
            />
            <div>
              <h4 className="font-bold text-lg text-primary-600">
                {game.Title}
              </h4>
              <p className="text-gray-600">{game.Subject}</p>
            </div>
          </div>
        </div>

        {/* Question Type Selection */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <Target className="text-primary-600" size={20} />
            Question Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questionTypes.map((type) => (
              <motion.div
                key={type.value}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-2xl border-4 cursor-pointer transition-all duration-300 ${
                  questionDetails.QuestionType === type.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white hover:border-primary-300"
                }`}
                onClick={() =>
                  setQuestionDetails((prev) => ({
                    ...prev,
                    QuestionType: type.value,
                  }))
                }
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{type.emoji}</span>
                  <div>
                    <h4 className="font-bold text-gray-800">{type.label}</h4>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>
                  {questionDetails.QuestionType === type.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-primary-500 text-white p-2 rounded-full"
                    >
                      <Target size={16} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionDetailsStep;
