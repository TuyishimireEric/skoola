import { motion } from "framer-motion";
import {
  Plus,
  Type,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";

// Types to match NumberSequence component interface
interface SentenceSortingInput {
  equation: string; // This will store the sentence
  explanation: string;
  difficulty: DifficultyLevel;
}

type DifficultyLevel = "Easy" | "Medium" | "Hard";

interface SentenceSortingProps {
  mathQuestions: SentenceSortingInput[]; // Renamed to match NumberSequence
  newEquation: string; // This will store the sentence
  setNewEquation: (value: string) => void;
  newExplanation: string;
  setNewExplanation: (value: string) => void;
  newDifficulty: DifficultyLevel;
  setNewDifficulty: (value: DifficultyLevel) => void;
  addMathQuestion: () => void; // Renamed to match NumberSequence
  removeMathQuestion: (index: number) => void; // Renamed to match NumberSequence
  editQuestion?: (index: number, question: SentenceSortingInput) => void;
}

export const SentenceSorting: React.FC<SentenceSortingProps> = ({
  mathQuestions, // Using mathQuestions to match NumberSequence interface
  newEquation, // Using newEquation to store sentence
  setNewEquation,
  newExplanation,
  setNewExplanation,
  newDifficulty,
  setNewDifficulty,
  addMathQuestion, // Using addMathQuestion to match NumberSequence interface
  removeMathQuestion, // Using removeMathQuestion to match NumberSequence interface
  editQuestion,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SentenceSortingInput>({
    equation: "", // Stores sentence in equation field
    explanation: "",
    difficulty: "Easy",
  });

  const [subjectWords, setSubjectWords] = useState("cat, dog, bird");
  const [verbWords, setVerbWords] = useState("runs, jumps, flies");
  const [objectWords, setObjectWords] = useState("quickly, slowly, high");

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

  // Validate sentence - check if it has at least 3 words
  const validateSentence = (sentence: string): boolean => {
    const words = sentence
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length >= 3;
  };

  // Split sentence into words for preview
  const getSentenceWords = (sentence: string): string[] => {
    return sentence
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
  };

  // Shuffle words for preview
  const shuffleWords = (words: string[]): string[] => {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate sentence from template
  const generateSentence = () => {
    const subjects = subjectWords
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const verbs = verbWords
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    const objects = objectWords
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o);

    if (subjects.length === 0 || verbs.length === 0 || objects.length === 0)
      return;

    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const randomObject = objects[Math.floor(Math.random() * objects.length)];

    let sentence = "";
    switch (newDifficulty) {
      case "Easy":
        sentence = `The ${randomSubject} ${randomVerb} ${randomObject}.`;
        break;
      case "Medium":
        sentence = `The big ${randomSubject} ${randomVerb} very ${randomObject} today.`;
        break;
      case "Hard":
        sentence = `Yesterday, the beautiful ${randomSubject} ${randomVerb} extremely ${randomObject} in the garden.`;
        break;
    }

    setNewEquation(sentence);
  };

  const isValidSentence = validateSentence(newEquation);
  const currentWords = getSentenceWords(newEquation);
  const shuffledWords =
    currentWords.length > 0 ? shuffleWords(currentWords) : [];

  // Group questions by difficulty
  const groupedQuestions = mathQuestions.reduce((acc, question, index) => {
    if (!acc[question.difficulty]) {
      acc[question.difficulty] = [];
    }
    acc[question.difficulty].push({ ...question, originalIndex: index });
    return acc;
  }, {} as Record<DifficultyLevel, Array<SentenceSortingInput & { originalIndex: number }>>);

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
  const startEditing = (index: number, question: SentenceSortingInput) => {
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
      validateSentence(editForm.equation)
    ) {
      editQuestion(editingIndex, editForm);
      cancelEditing();
    }
  };

  const isValidEditSentence = validateSentence(editForm.equation);

  // Get difficulty suggestions
  const getDifficultyTips = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case "Easy":
        return "Simple sentences with 3-5 words, basic grammar";
      case "Medium":
        return "Sentences with 6-10 words, some complexity";
      case "Hard":
        return "Complex sentences with 10+ words, advanced grammar";
      default:
        return "Choose difficulty level";
    }
  };

  // Get sample sentences for each difficulty
  const getSampleSentences = (difficulty: DifficultyLevel): string[] => {
    switch (difficulty) {
      case "Easy":
        return [
          "The cat sleeps.",
          "Dogs bark loudly.",
          "Birds fly high.",
          "I eat apples.",
        ];
      case "Medium":
        return [
          "The red car drives fast.",
          "My friend reads interesting books.",
          "Children play in the park.",
          "The teacher explains the lesson clearly.",
        ];
      case "Hard":
        return [
          "The intelligent student solved the complex mathematical problem quickly.",
          "During the beautiful sunset, we walked along the peaceful beach.",
          "The experienced chef prepared an amazing five-course dinner for everyone.",
          "After the exciting game, the tired players celebrated their victory.",
        ];
      default:
        return [];
    }
  };

  return (
    <>
      {/* Add New Sentence Form */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-2xl">
            <Type className="text-purple-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Sentence Sorting Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Sentence Generator */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-3 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="text-purple-600" size={20} />
                Quick Sentence Generator
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subjects
                  </label>
                  <input
                    type="text"
                    value={subjectWords}
                    onChange={(e) => setSubjectWords(e.target.value)}
                    placeholder="cat, dog, bird"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verbs
                  </label>
                  <input
                    type="text"
                    value={verbWords}
                    onChange={(e) => setVerbWords(e.target.value)}
                    placeholder="runs, jumps, flies"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adjectives/Adverbs
                  </label>
                  <input
                    type="text"
                    value={objectWords}
                    onChange={(e) => setObjectWords(e.target.value)}
                    placeholder="quickly, slowly, high"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateSentence}
                  className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg"
                >
                  Generate Sentence
                </motion.button>
              </div>

              <p className="text-purple-600 text-sm mt-3 text-center">
                Separate words with commas. The generator will create sentences
                based on difficulty level.
              </p>
            </div>

            {/* Manual Sentence Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Sentence *
              </label>
              <textarea
                value={newEquation}
                onChange={(e) => setNewEquation(e.target.value)}
                placeholder="e.g., The quick brown fox jumps over the lazy dog."
                rows={3}
                className={`w-full p-4 rounded-2xl border-4 focus:outline-none transition-all duration-300 text-lg resize-none ${
                  newEquation && !isValidSentence
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-purple-500"
                }`}
              />

              {newEquation && !isValidSentence && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  <AlertCircle size={16} />
                  Please enter a sentence with at least 3 words
                </div>
              )}

              {newEquation && isValidSentence && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                  <div className="text-green-500">✓</div>
                  Valid sentence! {currentWords.length} words to sort
                </div>
              )}

              <p className="text-gray-500 text-sm mt-2">
                Enter a complete sentence that students will sort from shuffled
                words
              </p>
            </div>

            {/* Sentence Preview */}
            {newEquation && isValidSentence && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-3 border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Shuffle className="text-blue-600" size={20} />
                  Gameplay Preview
                </h4>

                {/* Original Sentence */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Original Sentence:
                  </p>
                  <div className="bg-white p-3 rounded-xl border-2 border-green-300">
                    <p className="text-gray-800 font-medium">{newEquation}</p>
                  </div>
                </div>

                {/* Shuffled Words */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Shuffled Words (what students will see):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shuffledWords.map((word, index) => (
                      <div
                        key={index}
                        className="bg-white px-3 py-2 rounded-lg border-2 border-blue-300 font-medium text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-blue-600 font-semibold mt-4 text-sm">
                  Students will drag and drop these words to form the correct
                  sentence
                </p>
              </div>
            )}

            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Difficulty Level *
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
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
              <p className="text-gray-500 text-sm mb-3">
                {getDifficultyTips(newDifficulty)}
              </p>

              {/* Sample sentences for current difficulty */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {newDifficulty} Level Examples:
                </p>
                <div className="space-y-1">
                  {getSampleSentences(newDifficulty).map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setNewEquation(sample)}
                      className="block w-full text-left text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-2 rounded transition-all duration-200"
                    >
                      &quot;`{sample}&quot;`
                    </button>
                  ))}
                </div>
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
                placeholder="Explain the sentence structure or grammar concepts (optional)..."
                rows={3}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the sentence structure and grammar
              </p>
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addMathQuestion}
              disabled={!newEquation.trim() || !isValidSentence}
              className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={24} />
              Add Sentence Question
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="text-purple-600" size={20} />
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
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
                  <li>• Use proper capitalization and punctuation</li>
                  <li>• Vary sentence lengths for different difficulties</li>
                  <li>
                    • Include different sentence types (questions, statements)
                  </li>
                  <li>• Consider grammar concepts (subject-verb-object)</li>
                  <li>• Test your sentences by reading them aloud</li>
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

                    <div className="grid gap-4 md:grid-cols-1">
                      {questionsForDifficulty.map((question) => {
                        const words = getSentenceWords(question.equation);
                        const shuffledPreview = shuffleWords(words);

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
                                        !isValidEditSentence
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

                                {/* Edit Sentence */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Sentence
                                  </label>
                                  <textarea
                                    value={editForm.equation}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        equation: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className={`w-full p-3 rounded-xl border-2 focus:outline-none transition-all duration-300 resize-none ${
                                      editForm.equation && !isValidEditSentence
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-200 focus:border-blue-500"
                                    }`}
                                  />
                                  {editForm.equation &&
                                    !isValidEditSentence && (
                                      <p className="text-red-500 text-xs mt-1">
                                        Sentence must have at least 3 words
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
                                    {/* Sentence Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 mb-3">
                                        <p className="text-sm font-semibold text-green-700 mb-1">
                                          Original Sentence:
                                        </p>
                                        <p className="text-gray-800 font-medium text-lg">
                                          {question.equation}
                                        </p>
                                      </div>

                                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                                        <p className="text-sm font-semibold text-blue-700 mb-2">
                                          Shuffled Words ({words.length} words):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {shuffledPreview.map(
                                            (word, index) => (
                                              <div
                                                key={index}
                                                className="bg-white px-3 py-1 rounded-lg border-2 border-blue-300 text-sm font-medium text-gray-800"
                                              >
                                                {word}
                                              </div>
                                            )
                                          )}
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
                                  Click to edit sentence
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
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Sentence Questions Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by adding your first sentence above!
          </p>
        </div>
      )}
    </>
  );
};
