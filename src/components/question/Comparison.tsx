import { motion } from "framer-motion";
import {
  Plus,
  Scale,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  MathQuestionInput,
  DifficultyLevel,
} from "@/types/Questions";

interface ComparisonProps {
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

type ComparisonOperator = ">" | "<" | "=" | ">=" | "<=";

interface ComparisonForm {
  left: string;
  operator: ComparisonOperator;
  right: string;
}

export const Comparison: React.FC<ComparisonProps> = ({
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

  // Parse equation into comparison form
  const parseEquation = (equation: string): ComparisonForm => {
    const operators: ComparisonOperator[] = [">=", "<=", ">", "<", "="];
    for (const op of operators) {
      if (equation.includes(op)) {
        const parts = equation.split(op);
        if (parts.length === 2) {
          return {
            left: parts[0].trim(),
            operator: op,
            right: parts[1].trim(),
          };
        }
      }
    }
    return { left: "", operator: ">", right: "" };
  };

  // Create equation from comparison form
  const createEquation = (form: ComparisonForm): string => {
    return `${form.left} ${form.operator} ${form.right}`;
  };

  // Parse current equation for form display
  const currentComparison = parseEquation(newEquation);

  // Update equation when form changes
  const updateComparison = (updates: Partial<ComparisonForm>) => {
    const newComparison = { ...currentComparison, ...updates };
    const equation = createEquation(newComparison);
    setNewEquation(equation);
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

  const validateComparison = (equation: string): boolean => {
    const form = parseEquation(equation);
    // Check if left and right are numbers or simple expressions
    const numberPattern = /^[\d\+\-\*\/\s\(\)\.]+$/;
    return (
      form.left.trim() !== "" &&
      form.right.trim() !== "" &&
      numberPattern.test(form.left) &&
      numberPattern.test(form.right)
    );
  };

  const isValidComparison = validateComparison(newEquation);

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
      validateComparison(editForm.equation)
    ) {
      editQuestion(editingIndex, editForm);
      cancelEditing();
    }
  };

  const isValidEditComparison = validateComparison(editForm.equation);

  // Parse edit form for display
  const editComparison = parseEquation(editForm.equation);

  const updateEditComparison = (updates: Partial<ComparisonForm>) => {
    const newComparison = { ...editComparison, ...updates };
    const equation = createEquation(newComparison);
    setEditForm({ ...editForm, equation });
  };

  const comparisonOperators: { value: ComparisonOperator; label: string; description: string }[] = [
    { value: ">", label: ">", description: "Greater than" },
    { value: "<", label: "<", description: "Less than" },
    { value: "=", label: "=", description: "Equal to" },
    { value: ">=", label: "≥", description: "Greater than or equal" },
    { value: "<=", label: "≤", description: "Less than or equal" },
  ];

  return (
    <>
      {/* Add New Comparison Form */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Scale className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Comparison Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comparison Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Comparison Statement *
              </label>
              
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-3 border-blue-200">
                {/* Left Value */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Left Value
                  </label>
                  <input
                    type="text"
                    value={currentComparison.left}
                    onChange={(e) => updateComparison({ left: e.target.value })}
                    placeholder="e.g., 5, 2+3, 10"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono text-lg text-center"
                  />
                </div>

                {/* Comparison Operator */}
                <div className="flex-shrink-0">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                    Comparison
                  </label>
                  <select
                    value={currentComparison.operator}
                    onChange={(e) => updateComparison({ operator: e.target.value as ComparisonOperator })}
                    className="p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-bold text-lg bg-white min-w-[80px] text-center"
                  >
                    {comparisonOperators.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right Value */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Right Value
                  </label>
                  <input
                    type="text"
                    value={currentComparison.right}
                    onChange={(e) => updateComparison({ right: e.target.value })}
                    placeholder="e.g., 8, 4+4, 12"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono text-lg text-center"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-white rounded-xl border-2 border-gray-200">
                <div className="text-center">
                  <span className="text-sm text-gray-600 block mb-2">Preview:</span>
                  <span className="text-2xl font-bold font-mono text-gray-800">
                    {currentComparison.left || "?"} {currentComparison.operator} {currentComparison.right || "?"}
                  </span>
                </div>
              </div>

              {newEquation && !isValidComparison && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  <AlertCircle size={16} />
                  Please enter valid numbers or expressions for both left and right values
                </div>
              )}
              
              <p className="text-gray-500 text-sm mt-2">
                Create comparison statements like &quot;5 {'>'} 3&quot; or &quot;2+3 = 5&quot;
              </p>
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
                placeholder="Explain why this comparison is correct (optional)..."
                rows={3}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the comparison logic
              </p>
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addMathQuestion}
              disabled={!currentComparison.left.trim() || !currentComparison.right.trim() || !isValidComparison}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={24} />
              Add Comparison Question
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

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {questionsForDifficulty.map((question) => (
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
                                      !isValidEditComparison
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

                              {/* Edit Comparison */}
                              <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                  Comparison
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editComparison.left}
                                    onChange={(e) => updateEditComparison({ left: e.target.value })}
                                    className="flex-1 p-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono text-center"
                                    placeholder="Left"
                                  />
                                  <select
                                    value={editComparison.operator}
                                    onChange={(e) => updateEditComparison({ operator: e.target.value as ComparisonOperator })}
                                    className="p-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-bold bg-white"
                                  >
                                    {comparisonOperators.map((op) => (
                                      <option key={op.value} value={op.value}>
                                        {op.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={editComparison.right}
                                    onChange={(e) => updateEditComparison({ right: e.target.value })}
                                    className="flex-1 p-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono text-center"
                                    placeholder="Right"
                                  />
                                </div>
                                {editForm.equation && !isValidEditComparison && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Invalid comparison format
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
                                  <div
                                    className="text-2xl font-bold text-gray-800 font-mono mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() =>
                                      startEditing(
                                        question.originalIndex,
                                        question
                                      )
                                    }
                                  >
                                    {question.equation}
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
                                      removeMathQuestion(question.originalIndex)
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
                                Click equation to edit
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
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
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Comparison Questions Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by adding your first comparison question above!
          </p>
        </div>
      )}
    </>
  );
};