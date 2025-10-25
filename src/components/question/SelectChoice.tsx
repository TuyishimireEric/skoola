import { motion } from "framer-motion";
import {
  Plus,
  CheckCircle,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  List,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Upload,
  Camera,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";
import showToast from "@/utils/showToast";
import { uploadImage } from "@/server/actions";

interface SelectChoiceProps {
  mathQuestions: MathQuestionInput[];
  newEquation: string;
  setNewEquation: (value: string) => void;
  newExplanation: string;
  setNewExplanation: (value: string) => void;
  newDifficulty: DifficultyLevel;
  setNewDifficulty: (value: DifficultyLevel) => void;
  addMathQuestion: () => void;
  removeMathQuestion: (index: number) => void;
  editQuestion?: (index: number, question: MathQuestionInput) => void;
}

interface ChoiceQuestion {
  questionText: string;
  options: string[];
  correctAnswers: string[];
  allowMultiple: boolean;
  imageUrl?: string;
  imageDescription?: string;
}

export const SelectChoice: React.FC<SelectChoiceProps> = ({
  mathQuestions,
  newEquation,
  setNewEquation,
  newExplanation,
  setNewExplanation,
  newDifficulty,
  setNewDifficulty,
  addMathQuestion,
  removeMathQuestion,
  editQuestion,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MathQuestionInput>({
    equation: "",
    explanation: "",
    difficulty: "Easy",
  });

  // Question creation states
  const [questionMode, setQuestionMode] = useState<"multiple" | "truefalse">(
    "multiple"
  );
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [newOption, setNewOption] = useState("");

  // Image upload states
  const [imageUrl, setImageUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse question data from equation string
  const parseChoiceQuestion = (equation: string): ChoiceQuestion => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 2) {
        const questionText = parts[0] || "";
        const optionsStr = parts[1] || "";
        const correctAnswersStr = parts[2] || "";
        const allowMultipleStr = parts[3] || "false";
        const imageUrl = parts[4] || "";
        const imageDescription = parts[5] || "";

        const options = optionsStr ? JSON.parse(optionsStr) : [];
        const correctAnswers = correctAnswersStr
          ? JSON.parse(correctAnswersStr)
          : [];
        const allowMultiple = allowMultipleStr === "true";

        return { 
          questionText, 
          options, 
          correctAnswers, 
          allowMultiple,
          imageUrl,
          imageDescription
        };
      }
    } catch (error) {
      console.error("Error parsing choice question:", error);
    }

    return {
      questionText: "",
      options: [],
      correctAnswers: [],
      allowMultiple: false,
      imageUrl: "",
      imageDescription: "",
    };
  };

  // Create equation string from choice question data
  const createChoiceEquationString = (data: ChoiceQuestion): string => {
    const optionsStr = JSON.stringify(data.options);
    const correctAnswersStr = JSON.stringify(data.correctAnswers);
    const allowMultipleStr = data.allowMultiple.toString();

    return `${data.questionText}|${optionsStr}|${correctAnswersStr}|${allowMultipleStr}|${data.imageUrl || ""}|${data.imageDescription || ""}`;
  };

  // Generate current question data
  const getCurrentQuestionData = (): ChoiceQuestion => {
    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    return {
      questionText: questionText.trim(),
      options: filteredOptions,
      correctAnswers: correctAnswers,
      allowMultiple: allowMultiple,
      imageUrl: imageUrl.trim(),
      imageDescription: imageDescription.trim(),
    };
  };

  // Update parent equation when inputs change
  useEffect(() => {
    const questionData = getCurrentQuestionData();
    const equationString = createChoiceEquationString(questionData);

    if (equationString !== newEquation) {
      setNewEquation(equationString);
    }
  }, [questionText, options, correctAnswers, allowMultiple, imageUrl, imageDescription]);

  // Sync with parent state
  useEffect(() => {
    const currentData = parseChoiceQuestion(newEquation);
    if (currentData.questionText || currentData.options.length > 0) {
      setQuestionText(currentData.questionText);
      setOptions(
        currentData.options.length > 0 ? currentData.options : ["", ""]
      );
      setCorrectAnswers(currentData.correctAnswers);
      setAllowMultiple(currentData.allowMultiple);
      setImageUrl(currentData.imageUrl || "");
      setImageDescription(currentData.imageDescription || "");
    }
  }, [newEquation]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file (PNG, JPG, GIF, etc.)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadError("");

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await uploadImage(formData);

      if (result.success && result.image) {
        setImageUrl(result.image.secure_url);
        showToast("Image uploaded successfully", "success");
      }

      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Clear image
  const clearImage = () => {
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Question mode configurations
  const questionModes = [
    {
      id: "multiple" as const,
      title: "Multiple Choice",
      description: "Create questions with custom options",
      icon: "📝",
      example: "What is 2+2? A) 3 B) 4 C) 5",
    },
    {
      id: "truefalse" as const,
      title: "True or False",
      description: "Create true/false questions",
      icon: "✅",
      example: "The earth is round. True/False",
    },
  ];

  const difficultyColors = {
    Easy: "from-green-400 to-green-600",
    Medium: "from-yellow-400 to-orange-500",
    Hard: "from-red-400 to-red-600",
  };

  const difficultyBgColors = {
    Easy: "bg-green-50 border-green-200",
    Medium: "bg-yellow-50 border-yellow-200",
    Hard: "bg-red-50 border-red-200",
  };

  const difficultyTextColors = {
    Easy: "text-green-700",
    Medium: "text-yellow-700",
    Hard: "text-red-700",
  };

  // Validation
  const validateChoiceQuestion = (): boolean => {
    const data = getCurrentQuestionData();
    return (
      data.questionText.trim() !== "" &&
      data.options.length >= 2 &&
      data.correctAnswers.length > 0
    );
  };

  const isValidQuestion = validateChoiceQuestion();

  // Handle question mode change
  const handleModeChange = (mode: "multiple" | "truefalse") => {
    setQuestionMode(mode);
    if (mode === "truefalse") {
      setOptions(["True", "False"]);
      setCorrectAnswers([]);
      setAllowMultiple(false);
    } else {
      setOptions(["", ""]);
      setCorrectAnswers([]);
    }
  };

  // Add new option
  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    const optionToRemove = options[index];
    setOptions(options.filter((_, i) => i !== index));
    setCorrectAnswers(
      correctAnswers.filter((answer) => answer !== optionToRemove)
    );
  };

  // Update option
  const updateOption = (index: number, value: string) => {
    const oldValue = options[index];
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);

    // Update correct answers if this option was selected
    if (correctAnswers.includes(oldValue)) {
      const updatedCorrectAnswers = correctAnswers.map((answer) =>
        answer === oldValue ? value : answer
      );
      setCorrectAnswers(updatedCorrectAnswers);
    }
  };

  // Toggle correct answer
  const toggleCorrectAnswer = (option: string) => {
    if (allowMultiple) {
      if (correctAnswers.includes(option)) {
        setCorrectAnswers(correctAnswers.filter((answer) => answer !== option));
      } else {
        setCorrectAnswers([...correctAnswers, option]);
      }
    } else {
      setCorrectAnswers([option]);
    }
  };

  // Handle add question
  const handleAddQuestion = () => {
    if (isValidQuestion) {
      addMathQuestion();
      clearAllInputs();
    }
  };

  const clearAllInputs = () => {
    setQuestionText("");
    setOptions(questionMode === "truefalse" ? ["True", "False"] : ["", ""]);
    setCorrectAnswers([]);
    setNewOption("");
    setAllowMultiple(false);
    setImageUrl("");
    setImageDescription("");
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Editing functions
  const startEditing = (index: number, question: MathQuestionInput) => {
    setEditingIndex(index);
    setEditForm({ ...question });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditForm({ equation: "", explanation: "", difficulty: "Easy" });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editQuestion) {
      const editData = parseChoiceQuestion(editForm.equation);
      const isValidEdit =
        editData.questionText.trim() !== "" &&
        editData.options.length >= 2 &&
        editData.correctAnswers.length > 0;

      if (isValidEdit) {
        editQuestion(editingIndex, editForm);
        cancelEditing();
      }
    }
  };

  // Stats
  const getStats = () => {
    const stats = {
      Easy: mathQuestions.filter((q) => q.difficulty === "Easy").length,
      Medium: mathQuestions.filter((q) => q.difficulty === "Medium").length,
      Hard: mathQuestions.filter((q) => q.difficulty === "Hard").length,
      total: mathQuestions.length,
    };
    return stats;
  };

  const stats = getStats();

  // Group questions by difficulty
  const groupedQuestions = mathQuestions.reduce((acc, question, index) => {
    if (!acc[question.difficulty]) {
      acc[question.difficulty] = [];
    }
    acc[question.difficulty].push({ ...question, originalIndex: index });
    return acc;
  }, {} as Record<DifficultyLevel, Array<MathQuestionInput & { originalIndex: number }>>);

  // Edit form helpers
  const editData = parseChoiceQuestion(editForm.equation);
  const updateEditEquation = (
    questionText: string,
    options: string[],
    correctAnswers: string[],
    allowMultiple: boolean,
    imageUrl?: string,
    imageDescription?: string
  ) => {
    const data: ChoiceQuestion = {
      questionText,
      options,
      correctAnswers,
      allowMultiple,
      imageUrl,
      imageDescription,
    };
    const equationString = createChoiceEquationString(data);
    setEditForm({ ...editForm, equation: equationString });
  };
  const isValidEditQuestion =
    editData.questionText.trim() !== "" &&
    editData.options.length >= 2 &&
    editData.correctAnswers.length > 0;

  return (
    <>
      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Choice Questions Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by creating your first multiple choice or true/false question!
          </p>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-indigo-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <List className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Choice Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Mode Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-3 border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <HelpCircle className="text-blue-600" size={16} />
                Choose Question Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questionModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleModeChange(mode.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      questionMode === mode.id
                        ? "bg-blue-100 border-blue-400 text-blue-800"
                        : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="font-bold text-sm mb-1">{mode.title}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      {mode.description}
                    </div>
                    <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {mode.example}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Optional Image Upload Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-3 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📸 Add Image <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h3>

              {!imageUrl && !previewUrl && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Camera className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <p className="text-md font-semibold text-gray-700 mb-1">
                          Click to upload an image
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 5MB (Optional)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {previewUrl && !imageUrl && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-purple-300">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Image
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearImage}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              )}

              {imageUrl && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-green-300">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check size={18} />
                      <span className="font-semibold">
                        Image uploaded successfully!
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearImage}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={18} />
                    <span className="font-semibold">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* Image Description */}
              {imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image Description <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="Describe what's shown in the image to provide context..."
                    rows={2}
                    className="w-full p-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-sm resize-none"
                  />
                </div>
              )}
            </div>

            {/* Question Text Input */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-3 border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                ❓ Question Text
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Write Your Question *
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={
                    questionMode === "truefalse"
                      ? "e.g., The Earth revolves around the Sun."
                      : "e.g., What is the capital of France?"
                  }
                  rows={3}
                  className="w-full p-4 rounded-xl border-2 border-green-300 focus:border-green-500 focus:outline-none text-lg resize-none"
                />
                <p className="text-gray-500 text-sm mt-2">
                  Make your question clear and easy to understand
                </p>
              </div>
              {questionText && (
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-green-300">
                    <span className="text-sm text-gray-600 block mb-2">
                      Preview:
                    </span>
                    <span className="text-lg font-semibold text-gray-800">
                      {questionText}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Options Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-3 border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📋 Answer Options
              </h3>

              {questionMode === "multiple" && (
                <>
                  {/* Multiple Answer Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAllowMultiple(!allowMultiple)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                          allowMultiple
                            ? "bg-orange-100 border-orange-400 text-orange-800"
                            : "bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        {allowMultiple ? (
                          <ToggleRight size={20} />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                        <span className="font-semibold text-sm">
                          {allowMultiple
                            ? "Multiple Answers Allowed"
                            : "Single Answer Only"}
                        </span>
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {allowMultiple
                        ? "Students can select multiple correct answers"
                        : "Students can only select one correct answer"}
                    </p>
                  </div>

                  {/* Add New Option */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Type a new option..."
                        className="flex-1 p-3 rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:outline-none"
                        onKeyPress={(e) => e.key === "Enter" && addOption()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addOption}
                        disabled={!newOption.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                      </motion.button>
                    </div>
                  </div>
                </>
              )}

              {/* Options List */}
              <div className="space-y-3">
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-bold text-gray-600 min-w-[24px]">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {questionMode === "multiple" ? (
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          placeholder={`Option ${String.fromCharCode(
                            65 + index
                          )}`}
                        />
                      ) : (
                        <span className="flex-1 p-2 font-semibold text-gray-700">
                          {option}
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleCorrectAnswer(option)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        correctAnswers.includes(option)
                          ? "bg-green-100 text-green-600 border-2 border-green-300"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-300 hover:bg-gray-200"
                      }`}
                      title={
                        correctAnswers.includes(option)
                          ? "Correct Answer"
                          : "Mark as Correct"
                      }
                    >
                      <CheckCircle size={20} />
                    </motion.button>

                    {questionMode === "multiple" && options.length > 2 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeOption(index)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300"
                        title="Remove Option"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Selected Answers Preview */}
              {correctAnswers.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Correct Answer{correctAnswers.length > 1 ? "s" : ""}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {correctAnswers.map((answer, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {answer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Difficulty Level *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map(
                  (level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setNewDifficulty(level)}
                      className={`px-4 py-3 rounded-2xl font-bold transition-all duration-300 text-sm ${
                        newDifficulty === level
                          ? `bg-gradient-to-r ${difficultyColors[level]} text-white shadow-lg`
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {level}
                    </motion.button>
                  )
                )}
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Easy: Simple facts, Medium: Moderate thinking, Hard: Complex
                reasoning
              </p>
            </div>

            {/* Explanation Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Explanation{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Explain why this is the correct answer..."
                rows={4}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the reasoning behind the answer
              </p>
            </div>

            {/* Question Preview with Image */}
            {(questionText.trim() || imageUrl) && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3">
                  👁️ Question Preview:
                </h4>
                <div className="bg-white p-4 rounded-lg border border-blue-300">
                  {imageUrl && (
                    <div className="mb-3">
                      <img
                        src={imageUrl}
                        alt="Question"
                        className="w-full max-w-sm h-32 object-contain rounded-lg border-2 border-gray-200"
                      />
                      {imageDescription && (
                        <p className="text-gray-600 text-sm mt-2 italic">
                          {imageDescription}
                        </p>
                      )}
                    </div>
                  )}
                  {questionText && (
                    <div className="mb-3">
                      <span className="text-lg font-semibold text-gray-800">
                        {questionText}
                      </span>
                    </div>
                  )}
                  {options.filter(opt => opt.trim()).length > 0 && (
                    <div className="space-y-2">
                      {options
                        .filter((opt) => opt.trim())
                        .map((option, index) => (
                          <div key={index} className={`flex items-center gap-2 p-2 rounded ${
                            correctAnswers.includes(option)
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}>
                            <span className="font-bold text-gray-600 min-w-[20px]">
                              {String.fromCharCode(65 + index)})
                            </span>
                            <span className="text-gray-700">{option}</span>
                            {correctAnswers.includes(option) && (
                              <CheckCircle size={16} className="text-green-600 ml-auto" />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation Message */}
            {(questionText.trim() || options.some((opt) => opt.trim())) &&
              !isValidQuestion && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      Please complete the question text, options, and select at
                      least one correct answer
                    </span>
                  </div>
                </div>
              )}

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: isValidQuestion ? 1.05 : 1 }}
              whileTap={{ scale: isValidQuestion ? 0.95 : 1 }}
              onClick={handleAddQuestion}
              disabled={!isValidQuestion}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                isValidQuestion
                  ? "bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={24} />
              Add Choice Question
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-indigo-50 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="text-primary-600" size={20} />
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>

              <div className="space-y-2">
                {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map(
                  (level) => (
                    <div
                      key={level}
                      className={`p-3 rounded-xl border-2 ${difficultyBgColors[level]}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${difficultyTextColors[level]}`}
                        >
                          {level}
                        </span>
                        <span
                          className={`font-bold ${difficultyTextColors[level]}`}
                        >
                          {stats[level]}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mt-4">
                <h4 className="font-bold text-blue-800 mb-2 text-sm">
                  💡 Tips
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • <strong>Clear questions:</strong> Be specific
                  </li>
                  <li>
                    • <strong>Good options:</strong> Make them believable
                  </li>
                  <li>
                    • <strong>Multiple answers:</strong> Use the toggle
                  </li>
                  <li>
                    • <strong>Images:</strong> Optional but helpful for context
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Display Section */}
      {mathQuestions.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Created Choice Questions ({mathQuestions.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Organized by difficulty</span>
            </div>
          </div>

          {/* Questions by Difficulty */}
          <div className="space-y-6">
            {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map(
              (difficulty) => {
                const questionsForDifficulty =
                  groupedQuestions[difficulty] || [];

                if (questionsForDifficulty.length === 0) return null;

                return (
                  <motion.div
                    key={difficulty}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`px-4 py-2 rounded-full bg-gradient-to-r ${difficultyColors[difficulty]} text-white font-bold text-sm flex items-center gap-2`}
                      >
                        <Target size={16} />
                        {difficulty} ({questionsForDifficulty.length})
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                      {questionsForDifficulty.map((question) => {
                        const choiceData = parseChoiceQuestion(
                          question.equation
                        );

                        return (
                          <motion.div
                            key={question.originalIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{
                              scale:
                                editingIndex !== question.originalIndex
                                  ? 1.02
                                  : 1,
                            }}
                            className={`bg-white p-6 rounded-2xl border-3 shadow-lg hover:shadow-xl transition-all duration-300 ${
                              difficultyBgColors[difficulty]
                            } ${
                              editingIndex === question.originalIndex
                                ? "ring-4 ring-blue-300"
                                : ""
                            }`}
                          >
                            {editingIndex === question.originalIndex ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-gray-800">
                                    Edit Choice Question
                                  </h4>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={saveEdit}
                                      disabled={!isValidEditQuestion}
                                      className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Check size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={cancelEditing}
                                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-all duration-300"
                                    >
                                      <X size={16} />
                                    </motion.button>
                                  </div>
                                </div>

                                {/* Edit Image URL */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Image URL (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.imageUrl || ""}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        editData.questionText,
                                        editData.options,
                                        editData.correctAnswers,
                                        editData.allowMultiple,
                                        e.target.value,
                                        editData.imageDescription
                                      )
                                    }
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300"
                                    placeholder="Enter image URL (optional)..."
                                  />
                                  {editData.imageUrl && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <img
                                        src={editData.imageUrl}
                                        alt="Edit preview"
                                        className="w-32 h-24 object-contain rounded border"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Edit Image Description */}
                                {editData.imageUrl && (
                                  <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                      Image Description (Optional)
                                    </label>
                                    <textarea
                                      value={editData.imageDescription || ""}
                                      onChange={(e) =>
                                        updateEditEquation(
                                          editData.questionText,
                                          editData.options,
                                          editData.correctAnswers,
                                          editData.allowMultiple,
                                          editData.imageUrl,
                                          e.target.value
                                        )
                                      }
                                      rows={2}
                                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                                      placeholder="Enter image description..."
                                    />
                                  </div>
                                )}

                                {/* Edit Question Text */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Question Text
                                  </label>
                                  <textarea
                                    value={editData.questionText}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        e.target.value,
                                        editData.options,
                                        editData.correctAnswers,
                                        editData.allowMultiple,
                                        editData.imageUrl,
                                        editData.imageDescription
                                      )
                                    }
                                    rows={2}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Enter question text..."
                                  />
                                </div>

                                {/* Edit Options */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Options & Correct Answers
                                  </label>
                                  <div className="space-y-2">
                                    {editData.options.map(
                                      (option, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className="flex items-center gap-2"
                                        >
                                          <span className="font-bold text-gray-600 min-w-[24px]">
                                            {String.fromCharCode(65 + optIndex)}
                                            )
                                          </span>
                                          <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                              const newOptions = [
                                                ...editData.options,
                                              ];
                                              newOptions[optIndex] =
                                                e.target.value;
                                              updateEditEquation(
                                                editData.questionText,
                                                newOptions,
                                                editData.correctAnswers,
                                                editData.allowMultiple,
                                                editData.imageUrl,
                                                editData.imageDescription
                                              );
                                            }}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                          />
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                              const newCorrectAnswers =
                                                editData.correctAnswers.includes(
                                                  option
                                                )
                                                  ? editData.correctAnswers.filter(
                                                      (ans) => ans !== option
                                                    )
                                                  : editData.allowMultiple
                                                  ? [
                                                      ...editData.correctAnswers,
                                                      option,
                                                    ]
                                                  : [option];
                                              updateEditEquation(
                                                editData.questionText,
                                                editData.options,
                                                newCorrectAnswers,
                                                editData.allowMultiple,
                                                editData.imageUrl,
                                                editData.imageDescription
                                              );
                                            }}
                                            className={`p-2 rounded-lg transition-all duration-300 ${
                                              editData.correctAnswers.includes(
                                                option
                                              )
                                                ? "bg-green-100 text-green-600 border-2 border-green-300"
                                                : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                                            }`}
                                          >
                                            <CheckCircle size={16} />
                                          </motion.button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Edit Difficulty */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Difficulty
                                  </label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {(
                                      [
                                        "Easy",
                                        "Medium",
                                        "Hard",
                                      ] as DifficultyLevel[]
                                    ).map((level) => (
                                      <button
                                        key={level}
                                        onClick={() =>
                                          setEditForm({
                                            ...editForm,
                                            difficulty: level,
                                          })
                                        }
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                                          editForm.difficulty === level
                                            ? `bg-gradient-to-r ${difficultyColors[level]} text-white`
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                      >
                                        {level}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Edit Explanation */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Explanation
                                  </label>
                                  <textarea
                                    value={editForm.explanation}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        explanation: e.target.value,
                                      })
                                    }
                                    rows={3}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Optional explanation..."
                                  />
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {/* Question Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 mb-3">
                                        {/* Image Display */}
                                        {choiceData.imageUrl && (
                                          <div className="mb-3">
                                            <img
                                              src={choiceData.imageUrl}
                                              alt="Question Image"
                                              className="w-full max-w-sm h-32 object-contain rounded-lg border-2 border-gray-200"
                                              onError={(e) => {
                                                e.currentTarget.src =
                                                  "/api/placeholder/200/128";
                                                e.currentTarget.alt =
                                                  "Image not available";
                                              }}
                                            />
                                            {choiceData.imageDescription && (
                                              <p className="text-gray-600 text-sm mt-2 italic">
                                                {choiceData.imageDescription}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                        
                                        <div className="text-left">
                                          <span className="text-sm text-gray-600 block mb-2">
                                            ❓ Question:
                                          </span>
                                          <span className="text-lg font-semibold text-gray-800">
                                            {choiceData.questionText}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Options Display */}
                                      <div className="space-y-2 mb-3">
                                        {choiceData.options.map(
                                          (option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                                                choiceData.correctAnswers.includes(
                                                  option
                                                )
                                                  ? "bg-green-50 border-green-300 text-green-800"
                                                  : "bg-gray-50 border-gray-200 text-gray-700"
                                              }`}
                                            >
                                              <span className="font-bold min-w-[24px]">
                                                {String.fromCharCode(
                                                  65 + optIndex
                                                )}
                                                )
                                              </span>
                                              <span className="flex-1">
                                                {option}
                                              </span>
                                              {choiceData.correctAnswers.includes(
                                                option
                                              ) && (
                                                <CheckCircle
                                                  size={16}
                                                  className="text-green-600"
                                                />
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>

                                      {/* Answer Summary */}
                                      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-xl border-2 border-green-200">
                                        <span className="text-sm text-gray-600 block mb-1">
                                          ✅ Correct Answer
                                          {choiceData.correctAnswers.length > 1
                                            ? "s"
                                            : ""}
                                          :
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {choiceData.correctAnswers.map(
                                            (answer, ansIndex) => (
                                              <span
                                                key={ansIndex}
                                                className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold"
                                              >
                                                {answer}
                                              </span>
                                            )
                                          )}
                                        </div>
                                        {choiceData.allowMultiple && (
                                          <span className="text-xs text-green-600 mt-1 block">
                                            (Multiple answers allowed)
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div
                                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyBgColors[difficulty]} ${difficultyTextColors[difficulty]}`}
                                    >
                                      {question.difficulty}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        startEditing(
                                          question.originalIndex,
                                          question
                                        )
                                      }
                                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-all duration-300"
                                      title="Edit question"
                                    >
                                      <Edit3 size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        removeMathQuestion(
                                          question.originalIndex
                                        )
                                      }
                                      className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300"
                                      title="Delete question"
                                    >
                                      <Trash2 size={16} />
                                    </motion.button>
                                  </div>
                                </div>

                                {question.explanation && (
                                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                                    <div className="flex items-start gap-2">
                                      <div className="text-yellow-500 mt-0.5">
                                        💡
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                          Explanation:
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                          {question.explanation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Edit hint overlay */}
                                <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
                                  Click edit button to modify this question
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        </div>
      )}
    </>
  );
};