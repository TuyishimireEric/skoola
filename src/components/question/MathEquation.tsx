import { motion } from "framer-motion";
import {
  Plus,
  Calculator,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  Sigma,
} from "lucide-react";
import { useState, useEffect } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";

interface MathEquationProps {
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

interface EquationData {
  equation: string;
  answer: string;
}

export const MathEquation: React.FC<MathEquationProps> = ({
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

  // Local state for equation input components
  const [mathEquationInput, setMathEquationInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");

  // Parse equation to extract equation and answer
  const parseEquationAnswer = (equation: string): EquationData => {
    // Format: "equation|answer"
    const parts = equation.split("|");
    return {
      equation: parts[0] || "",
      answer: parts[1] || "",
    };
  };

  // Create equation string from parts
  const createEquationString = (equation: string, answer: string): string => {
    return `${equation.trim()}|${answer.trim()}`;
  };

  // Sync local inputs with parent state on mount and when newEquation changes
  useEffect(() => {
    const currentEquationData = parseEquationAnswer(newEquation);
    setMathEquationInput(currentEquationData.equation);
    setAnswerInput(currentEquationData.answer);
  }, [newEquation]);

  // Update parent state when local inputs change
  useEffect(() => {
    const equationString = createEquationString(mathEquationInput, answerInput);
    if (equationString !== newEquation) {
      setNewEquation(equationString);
    }
  }, [mathEquationInput, answerInput]);

  // Math symbols for quick insertion
  const mathSymbols = [
    { symbol: "√", name: "Square Root", example: "√16" },
    { symbol: "²", name: "Power of 2", example: "x²" },
    { symbol: "³", name: "Power of 3", example: "x³" },
    { symbol: "^", name: "Power", example: "2^3" },
    { symbol: "()", name: "Brackets", example: "(2+3)" },
    { symbol: "±", name: "Plus/Minus", example: "±5" },
    { symbol: "×", name: "Multiply", example: "3×4" },
    { symbol: "÷", name: "Divide", example: "8÷2" },
    { symbol: "π", name: "Pi", example: "2π" },
    { symbol: "°", name: "Degrees", example: "90°" },
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

  const validateMathEquation = (equation: string, answer: string): boolean => {
    // Both equation and answer should not be empty
    return equation.trim() !== "" && answer.trim() !== "";
  };

  // Check if current inputs are valid
  const isValidMathEquation = validateMathEquation(
    mathEquationInput,
    answerInput
  );

  // Insert symbol at cursor position
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById(
      "equation-input"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        mathEquationInput.substring(0, start) +
        symbol +
        mathEquationInput.substring(end);
      setMathEquationInput(newValue);

      // Set cursor position after inserted symbol
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + symbol.length,
          start + symbol.length
        );
      }, 0);
    }
  };

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
    if (editingIndex !== null && editQuestion) {
      const editEquationData = parseEquationAnswer(editForm.equation);
      const isValidEdit = validateMathEquation(
        editEquationData.equation,
        editEquationData.answer
      );

      if (isValidEdit) {
        editQuestion(editingIndex, editForm);
        cancelEditing();
      }
    }
  };

  // Handle add question - use parent's addMathQuestion directly
  const handleAddQuestion = () => {
    if (isValidMathEquation) {
      addMathQuestion();
      // Clear inputs after adding
      setMathEquationInput("");
      setAnswerInput("");
    }
  };

  // Parse edit form for display
  const editEquationData = parseEquationAnswer(editForm.equation);

  const updateEditEquation = (equation: string, answer: string) => {
    const equationString = createEquationString(equation, answer);
    setEditForm({ ...editForm, equation: equationString });
  };

  const isValidEditMathEquation = validateMathEquation(
    editEquationData.equation,
    editEquationData.answer
  );

  return (
    <>
      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">📐</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Math Equations Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by adding your first mathematical equation above!
          </p>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Sigma className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Math Equation Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Math Symbols Toolbar */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border-3 border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calculator className="text-blue-600" size={16} />
                Quick Math Symbols
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {mathSymbols.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => insertSymbol(item.symbol)}
                    className="bg-white hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-2 text-lg font-bold text-gray-800 transition-all duration-300 min-h-[40px] flex items-center justify-center"
                    title={`${item.name} - ${item.example}`}
                  >
                    {item.symbol}
                  </motion.button>
                ))}
              </div>
              <p className="text-blue-600 text-xs mt-2 text-center">
                Click symbols to insert them into your equation
              </p>
            </div>

            {/* Equation Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Mathematical Equation *
              </label>
              <textarea
                id="equation-input"
                value={mathEquationInput}
                onChange={(e) => setMathEquationInput(e.target.value)}
                placeholder="e.g., 2x + 5 = 13, √(x² + 9) = 5, (3 + 4)² ÷ 7"
                rows={3}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-mono text-lg resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Use variables (x, y), operations (+, -, ×, ÷), powers (²,³,^),
                square roots (√), brackets, etc.
              </p>
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Correct Answer *
              </label>
              <input
                type="text"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="e.g., x = 4, 12, 7²"
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-mono text-lg"
              />
              <p className="text-gray-500 text-sm mt-2">
                Provide the complete answer or solution
              </p>
            </div>

            {/* Equation Preview */}
            {(mathEquationInput.trim() || answerInput.trim()) && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-3 border-green-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3">
                  Equation Preview
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border-2 border-green-300">
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block mb-2">
                        Question:
                      </span>
                      <span className="text-xl font-bold font-mono text-gray-800">
                        {mathEquationInput || "Enter equation..."}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-300">
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block mb-2">
                        Answer:
                      </span>
                      <span className="text-xl font-bold font-mono text-green-600">
                        {answerInput || "Enter answer..."}
                      </span>
                    </div>
                  </div>
                </div>
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
                Easy: Basic operations, Medium: Variables & brackets, Hard:
                Complex equations
              </p>
            </div>

            {/* Explanation Input - Optional */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Solution Steps{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Explain how to solve this equation step by step (optional)..."
                rows={4}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the solution process
              </p>
            </div>

            {/* Validation Message */}
            {(mathEquationInput.trim() || answerInput.trim()) &&
              !isValidMathEquation && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      Please fill in both equation and answer to continue
                    </span>
                  </div>
                </div>
              )}

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: isValidMathEquation ? 1.05 : 1 }}
              whileTap={{ scale: isValidMathEquation ? 0.95 : 1 }}
              onClick={handleAddQuestion}
              disabled={!isValidMathEquation}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                isValidMathEquation
                  ? "bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={24} />
              Add Math Equation
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
                  📚 Examples
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • <strong>Easy:</strong> 2 + 3 = ?
                  </li>
                  <li>
                    • <strong>Medium:</strong> 2x + 5 = 13
                  </li>
                  <li>
                    • <strong>Hard:</strong> √(x² + 9) = 5
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
                        const equationData = parseEquationAnswer(
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
                                    Edit Question
                                  </h4>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={saveEdit}
                                      disabled={!isValidEditMathEquation}
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

                                {/* Edit Equation */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Equation
                                  </label>
                                  <textarea
                                    value={editEquationData.equation}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        e.target.value,
                                        editEquationData.answer
                                      )
                                    }
                                    rows={2}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono resize-none"
                                    placeholder="Enter equation..."
                                  />
                                </div>

                                {/* Edit Answer */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Answer
                                  </label>
                                  <input
                                    type="text"
                                    value={editEquationData.answer}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        editEquationData.equation,
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono"
                                    placeholder="Enter answer..."
                                  />
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
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Optional solution steps..."
                                  />
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {/* Equation Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mb-3">
                                        <div className="text-center">
                                          <span className="text-sm text-gray-600 block mb-2">
                                            Equation:
                                          </span>
                                          <span className="text-xl font-bold font-mono text-gray-800">
                                            {equationData.equation}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200">
                                        <div className="text-center">
                                          <span className="text-sm text-gray-600 block mb-2">
                                            Answer:
                                          </span>
                                          <span className="text-lg font-bold font-mono text-green-600">
                                            {equationData.answer}
                                          </span>
                                        </div>
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
                                        📝
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
                                  Click edit button to modify this equation
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
