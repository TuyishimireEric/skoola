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
  FileText,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";

interface WordProblemsProps {
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

interface WordProblem {
  problemText: string;
  subQuestions: SubQuestion[];
}

export const WordProblems: React.FC<WordProblemsProps> = ({
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

  // Word problem creation states
  const [problemText, setProblemText] = useState("");
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { id: "1", question: "", answer: "", unit: "" },
  ]);

  // Parse word problem from equation string
  const parseWordProblem = (equation: string): WordProblem => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 2) {
        const problemText = parts[0] || "";
        const subQuestionsStr = parts[1] || "";

        const subQuestions = subQuestionsStr ? JSON.parse(subQuestionsStr) : [];

        return { problemText, subQuestions };
      }
    } catch (error) {
      console.error("Error parsing word problem:", error);
    }

    return {
      problemText: "",
      subQuestions: [],
    };
  };

  // Create equation string from word problem data
  const createWordProblemString = (data: WordProblem): string => {
    const subQuestionsStr = JSON.stringify(data.subQuestions);
    return `${data.problemText}|${subQuestionsStr}`;
  };

  // Generate current problem data
  const getCurrentProblemData = (): WordProblem => {
    const filteredSubQuestions = subQuestions.filter(
      (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
    );
    return {
      problemText: problemText.trim(),
      subQuestions: filteredSubQuestions,
    };
  };

  // Update parent equation when inputs change
  useEffect(() => {
    const problemData = getCurrentProblemData();
    const equationString = createWordProblemString(problemData);

    if (equationString !== newEquation) {
      setNewEquation(equationString);
    }
  }, [problemText, subQuestions]);

  // Sync with parent state
  useEffect(() => {
    const currentData = parseWordProblem(newEquation);
    if (currentData.problemText || currentData.subQuestions.length > 0) {
      setProblemText(currentData.problemText);
      setSubQuestions(
        currentData.subQuestions.length > 0
          ? currentData.subQuestions
          : [{ id: "1", question: "", answer: "", unit: "" }]
      );
    }
  }, [newEquation]);

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
  const validateWordProblem = (): boolean => {
    const data = getCurrentProblemData();
    return (
      data.problemText.trim() !== "" &&
      data.subQuestions.length > 0 &&
      data.subQuestions.every(
        (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
      )
    );
  };

  const isValidProblem = validateWordProblem();

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
    setProblemText("");
    setSubQuestions([{ id: "1", question: "", answer: "", unit: "" }]);
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
      const editData = parseWordProblem(editForm.equation);
      const isValidEdit =
        editData.problemText.trim() !== "" &&
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
  const editData = parseWordProblem(editForm.equation);
  const updateEditEquation = (
    problemText: string,
    subQuestions: SubQuestion[]
  ) => {
    const data: WordProblem = { problemText, subQuestions };
    const equationString = createWordProblemString(data);
    setEditForm({ ...editForm, equation: equationString });
  };
  const isValidEditProblem =
    editData.problemText.trim() !== "" &&
    editData.subQuestions.length > 0 &&
    editData.subQuestions.every(
      (sq) => sq.question.trim() !== "" && sq.answer.trim() !== ""
    );

  return (
    <>
      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Word Problems Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by creating your first word problem with real-world scenarios!
          </p>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-emerald-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <FileText className="text-emerald-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Word Problems
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Problem Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Text Input */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-2xl border-3 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📖 Problem Statement
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Write the Problem Story *
                </label>
                <textarea
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="e.g., Keza has 450 Frw. She buys an eraser at 250 Frw and a sweet at 125 Frw."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-lg resize-none"
                />
                <p className="text-gray-500 text-sm mt-2">
                  Create a realistic scenario that students can relate to.
                  Include numbers, units, and context.
                </p>
              </div>
              {problemText && (
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-300">
                    <span className="text-sm text-gray-600 block mb-2">
                      Preview:
                    </span>
                    <span className="text-lg text-gray-800 leading-relaxed">
                      {problemText}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-Questions Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-3 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  📝 Questions & Answers
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSubQuestion}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2"
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
                    className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-purple-700 text-lg">
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
                          placeholder="e.g., How much does she remain with?"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
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
                            placeholder="e.g., 75"
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
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
                            placeholder="e.g., Frw, m, cm, kg, %, etc."
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
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
              {problemText && subQuestions.some((sq) => sq.question.trim()) && (
                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border-2 border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-3">
                    📋 Full Problem Preview:
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-emerald-300">
                    <p className="text-gray-800 mb-3 leading-relaxed">
                      {problemText}
                    </p>
                    <div className="space-y-2">
                      {subQuestions
                        .filter((sq) => sq.question.trim())
                        .map((sq, index) => (
                          <div key={sq.id} className="flex items-start gap-2">
                            <span className="font-bold text-emerald-700 min-w-[20px]">
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
                Easy: Simple operations, Medium: Multiple steps, Hard: Complex
                reasoning
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
                placeholder="Explain how to solve this problem step by step..."
                rows={4}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the problem-solving process
              </p>
            </div>

            {/* Validation Message */}
            {(problemText.trim() ||
              subQuestions.some(
                (sq) => sq.question.trim() || sq.answer.trim()
              )) &&
              !isValidProblem && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      Please complete the problem text and at least one question
                      with its answer
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
              Add Word Problem
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-emerald-50 p-6 rounded-2xl">
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

              {/* Common Units Reference */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mt-4">
                <h4 className="font-bold text-blue-800 mb-2 text-sm">
                  📏 Common Units Examples
                </h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                  <div>• Frw (money)</div>
                  <div>• m, cm (length)</div>
                  <div>• kg, g (weight)</div>
                  <div>• l, ml (volume)</div>
                  <div>• min, hrs (time)</div>
                  <div>• % (percent)</div>
                  <div>• pieces</div>
                  <div>• people</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Type any unit you need in the Unit field
                </p>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2 text-sm">
                  💡 Tips
                </h4>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>• Use realistic scenarios</li>
                  <li>• Include relevant units</li>
                  <li>• Break complex problems into sub-questions</li>
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
                Created Word Problems ({mathQuestions.length})
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
                        const problemData = parseWordProblem(question.equation);

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
                                    Edit Word Problem
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

                                {/* Edit Problem Text */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Problem Text
                                  </label>
                                  <textarea
                                    value={editData.problemText}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        e.target.value,
                                        editData.subQuestions
                                      )
                                    }
                                    rows={3}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Enter problem text..."
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
                                            <span className="font-bold text-purple-700">
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
                                                  editData.problemText,
                                                  newSubQuestions
                                                );
                                              }}
                                              className="flex-1 p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
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
                                                  editData.problemText,
                                                  newSubQuestions
                                                );
                                              }}
                                              className="p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
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
                                                  editData.problemText,
                                                  newSubQuestions
                                                );
                                              }}
                                              className="p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
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
                                    {/* Problem Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border-2 border-emerald-200 mb-3">
                                        <div className="text-left">
                                          <span className="text-sm text-gray-600 block mb-2">
                                            📖 Problem:
                                          </span>
                                          <p className="text-lg text-gray-800 leading-relaxed">
                                            {problemData.problemText}
                                          </p>
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
                                              className="bg-purple-50 border-2 border-purple-200 p-3 rounded-xl"
                                            >
                                              <div className="flex items-start gap-2 mb-2">
                                                <span className="font-bold text-purple-700 min-w-[20px]">
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
                                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-all duration-300"
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
                                  Click edit button to modify this word problem
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
