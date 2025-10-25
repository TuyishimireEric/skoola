import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Trash2,
  Brain,
  AlertCircle,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  Image as ImageIcon,
  PlusCircle,
  MinusCircle,
  Upload,
  Camera,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";
import showToast from "@/utils/showToast";
import { uploadImage } from "@/server/actions";

interface ImageBasedProps {
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

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  unit: string;
}

interface ImageProblem {
  imageUrl: string;
  imageDescription: string;
  subQuestions: SubQuestion[];
}

export const ImageBased: React.FC<ImageBasedProps> = ({
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

  // Image problem creation states
  const [imageUrl, setImageUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { id: "1", question: "", answer: "", unit: "" },
  ]);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse image problem from equation string
  const parseImageProblem = (equation: string): ImageProblem => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 3) {
        const imageUrl = parts[0] || "";
        const imageDescription = parts[1] || "";
        const subQuestionsStr = parts[2] || "";

        const subQuestions = subQuestionsStr ? JSON.parse(subQuestionsStr) : [];

        return { imageUrl, imageDescription, subQuestions };
      }
    } catch (error) {
      console.error("Error parsing image problem:", error);
    }

    return {
      imageUrl: "",
      imageDescription: "",
      subQuestions: [],
    };
  };

  // Create equation string from image problem data
  const createImageProblemString = (data: ImageProblem): string => {
    const subQuestionsStr = JSON.stringify(data.subQuestions);
    return `${data.imageUrl}|${data.imageDescription}|${subQuestionsStr}`;
  };

  // Generate current problem data
  const getCurrentProblemData = (): ImageProblem => {
    const filteredSubQuestions = subQuestions.filter(
      (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
    );
    return {
      imageUrl: imageUrl.trim(),
      imageDescription: imageDescription.trim(),
      subQuestions: filteredSubQuestions,
    };
  };

  // Update parent equation when inputs change
  useEffect(() => {
    const problemData = getCurrentProblemData();
    const equationString = createImageProblemString(problemData);

    if (equationString !== newEquation) {
      setNewEquation(equationString);
    }
  }, [imageUrl, imageDescription, subQuestions]);

  // Sync with parent state
  useEffect(() => {
    const currentData = parseImageProblem(newEquation);
    if (
      currentData.imageUrl ||
      currentData.imageDescription ||
      currentData.subQuestions.length > 0
    ) {
      setImageUrl(currentData.imageUrl);
      setImageDescription(currentData.imageDescription);
      setSubQuestions(
        currentData.subQuestions.length > 0
          ? currentData.subQuestions
          : [{ id: "1", question: "", answer: "", unit: "" }]
      );
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
  const validateImageProblem = (): boolean => {
    const data = getCurrentProblemData();
    return (
      data.imageUrl.trim() !== "" &&
      data.subQuestions.length > 0 &&
      data.subQuestions.every(
        (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
      )
    );
  };

  const isValidProblem = validateImageProblem();

  // Sub-question management
  const addSubQuestion = () => {
    const newId = (subQuestions.length + 1).toString();
    setSubQuestions([
      ...subQuestions,
      {
        id: newId,
        question: "",
        answer: "",
        unit: "",
      },
    ]);
  };

  const removeSubQuestion = (id: string) => {
    if (subQuestions.length > 1) {
      setSubQuestions(subQuestions.filter((sq) => sq.id !== id));
    }
  };

  const updateSubQuestion = (
    id: string,
    field: keyof SubQuestion,
    value: string
  ) => {
    setSubQuestions(
      subQuestions.map((sq) => (sq.id === id ? { ...sq, [field]: value } : sq))
    );
  };

  // Get sub-question letter (a, b, c, etc.)
  const getSubQuestionLetter = (index: number): string => {
    return String.fromCharCode(97 + index); // 97 is 'a' in ASCII
  };

  // Handle add question
  const handleAddQuestion = () => {
    if (isValidProblem) {
      addMathQuestion();
      clearAllInputs();
    }
  };

  const clearAllInputs = () => {
    setImageUrl("");
    setImageDescription("");
    setSubQuestions([{ id: "1", question: "", answer: "", unit: "" }]);
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
      const editData = parseImageProblem(editForm.equation);
      const isValidEdit =
        editData.imageUrl.trim() !== "" &&
        editData.subQuestions.length > 0 &&
        editData.subQuestions.every(
          (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
        );

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
  const editData = parseImageProblem(editForm.equation);
  const updateEditEquation = (
    imageUrl: string,
    imageDescription: string,
    subQuestions: SubQuestion[]
  ) => {
    const data: ImageProblem = { imageUrl, imageDescription, subQuestions };
    const equationString = createImageProblemString(data);
    setEditForm({ ...editForm, equation: equationString });
  };
  const isValidEditProblem =
    editData.imageUrl.trim() !== "" &&
    editData.subQuestions.length > 0 &&
    editData.subQuestions.every(
      (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
    );

  return (
    <>
      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Image-Based Problems Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by creating your first image-based problem with visual
            learning!
          </p>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <ImageIcon className="text-blue-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Image-Based Problems
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Problem Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Upload Section */}
            <div className="bg-white p-6 rounded-2xl border-3 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📸 Upload Image
              </h3>

              {!imageUrl && !previewUrl && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
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
                      <div className="bg-purple-100 p-4 rounded-full">
                        <Camera className="text-purple-600" size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-1">
                          Click to upload an image
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 5MB
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
                      Replace
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
            </div>

            {/* Image Description Input */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-3 border-emerald-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📝 Image Description
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe what&apos;s in the image{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="e.g., A basket containing 15 apples and 8 oranges on a wooden table"
                  rows={3}
                  className="w-full p-4 rounded-xl border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none text-lg resize-none"
                />
                <p className="text-gray-500 text-sm mt-2">
                  Help students understand the context of the image. This
                  description can provide additional details not visible in the
                  image.
                </p>
              </div>
            </div>

            {/* Sub-Questions Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-3 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  📋 Questions About the Image
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSubQuestion}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Add Question
                </motion.button>
              </div>

              <div className="space-y-4">
                {subQuestions.map((subQ, index) => (
                  <motion.div
                    key={subQ.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-orange-700 text-lg">
                        {getSubQuestionLetter(index)})
                      </span>
                      {subQuestions.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeSubQuestion(subQ.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-lg transition-all duration-300"
                          title="Remove question"
                        >
                          <MinusCircle size={16} />
                        </motion.button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Question Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Question
                        </label>
                        <input
                          type="text"
                          value={subQ.question}
                          onChange={(e) =>
                            updateSubQuestion(
                              subQ.id,
                              "question",
                              e.target.value
                            )
                          }
                          placeholder="e.g., How many fruits are there in total?"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Answer and Unit Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Answer
                          </label>
                          <input
                            type="text"
                            value={subQ.answer}
                            onChange={(e) =>
                              updateSubQuestion(
                                subQ.id,
                                "answer",
                                e.target.value
                              )
                            }
                            placeholder="e.g., 23"
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Unit (Optional)
                          </label>
                          <input
                            type="text"
                            value={subQ.unit}
                            onChange={(e) =>
                              updateSubQuestion(subQ.id, "unit", e.target.value)
                            }
                            placeholder="e.g., fruits, pieces, cm, kg, etc."
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Answer Preview */}
                      {subQ.answer && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <span className="text-sm text-green-700 font-semibold">
                            Complete Answer: {subQ.answer}
                            {subQ.unit ? ` ${subQ.unit}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Problem Preview */}
              {imageUrl && subQuestions.some((sq) => sq.question.trim()) && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3">
                    👁️ Full Problem Preview:
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-blue-300">
                    <div className="mb-3">
                      <img
                        src={imageUrl}
                        alt="Problem"
                        className="w-32 h-24 object-contain rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    {imageDescription && (
                      <p className="text-gray-700 mb-3 text-sm italic">
                        {imageDescription}
                      </p>
                    )}
                    <div className="space-y-2">
                      {subQuestions
                        .filter((sq) => sq.question.trim())
                        .map((sq, index) => (
                          <div key={sq.id} className="flex items-start gap-2">
                            <span className="font-bold text-blue-700 min-w-[20px]">
                              {getSubQuestionLetter(index)})
                            </span>
                            <span className="text-gray-700">{sq.question}</span>
                          </div>
                        ))}
                    </div>
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
                Easy: Simple observation, Medium: Basic calculations, Hard:
                Complex analysis
              </p>
            </div>

            {/* Explanation Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Solution Steps{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Explain how to analyze the image and solve the questions step by step..."
                rows={4}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand how to interpret visual information
              </p>
            </div>

            {/* Validation Message */}
            {(imageUrl.trim() ||
              imageDescription.trim() ||
              subQuestions.some(
                (sq) => sq.question.trim() || sq.answer.trim()
              )) &&
              !isValidProblem && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      Please upload an image and add at least one question with
                      its answer
                    </span>
                  </div>
                </div>
              )}

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: isValidProblem ? 1.05 : 1 }}
              whileTap={{ scale: isValidProblem ? 0.95 : 1 }}
              onClick={handleAddQuestion}
              disabled={!isValidProblem}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                isValidProblem
                  ? "bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={24} />
              Add Image Problem
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-2xl">
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
                  <div className="text-sm text-gray-600">Total Problems</div>
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

              {/* Image Guidelines */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 mt-4">
                <h4 className="font-bold text-purple-800 mb-2 text-sm">
                  📷 Image Guidelines
                </h4>
                <div className="text-xs text-purple-700 space-y-1">
                  <div>• Clear, high-quality images</div>
                  <div>• Relevant to the questions</div>
                  <div>• Easy to see details</div>
                  <div>• Educational content</div>
                  <div>• Max size: 5MB</div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2 text-sm">
                  💡 Tips
                </h4>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>• Use images with countable objects</li>
                  <li>• Include clear visual elements</li>
                  <li>• Ask specific questions about the image</li>
                  <li>• Consider multiple sub-questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Display Section */}
      {mathQuestions.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-indigo-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <BookOpen className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Created Image Problems ({mathQuestions.length})
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
                        const problemData = parseImageProblem(
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
                                ? "ring-4 ring-indigo-300"
                                : ""
                            }`}
                          >
                            {editingIndex === question.originalIndex ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-gray-800">
                                    Edit Image Problem
                                  </h4>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={saveEdit}
                                      disabled={!isValidEditProblem}
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
                                    Image URL
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.imageUrl}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        e.target.value,
                                        editData.imageDescription,
                                        editData.subQuestions
                                      )
                                    }
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-300"
                                    placeholder="Enter image URL..."
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
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Image Description
                                  </label>
                                  <textarea
                                    value={editData.imageDescription}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        editData.imageUrl,
                                        e.target.value,
                                        editData.subQuestions
                                      )
                                    }
                                    rows={2}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Enter image description..."
                                  />
                                </div>

                                {/* Edit Sub-Questions */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Questions & Answers
                                  </label>
                                  <div className="space-y-3">
                                    {editData.subQuestions.map(
                                      (subQ, subIndex) => (
                                        <div
                                          key={subIndex}
                                          className="bg-gray-50 p-3 rounded-lg border"
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-indigo-700">
                                              {getSubQuestionLetter(subIndex)})
                                            </span>
                                            <input
                                              type="text"
                                              value={subQ.question}
                                              onChange={(e) => {
                                                const newSubQuestions = [
                                                  ...editData.subQuestions,
                                                ];
                                                newSubQuestions[subIndex] = {
                                                  ...newSubQuestions[subIndex],
                                                  question: e.target.value,
                                                };
                                                updateEditEquation(
                                                  editData.imageUrl,
                                                  editData.imageDescription,
                                                  newSubQuestions
                                                );
                                              }}
                                              className="flex-1 p-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                                              placeholder="Question..."
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              value={subQ.answer}
                                              onChange={(e) => {
                                                const newSubQuestions = [
                                                  ...editData.subQuestions,
                                                ];
                                                newSubQuestions[subIndex] = {
                                                  ...newSubQuestions[subIndex],
                                                  answer: e.target.value,
                                                };
                                                updateEditEquation(
                                                  editData.imageUrl,
                                                  editData.imageDescription,
                                                  newSubQuestions
                                                );
                                              }}
                                              className="p-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                                              placeholder="Answer..."
                                            />
                                            <input
                                              type="text"
                                              value={subQ.unit}
                                              onChange={(e) => {
                                                const newSubQuestions = [
                                                  ...editData.subQuestions,
                                                ];
                                                newSubQuestions[subIndex] = {
                                                  ...newSubQuestions[subIndex],
                                                  unit: e.target.value,
                                                };
                                                updateEditEquation(
                                                  editData.imageUrl,
                                                  editData.imageDescription,
                                                  newSubQuestions
                                                );
                                              }}
                                              className="p-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                                              placeholder="Unit..."
                                            />
                                          </div>
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
                                    Solution Steps
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
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Optional solution steps..."
                                  />
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {/* Image Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 mb-3">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                          <div className="flex-shrink-0">
                                            <img
                                              src={problemData.imageUrl}
                                              alt="Problem Image"
                                              className="w-full sm:w-32 h-32 object-contain rounded-lg border-2 border-gray-200"
                                              onError={(e) => {
                                                e.currentTarget.src =
                                                  "/api/placeholder/128/128";
                                                e.currentTarget.alt =
                                                  "Image not available";
                                              }}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <span className="text-sm text-gray-600 block mb-2">
                                              🖼️ Image Problem:
                                            </span>
                                            {problemData.imageDescription && (
                                              <p className="text-lg text-gray-800 leading-relaxed mb-2">
                                                {problemData.imageDescription}
                                              </p>
                                            )}
                                            <p className="text-sm text-gray-500 italic">
                                              Click on the image to view full
                                              size
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Sub-Questions Display */}
                                      <div className="space-y-3 mb-3">
                                        <span className="text-sm text-gray-600 block">
                                          📝 Questions:
                                        </span>
                                        {problemData.subQuestions.map(
                                          (subQ, subIndex) => (
                                            <div
                                              key={subIndex}
                                              className="bg-orange-50 border-2 border-orange-200 p-3 rounded-xl"
                                            >
                                              <div className="flex items-start gap-2 mb-2">
                                                <span className="font-bold text-orange-700 min-w-[20px]">
                                                  {getSubQuestionLetter(
                                                    subIndex
                                                  )}
                                                  )
                                                </span>
                                                <span className="text-gray-800">
                                                  {subQ.question}
                                                </span>
                                              </div>
                                              <div className="ml-5 bg-green-50 border border-green-200 p-2 rounded-lg">
                                                <span className="text-sm text-green-700 font-semibold">
                                                  ✅ Answer: {subQ.answer}
                                                  {subQ.unit
                                                    ? ` ${subQ.unit}`
                                                    : ""}
                                                </span>
                                              </div>
                                            </div>
                                          )
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
                                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2 rounded-lg transition-all duration-300"
                                      title="Edit problem"
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
                                      title="Delete problem"
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
                                          Solution Steps:
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
                                  Click edit button to modify this image problem
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
