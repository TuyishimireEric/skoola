import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Target,
  MessageCircle,
  Eye,
  EyeOff,
  BookOpen,
  Image as ImageIcon,
  Video,
  Volume2,
  FileText,
  AlertCircle,
  LucideIcon,
  GitCompare,
  Equal,
  ImagePlay,
  SpeakerIcon,
} from "lucide-react";
import Image from "next/image";
import {
  FillInTheBlankData,
  isDifficultyLevel,
  isMediaType,
  isQuestionType,
  MediaType,
  QuestionDataI,
  QuestionType,
} from "@/types/Questions";

const difficultyColors: Record<string, string> = {
  easy: "from-green-400 to-green-600",
  Easy: "from-green-400 to-green-600",
  medium: "from-yellow-400 to-orange-500",
  Medium: "from-yellow-400 to-orange-500",
  hard: "from-red-400 to-red-600",
  Hard: "from-red-400 to-red-600",
};

interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctAnswers: string[];
  blanksCount: number;
  isFillInBlank: boolean;
}

const questionTypeIcons: Record<QuestionType, LucideIcon> = {
  MissingNumber: CheckCircle,
  Comparison: GitCompare,
  NumberSequence: Target,
  MathEquation: Equal,
  ImageBased: ImagePlay,
  Fraction: BookOpen,
  SelectChoice: MessageCircle,
  WordProblems: FileText,
  FillInTheBlank: Target,
  SentenceSorting: Target,
  Reading: SpeakerIcon,
};

const mediaTypeIcons: Record<MediaType, LucideIcon> = {
  Image: ImageIcon,
  Video: Video,
  Audio: Volume2,
  Text: FileText,
  text: FileText,
  None: FileText,
};

// Question Card Component
interface QuestionCardProps {
  question: QuestionDataI;
  onEdit: (question: QuestionDataI) => void;
  onDelete: (questionId: string) => void;
  onToggleApproval: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  onToggleApproval,
}) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const questionType = isQuestionType(question.QuestionType)
    ? question.QuestionType
    : "SelectChoice";

  const mediaType = isMediaType(question.MediaType)
    ? question.MediaType
    : "None";

  const difficulty = isDifficultyLevel(question.Difficulty)
    ? question.Difficulty
    : "medium";

  const QuestionTypeIcon = questionTypeIcons[questionType];
  const MediaTypeIcon = mediaTypeIcons[mediaType];
  const difficultyColor =
    difficultyColors[difficulty] || "from-gray-400 to-gray-500";

  // Parse FillInTheBlank questions or use regular options
  const parsedQuestion = useMemo((): ParsedQuestion => {
    if (questionType === "FillInTheBlank") {
      try {
        const parsed: FillInTheBlankData = JSON.parse(question.QuestionText);
        return {
          questionText: parsed.question,
          options: parsed.options || [],
          correctAnswers: parsed.correctAnswers || [],
          blanksCount: parsed.blanksCount || 1,
          isFillInBlank: true,
        };
      } catch (error) {
        console.error("Error parsing FillInTheBlank question:", error);
        return {
          questionText: question.QuestionText,
          options: [],
          correctAnswers: [],
          blanksCount: 1,
          isFillInBlank: false,
        };
      }
    }

    return {
      questionText: question.QuestionText,
      options: question.Options ? question.Options.split(",") : [],
      correctAnswers: question.CorrectAnswer ? [question.CorrectAnswer] : [],
      blanksCount: 0,
      isFillInBlank: false,
    };
  }, [question, questionType]);

  const options = parsedQuestion.options;

  const handleDelete = (): void => {
    if (question.Id) {
      onDelete(question.Id);
    }
  };

  const handleToggleApproval = (): void => {
    if (question.Id) {
      onToggleApproval(question.Id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-primary-200 overflow-hidden"
    >
      {/* Question Header */}
      <div className="bg-gradient-to-r from-primary-100 to-orange-100 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 p-2 rounded-xl">
              <QuestionTypeIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-primary-700">
                  {questionType === "FillInTheBlank"
                    ? "Fill in the Blank"
                    : questionType}
                </span>
                {mediaType !== "None" && mediaType !== "text" && (
                  <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                    <MediaTypeIcon className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">
                      {mediaType}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`bg-gradient-to-r ${difficultyColor} text-white px-3 py-1 rounded-full text-xs font-bold capitalize`}
                >
                  {difficulty.toLowerCase()}
                </span>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full uppercase">
                  {question.Language}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleApproval}
              className={`p-2 rounded-xl transition-colors ${
                question.IsApproved
                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
              title={question.IsApproved ? "Approved" : "Not Approved"}
              type="button"
            >
              {question.IsApproved ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onEdit(question)}
              className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
              title="Edit Question"
              type="button"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
              title="Delete Question"
              type="button"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        {/* Media Content */}
        {question.MediaUrl && mediaType !== "None" && mediaType !== "text" && (
          <div className="mb-4">
            {mediaType === "Image" && (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                <Image
                  src={question.MediaUrl}
                  alt="Question media"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {mediaType === "Video" && (
              <video
                src={question.MediaUrl}
                controls
                className="w-full h-48 rounded-2xl"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {mediaType === "Audio" && (
              <audio src={question.MediaUrl} controls className="w-full">
                Your browser does not support the audio tag.
              </audio>
            )}
          </div>
        )}

        {/* Question Text */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 leading-relaxed">
            {parsedQuestion.isFillInBlank ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    Fill in the blank{parsedQuestion.blanksCount > 1 ? "s" : ""}
                    :
                  </span>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <p className="text-gray-800 font-medium">
                    {parsedQuestion.questionText
                      .split("___")
                      .map((part: string, index: number, array: string[]) => (
                        <span key={index}>
                          {part}
                          {index < array.length - 1 && (
                            <span className="inline-block bg-blue-200 text-blue-800 px-3 py-1 mx-1 rounded-lg font-bold">
                              ___
                            </span>
                          )}
                        </span>
                      ))}
                  </p>
                </div>
              </div>
            ) : (
              parsedQuestion.questionText
            )}
          </h3>
        </div>

        {/* Options */}
        {options.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {parsedQuestion.isFillInBlank
                ? "Choose the correct option:"
                : "Options:"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {options.map((option: string, index: number) => {
                const isCorrect = parsedQuestion.correctAnswers.includes(
                  option.trim()
                );
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      isCorrect
                        ? "bg-green-50 border-green-300 text-green-800 shadow-md"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          isCorrect
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{option.trim()}</span>
                      {isCorrect && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Answer Section */}
        {(question.CorrectAnswer ||
          parsedQuestion.correctAnswers.length > 0) && (
          <div className="mb-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
              type="button"
            >
              {showAnswer ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </button>

            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">
                      Correct Answer
                      {parsedQuestion.correctAnswers.length > 1 ? "s" : ""}:
                    </span>
                  </div>
                  {parsedQuestion.isFillInBlank ? (
                    <div className="space-y-2">
                      {parsedQuestion.correctAnswers.map(
                        (answer: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-green-800 font-semibold bg-green-100 px-3 py-1 rounded-lg">
                              {answer}
                            </span>
                          </div>
                        )
                      )}
                      {parsedQuestion.blanksCount > 1 && (
                        <p className="text-xs text-green-600 mt-2">
                          This question has {parsedQuestion.blanksCount} blank
                          {parsedQuestion.blanksCount > 1 ? "s" : ""} to fill.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-800 font-semibold">
                      {question.CorrectAnswer}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Explanation Section */}
        {question.Explanation && (
          <div>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              type="button"
            >
              {showExplanation ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">
                      Explanation:
                    </span>
                  </div>
                  <p className="text-blue-800">{question.Explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
