import { motion } from "framer-motion";
import {
  Plus,
  Hash,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";

interface NumberSequenceProps {
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

interface SequenceData {
  numbers: number[];
  gap: number;
}

export const NumberSequence: React.FC<NumberSequenceProps> = ({
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

  // State for sequence input
  const [sequenceInput, setSequenceInput] = useState("");
  const [customGap, setCustomGap] = useState("");
  const [sequenceLength, setSequenceLength] = useState(5);

  // Parse equation to extract sequence data
  const parseSequence = (equation: string): SequenceData => {
    try {
      const numbers = equation
        .split(",")
        .map((n) => parseFloat(n.trim()))
        .filter((n) => !isNaN(n));
      if (numbers.length < 2) return { numbers: [], gap: 0 };

      const gap = numbers[1] - numbers[0];
      return { numbers, gap };
    } catch {
      return { numbers: [], gap: 0 };
    }
  };

  // Create equation from sequence
  const createSequenceEquation = (
    startNum: number,
    gap: number,
    length: number
  ): string => {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(startNum + gap * i);
    }
    return sequence.join(", ");
  };

  // Generate sequence from input
  const generateSequence = () => {
    const startNum = parseFloat(sequenceInput);
    const gap = parseFloat(customGap);
    if (isNaN(startNum) || isNaN(gap)) return;

    const equation = createSequenceEquation(startNum, gap, sequenceLength);
    setNewEquation(equation);
  };

  // Get suggested gap based on difficulty (now only used for suggestions, not generation)
  const getSuggestedGap = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case "Easy":
        return "1"; // Simple counting
      case "Medium":
        return "5"; // Skip counting by 5s
      case "Hard":
        return "10"; // Skip counting by 10s
      default:
        return "1";
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

  const validateSequence = (equation: string): boolean => {
    const sequenceData = parseSequence(equation);
    if (sequenceData.numbers.length < 3) return false;

    // Check if the gap is consistent
    for (let i = 1; i < sequenceData.numbers.length; i++) {
      const currentGap = sequenceData.numbers[i] - sequenceData.numbers[i - 1];
      if (Math.abs(currentGap - sequenceData.gap) > 0.001) return false;
    }

    return true;
  };

  const isValidSequence = validateSequence(newEquation);
  const currentSequence = parseSequence(newEquation);

  // Group questions by difficulty for better organization
  const groupedQuestions = mathQuestions.reduce((acc, question, index) => {
    if (!acc[question.difficulty]) {
      acc[question.difficulty] = [];
    }
    acc[question.difficulty].push({ ...question, originalIndex: index });
    return acc;
  }, {} as Record<DifficultyLevel, Array<MathQuestionInput & { originalIndex: number }>>);

  // Get stats for each difficulty level
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

  // Handle editing functions
  const startEditing = (index: number, question: MathQuestionInput) => {
    setEditingIndex(index);
    setEditForm({ ...question });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditForm({ equation: "", explanation: "", difficulty: "Easy" });
  };

  const saveEdit = () => {
    if (
      editingIndex !== null &&
      editQuestion &&
      validateSequence(editForm.equation)
    ) {
      editQuestion(editingIndex, editForm);
      cancelEditing();
    }
  };

  const isValidEditSequence = validateSequence(editForm.equation);

  return (
    <>
      {/* Add New Sequence Form */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Hash className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Number Sequence Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Sequence Generator */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-3 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-purple-600" size={20} />
                Quick Sequence Generator
              </h3>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    value={sequenceInput}
                    onChange={(e) => setSequenceInput(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 font-mono text-lg text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gap
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customGap}
                    onChange={(e) => setCustomGap(e.target.value)}
                    placeholder={`e.g., ${getSuggestedGap(newDifficulty)}`}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 font-mono text-lg text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Length
                  </label>
                  <select
                    value={sequenceLength}
                    onChange={(e) =>
                      setSequenceLength(parseInt(e.target.value))
                    }
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white"
                  >
                    <option value={3}>3 numbers</option>
                    <option value={4}>4 numbers</option>
                    <option value={5}>5 numbers</option>
                    <option value={6}>6 numbers</option>
                    <option value={7}>7 numbers</option>
                    <option value={8}>8 numbers</option>
                    <option value={9}>9 numbers</option>
                    <option value={10}>10 numbers</option>
                    <option value={11}>11 numbers</option>
                    <option value={12}>12 numbers</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateSequence}
                    disabled={
                      !sequenceInput.trim() ||
                      isNaN(parseFloat(sequenceInput)) ||
                      !customGap.trim() ||
                      isNaN(parseFloat(customGap))
                    }
                    className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate
                  </motion.button>
                </div>
              </div>

              <p className="text-purple-600 text-sm mt-3 text-center">
                Enter your starting number and desired gap, then generate the
                sequence!
              </p>
            </div>

            {/* Manual Sequence Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Number Sequence *
              </label>
              <input
                type="text"
                value={newEquation}
                onChange={(e) => setNewEquation(e.target.value)}
                placeholder="e.g., 2, 4, 6, 8, 10 or 5, 10, 15, 20, 25"
                className={`w-full p-4 rounded-2xl border-4 focus:outline-none transition-all duration-300 font-mono text-lg ${
                  newEquation && !isValidSequence
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-primary-500"
                }`}
              />

              {newEquation && !isValidSequence && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  <AlertCircle size={16} />
                  Please enter a valid sequence with consistent gaps (at least 3
                  numbers)
                </div>
              )}

              {newEquation && isValidSequence && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                  <div className="text-green-500">✓</div>
                  Valid sequence! Gap: {currentSequence.gap > 0 ? "+" : ""}
                  {currentSequence.gap}
                </div>
              )}

              <p className="text-gray-500 text-sm mt-2">
                Enter numbers separated by commas with identical gaps
              </p>
            </div>

            {/* Sequence Preview */}
            {newEquation && isValidSequence && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-3 border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3">
                  Sequence Preview
                </h4>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {currentSequence.numbers.map((num, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-white px-4 py-2 rounded-xl border-2 border-blue-300 font-mono text-lg font-bold text-gray-800 min-w-[60px] text-center">
                        {num}
                      </div>
                      {index < currentSequence.numbers.length - 1 && (
                        <div className="text-blue-500 font-bold mx-2">→</div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-center text-blue-600 font-semibold mt-3">
                  Pattern:{" "}
                  {currentSequence.gap > 0
                    ? `+${currentSequence.gap}`
                    : currentSequence.gap}{" "}
                  each step
                </p>
              </div>
            )}

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
                Difficulty affects complexity: Easy (simple patterns), Medium
                (moderate gaps), Hard (complex patterns)
              </p>
            </div>

            {/* Explanation Input - Optional */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Explanation{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Explain the pattern in this sequence (optional)..."
                rows={3}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the sequence pattern
              </p>
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addMathQuestion}
              disabled={!newEquation.trim() || !isValidSequence}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={24} />
              Add Sequence Question
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 p-6 rounded-2xl">
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
                  💡 Quick Tips
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Use positive gaps for ascending sequences</li>
                  <li>• Use negative gaps for descending sequences</li>
                  <li>• Decimal gaps work too (e.g., 0.5, 1.5)</li>
                  <li>• Longer sequences are more challenging</li>
                  <li>• Try creative patterns like +10, -3, +0.25</li>
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
                Created Questions ({mathQuestions.length})
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
                        const sequenceData = parseSequence(question.equation);

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
                                    Edit Question
                                  </h4>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={saveEdit}
                                      disabled={
                                        !editForm.equation.trim() ||
                                        !isValidEditSequence
                                      }
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

                                {/* Edit Sequence */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Sequence
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.equation}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        equation: e.target.value,
                                      })
                                    }
                                    className={`w-full p-3 rounded-xl border-2 focus:outline-none transition-all duration-300 font-mono ${
                                      editForm.equation && !isValidEditSequence
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-200 focus:border-blue-500"
                                    }`}
                                  />
                                  {editForm.equation &&
                                    !isValidEditSequence && (
                                      <p className="text-red-500 text-xs mt-1">
                                        Invalid sequence format
                                      </p>
                                    )}
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
                                    rows={2}
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
                                    {/* Sequence Display */}
                                    <div className="mb-4">
                                      <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                                        {sequenceData.numbers.map(
                                          (num, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center"
                                            >
                                              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-2 rounded-lg border-2 border-blue-200 font-mono text-lg font-bold text-gray-800 min-w-[50px] text-center">
                                                {num}
                                              </div>
                                              {index <
                                                sequenceData.numbers.length -
                                                  1 && (
                                                <div className="text-blue-500 font-bold mx-1 text-sm">
                                                  →
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                      <div className="text-center">
                                        <span className="text-sm text-blue-600 font-semibold">
                                          Pattern:{" "}
                                          {sequenceData.gap > 0
                                            ? `+${sequenceData.gap}`
                                            : sequenceData.gap}
                                        </span>
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
                                      <p className="text-gray-700 text-sm leading-relaxed">
                                        {question.explanation}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Edit hint overlay */}
                                <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
                                  Click to edit sequence
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

      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">🔢</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Sequence Questions Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by adding your first number sequence above!
          </p>
        </div>
      )}
    </>
  );
};
