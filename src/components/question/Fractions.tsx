import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  PieChart,
  Divide,
} from "lucide-react";
import { useState, useEffect } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";

interface FractionProps {
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

interface FractionData {
  fractionEquation: string;
  answer: string;
}

export const Fraction: React.FC<FractionProps> = ({
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

  // Fraction creation states
  const [fractionMode, setFractionMode] = useState<
    "simple" | "operation" | "equation"
  >("simple");

  // Simple fraction states
  const [numerator1, setNumerator1] = useState("");
  const [denominator1, setDenominator1] = useState("");

  // Operation fraction states
  const [numerator2, setNumerator2] = useState("");
  const [denominator2, setDenominator2] = useState("");
  const [operation, setOperation] = useState<"+" | "-" | "×" | "÷">("+");

  // Answer states
  const [answerNumerator, setAnswerNumerator] = useState("");
  const [answerDenominator, setAnswerDenominator] = useState("");

  // Custom equation state
  const [customEquation, setCustomEquation] = useState("");

  // Parse fraction equation from string format
  const parseFractionEquation = (equation: string): FractionData => {
    const parts = equation.split("|");
    return {
      fractionEquation: parts[0] || "",
      answer: parts[1] || "",
    };
  };

  // Create fraction equation string
  const createFractionEquationString = (
    fractionEquation: string,
    answer: string
  ): string => {
    return `${fractionEquation.trim()}|${answer.trim()}`;
  };

  // Generate fraction equation based on mode
  const generateFractionEquation = (): string => {
    switch (fractionMode) {
      case "simple":
        if (numerator1 && denominator1) {
          return `${numerator1}/${denominator1}`;
        }
        return "";

      case "operation":
        if (numerator1 && denominator1 && numerator2 && denominator2) {
          return `${numerator1}/${denominator1} ${operation} ${numerator2}/${denominator2}`;
        }
        return "";

      default:
        return "";
    }
  };

  // Generate answer string
  const generateAnswer = (): string => {
    if (answerNumerator && answerDenominator) {
      return `${answerNumerator}/${answerDenominator}`;
    }
    return "";
  };

  // Update parent equation when inputs change
  useEffect(() => {
    const fractionEquation = generateFractionEquation();
    const answer = generateAnswer();
    const equationString = createFractionEquationString(
      fractionEquation,
      answer
    );

    if (equationString !== newEquation) {
      setNewEquation(equationString);
    }
  }, [
    numerator1,
    denominator1,
    numerator2,
    denominator2,
    operation,
    answerNumerator,
    answerDenominator,
    fractionMode,
  ]);

  // Sync with parent state
  useEffect(() => {
    const currentFractionData = parseFractionEquation(newEquation);
    if (currentFractionData.fractionEquation || currentFractionData.answer) {
      // Parse answer
      const answerParts = currentFractionData.answer.split("/");
      if (answerParts.length === 2) {
        setAnswerNumerator(answerParts[0]);
        setAnswerDenominator(answerParts[1]);
      }
    }
  }, [newEquation]);

  // Fraction mode configurations
  const fractionModes = [
    {
      id: "simple" as const,
      title: "Simple Fraction",
      description: "Create a single fraction",
      icon: "🍕",
      example: "3/4",
    },
    {
      id: "operation" as const,
      title: "Fraction Operations",
      description: "Add, subtract, multiply or divide fractions",
      icon: "➕",
      example: "1/2 + 1/4",
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
  const validateFraction = (): boolean => {
    const fractionEquation = generateFractionEquation();
    const answer = generateAnswer();
    return fractionEquation.trim() !== "" && answer.trim() !== "";
  };

  const isValidFraction = validateFraction();

  // Handle add question
  const handleAddQuestion = () => {
    if (isValidFraction) {
      addMathQuestion();
      // Clear inputs
      clearAllInputs();
    }
  };

  const clearAllInputs = () => {
    setNumerator1("");
    setDenominator1("");
    setNumerator2("");
    setDenominator2("");
    setAnswerNumerator("");
    setAnswerDenominator("");
    setOperation("+");
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
      const editFractionData = parseFractionEquation(editForm.equation);
      const isValidEdit =
        editFractionData.fractionEquation.trim() !== "" &&
        editFractionData.answer.trim() !== "";

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
  const editFractionData = parseFractionEquation(editForm.equation);
  const updateEditEquation = (fractionEquation: string, answer: string) => {
    const equationString = createFractionEquationString(
      fractionEquation,
      answer
    );
    setEditForm({ ...editForm, equation: equationString });
  };
  const isValidEditFraction =
    editFractionData.fractionEquation.trim() !== "" &&
    editFractionData.answer.trim() !== "";

  return (
    <>
      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">🍰</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Fraction Questions Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by creating your first fraction question above!
          </p>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-pink-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-pink-100 p-3 rounded-2xl">
            <PieChart className="text-pink-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Fraction Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fraction Mode Selection */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-3 border-purple-200">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Divide className="text-purple-600" size={16} />
                Choose Fraction Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fractionModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFractionMode(mode.id);
                      clearAllInputs();
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      fractionMode === mode.id
                        ? "bg-purple-100 border-purple-400 text-purple-800"
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

            {/* Fraction Input Section */}
            <div className="space-y-6">
              {fractionMode === "simple" && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl border-3 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🍕 Create a Simple Fraction
                  </h3>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Create Your Fraction
                      </label>
                      <div className="bg-white p-6 rounded-2xl border-3 border-blue-300 shadow-lg">
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            value={numerator1}
                            onChange={(e) => setNumerator1(e.target.value)}
                            placeholder="3 or (1+2)"
                            className="w-32 h-16 text-center text-2xl font-bold border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none mb-2"
                          />
                          <div className="w-full h-1 bg-gray-800 my-1"></div>
                          <input
                            type="text"
                            value={denominator1}
                            onChange={(e) => setDenominator1(e.target.value)}
                            placeholder="4 or (2+2)"
                            className="w-32 h-16 text-center text-2xl font-bold border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none mt-2"
                          />
                        </div>
                        <div className="mt-3 text-center">
                          <span className="text-xs text-gray-500">
                            Top: Numerator | Bottom: Denominator
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {numerator1 && denominator1 && (
                    <div className="mt-6 text-center">
                      <div className="bg-white p-4 rounded-xl border-2 border-green-300 inline-block">
                        <span className="text-sm text-gray-600 block mb-2">
                          Your Fraction:
                        </span>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-green-600 font-mono">
                            {numerator1}
                          </span>
                          <div className="w-16 h-0.5 bg-green-600 my-1"></div>
                          <span className="text-2xl font-bold text-green-600 font-mono">
                            {denominator1}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {fractionMode === "operation" && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-3 border-orange-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    ➕ Fraction Operations
                  </h3>

                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    {/* First Fraction */}
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        First Fraction
                      </label>
                      <div className="bg-white p-4 rounded-2xl border-3 border-orange-300 shadow-lg">
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            value={numerator1}
                            onChange={(e) => setNumerator1(e.target.value)}
                            placeholder="1 or (3-2)"
                            className="w-28 h-12 text-center text-xl font-bold border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none mb-1"
                          />
                          <div className="w-full h-0.5 bg-gray-800 my-1"></div>
                          <input
                            type="text"
                            value={denominator1}
                            onChange={(e) => setDenominator1(e.target.value)}
                            placeholder="2 or (1+1)"
                            className="w-28 h-12 text-center text-xl font-bold border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operation Input */}
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Operation
                      </label>
                      <input
                        type="text"
                        value={operation}
                        onChange={(e) =>
                          setOperation(e.target.value as "+" | "-" | "×" | "÷")
                        }
                        placeholder="+ - × ÷"
                        className="w-16 h-16 text-center text-2xl font-bold border-2 border-orange-400 rounded-xl focus:border-orange-600 focus:outline-none bg-white shadow-lg"
                        maxLength={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Type: + - × ÷
                      </p>
                    </div>

                    {/* Second Fraction */}
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Second Fraction
                      </label>
                      <div className="bg-white p-4 rounded-2xl border-3 border-orange-300 shadow-lg">
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            value={numerator2}
                            onChange={(e) => setNumerator2(e.target.value)}
                            placeholder="1 or (2-1)"
                            className="w-28 h-12 text-center text-xl font-bold border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none mb-1"
                          />
                          <div className="w-full h-0.5 bg-gray-800 my-1"></div>
                          <input
                            type="text"
                            value={denominator2}
                            onChange={(e) => setDenominator2(e.target.value)}
                            placeholder="4 or (2×2)"
                            className="w-28 h-12 text-center text-xl font-bold border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operation Preview */}
                  {numerator1 &&
                    denominator1 &&
                    numerator2 &&
                    denominator2 &&
                    operation && (
                      <div className="mt-6 text-center">
                        <div className="bg-white p-4 rounded-xl border-2 border-orange-300 inline-block">
                          <span className="text-sm text-gray-600 block mb-3">
                            Your Equation:
                          </span>
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-orange-600 font-mono">
                                {numerator1}
                              </span>
                              <div className="w-12 h-0.5 bg-orange-600"></div>
                              <span className="text-lg font-bold text-orange-600 font-mono">
                                {denominator1}
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                              {operation}
                            </span>
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-orange-600 font-mono">
                                {numerator2}
                              </span>
                              <div className="w-12 h-0.5 bg-orange-600"></div>
                              <span className="text-lg font-bold text-orange-600 font-mono">
                                {denominator2}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {fractionMode === "equation" && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-3 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    ✏️ Custom Fraction Equation
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Write Your Fraction Equation
                    </label>
                    <textarea
                      value={customEquation}
                      onChange={(e) => setCustomEquation(e.target.value)}
                      placeholder="Examples: 2/3 = ?/9, 1/2 + 1/4 = ?, 3/4 - 1/8"
                      rows={3}
                      className="w-full p-4 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none font-mono text-lg resize-none"
                    />
                    <p className="text-gray-500 text-sm mt-2">
                      You can use fractions (1/2), operations (+, -, ×, ÷), and
                      ? for missing parts
                    </p>
                  </div>
                  {customEquation && (
                    <div className="mt-4 text-center">
                      <div className="bg-white p-4 rounded-xl border-2 border-purple-300 inline-block">
                        <span className="text-sm text-gray-600 block mb-2">
                          Your Equation:
                        </span>
                        <span className="text-xl font-bold text-purple-600 font-mono">
                          {customEquation}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Answer Section */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border-3 border-green-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ✅ Correct Answer
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Answer Fraction
                    </label>
                    <div className="bg-white p-6 rounded-2xl border-3 border-green-300 shadow-lg">
                      <div className="flex flex-col items-center">
                        <input
                          type="text"
                          value={answerNumerator}
                          onChange={(e) => setAnswerNumerator(e.target.value)}
                          placeholder="3 or (1+2)"
                          className="w-32 h-16 text-center text-2xl font-bold border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none mb-2"
                        />
                        <div className="w-full h-1 bg-gray-800 my-1"></div>
                        <input
                          type="text"
                          value={answerDenominator}
                          onChange={(e) => setAnswerDenominator(e.target.value)}
                          placeholder="4 or (2×2)"
                          className="w-32 h-16 text-center text-2xl font-bold border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none mt-2"
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs text-gray-500">
                          Top: Numerator | Bottom: Denominator
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {answerNumerator && answerDenominator && (
                  <div className="mt-6 text-center">
                    <div className="bg-white p-4 rounded-xl border-2 border-green-400 inline-block">
                      <span className="text-sm text-gray-600 block mb-2">
                        Correct Answer:
                      </span>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-green-600 font-mono">
                          {answerNumerator}
                        </span>
                        <div className="w-16 h-0.5 bg-green-600 my-1"></div>
                        <span className="text-2xl font-bold text-green-600 font-mono">
                          {answerDenominator}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                Easy: Simple fractions, Medium: Basic operations, Hard: Complex
                equations
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
                placeholder="Explain how to solve this fraction problem step by step..."
                rows={4}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand how to work with fractions
              </p>
            </div>

            {/* Validation Message */}
            {(generateFractionEquation().trim() || generateAnswer().trim()) &&
              !isValidFraction && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      Please complete both the fraction problem and answer to
                      continue
                    </span>
                  </div>
                </div>
              )}

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: isValidFraction ? 1.05 : 1 }}
              whileTap={{ scale: isValidFraction ? 0.95 : 1 }}
              onClick={handleAddQuestion}
              disabled={!isValidFraction}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                isValidFraction
                  ? "bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={24} />
              Add Fraction Question
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-pink-50 p-6 rounded-2xl">
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
                  🍰 Examples
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • <strong>Easy:</strong> 1/2
                  </li>
                  <li>
                    • <strong>Medium:</strong> 1/2 + 1/4
                  </li>
                  <li>
                    • <strong>Hard:</strong> 2/3 = ?/9
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
                Created Fraction Questions ({mathQuestions.length})
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
                        const fractionData = parseFractionEquation(
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
                                    Edit Fraction Question
                                  </h4>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={saveEdit}
                                      disabled={!isValidEditFraction}
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

                                {/* Edit Fraction Equation */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Fraction Equation
                                  </label>
                                  <textarea
                                    value={editFractionData.fractionEquation}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        e.target.value,
                                        editFractionData.answer
                                      )
                                    }
                                    rows={2}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 font-mono resize-none"
                                    placeholder="Enter fraction equation..."
                                  />
                                </div>

                                {/* Edit Answer */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Answer
                                  </label>
                                  <input
                                    type="text"
                                    value={editFractionData.answer}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        editFractionData.fractionEquation,
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
                                    {/* Fraction Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 mb-3">
                                        <div className="text-center">
                                          <span className="text-sm text-gray-600 block mb-2">
                                            🍰 Fraction Problem:
                                          </span>
                                          <span className="text-xl font-bold font-mono text-gray-800">
                                            {fractionData.fractionEquation}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border-2 border-green-200">
                                        <div className="text-center">
                                          <span className="text-sm text-gray-600 block mb-2">
                                            ✅ Answer:
                                          </span>
                                          <span className="text-lg font-bold font-mono text-green-600">
                                            {fractionData.answer}
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
                                  Click edit button to modify this fraction
                                  question
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
