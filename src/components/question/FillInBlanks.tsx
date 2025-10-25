import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
  Edit3,
  Check,
  X,
  Minus,
  Hash,
  Upload,
  Mic,
  Play,
  Pause,
  Square,
  FileAudio,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";
import { uploadAudio } from "@/server/actions";

interface FillInTheBlankProps {
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

interface FillInTheBlankForm {
  question: string;
  options: string[];
  correctAnswers: string[];
  blanksCount: 1 | 2;
  audioUrl?: string;
}

export const FillInTheBlank: React.FC<FillInTheBlankProps> = ({
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

  // Audio states
  const [audioUrl, setAudioUrl] = useState("");
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string>("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>("");
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse equation into fill-in-the-blank form
  const parseEquation = (equation: string): FillInTheBlankForm => {
    try {
      const parsed = JSON.parse(equation);
      return {
        question: parsed.question || "",
        options: parsed.options || ["", "", "", ""],
        correctAnswers: parsed.correctAnswers || [""],
        blanksCount: parsed.blanksCount || 1,
        audioUrl: parsed.audioUrl || "",
      };
    } catch {
      return {
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [""],
        blanksCount: 1,
        audioUrl: "",
      };
    }
  };

  // Create equation from fill-in-the-blank form
  const createEquation = (form: FillInTheBlankForm): string => {
    return JSON.stringify(form);
  };

  // Parse current equation for form display
  const currentForm = parseEquation(newEquation);

  // Update equation when form changes
  const updateForm = (updates: Partial<FillInTheBlankForm>) => {
    const newForm = { ...currentForm, ...updates };

    // Adjust correctAnswers array based on blanksCount
    if (updates.blanksCount !== undefined) {
      if (updates.blanksCount === 1) {
        newForm.correctAnswers = [newForm.correctAnswers[0] || ""];
      } else if (updates.blanksCount === 2) {
        newForm.correctAnswers = [
          newForm.correctAnswers[0] || "",
          newForm.correctAnswers[1] || "",
        ];
      }
    }

    const equation = createEquation(newForm);
    setNewEquation(equation);
  };

  // Sync audio URL with form
  useEffect(() => {
    if (audioUrl !== currentForm.audioUrl) {
      updateForm({ audioUrl });
    }
  }, [audioUrl]);

  // Sync form audio URL with local state
  useEffect(() => {
    if (currentForm.audioUrl !== audioUrl) {
      setAudioUrl(currentForm.audioUrl || "");
    }
  }, [newEquation]);

  // Audio handling functions
  const handleAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("audio/")) {
        setAudioUploadError("Please select an audio file (MP3, WAV, OGG, etc.)");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setAudioUploadError("Audio size should be less than 10MB");
        return;
      }

      setSelectedAudioFile(file);
      setAudioUploadError("");

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setAudioPreviewUrl(preview);
    }
  };

  const handleAudioUpload = async () => {
    if (!selectedAudioFile) return;

    setIsUploadingAudio(true);
    setAudioUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedAudioFile);

      // Note: Replace with your actual upload function
      const result = await uploadAudio(formData);

      if (result.success && result.audio) {
        setAudioUrl(result.audio.secure_url);
        // showToast("Audio uploaded successfully", "success");
      }

      setSelectedAudioFile(null);
      setAudioPreviewUrl("");
    } catch (error) {
      console.error("Audio upload error:", error);
      setAudioUploadError("Failed to upload audio. Please try again.");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const clearAudio = () => {
    setAudioUrl("");
    setSelectedAudioFile(null);
    setAudioPreviewUrl("");
    setAudioUploadError("");
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = "";
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setSelectedAudioFile(file);
        const preview = URL.createObjectURL(blob);
        setAudioPreviewUrl(preview);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setAudioUploadError(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

  const validateForm = (form: FillInTheBlankForm): boolean => {
    // Check if question has the right number of blanks
    const blankCount = (form.question.match(/___/g) || []).length;
    if (blankCount !== form.blanksCount) return false;

    // Check if question is not empty
    if (!form.question.trim()) return false;

    // Check if all options are filled
    if (form.options.some((option) => !option.trim())) return false;

    // Check if correct answers are filled
    if (form.correctAnswers.some((answer) => !answer.trim())) return false;

    // Check if correct answers exist in options
    return form.correctAnswers.every((answer) =>
      form.options.some((option) => option.trim() === answer.trim())
    );
  };

  const isValidForm = validateForm(currentForm);

  // Update option
  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentForm.options];
    newOptions[index] = value;
    updateForm({ options: newOptions });
  };

  // Add new option
  const addOption = () => {
    if (currentForm.options.length < 6) {
      updateForm({ options: [...currentForm.options, ""] });
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    if (currentForm.options.length > 2) {
      const newOptions = currentForm.options.filter((_, i) => i !== index);
      const newCorrectAnswers = currentForm.correctAnswers.filter(
        (answer) => answer !== currentForm.options[index]
      );
      updateForm({
        options: newOptions,
        correctAnswers: newCorrectAnswers.length > 0 ? newCorrectAnswers : [""],
      });
    }
  };

  // Update correct answer
  const updateCorrectAnswer = (index: number, value: string) => {
    const newCorrectAnswers = [...currentForm.correctAnswers];
    newCorrectAnswers[index] = value;
    updateForm({ correctAnswers: newCorrectAnswers });
  };

  // Count blanks in question
  const countBlanks = (question: string): number => {
    return (question.match(/___/g) || []).length;
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
      const editFormData = parseEquation(editForm.equation);
      if (validateForm(editFormData)) {
        editQuestion(editingIndex, editForm);
        cancelEditing();
      }
    }
  };

  // Parse edit form for display
  const editFormData = parseEquation(editForm.equation);
  const isValidEditForm = validateForm(editFormData);

  return (
    <>
      {/* Add New Fill-in-the-Blank Form */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-2xl">
            <FileText className="text-purple-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Fill-in-the-Blank Questions
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Question Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blanks Count Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Number of Blanks *
              </label>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateForm({ blanksCount: 1 })}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
                    currentForm.blanksCount === 1
                      ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Hash size={20} />1 Blank
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateForm({ blanksCount: 2 })}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
                    currentForm.blanksCount === 2
                      ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Hash size={20} />2 Blanks
                </motion.button>
              </div>
            </div>

            {/* Question Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Question Statement *
              </label>
              <div className="space-y-3">
                <textarea
                  value={currentForm.question}
                  onChange={(e) => updateForm({ question: e.target.value })}
                  placeholder={`Enter your question with ${
                    currentForm.blanksCount
                  } blank${
                    currentForm.blanksCount === 1 ? "" : "s"
                  } using "___" (three underscores)\nExample: "What is 5 + 3 = ___?" or "Calculate ___ + ___ = 10"`}
                  rows={4}
                  className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 font-comic resize-none"
                />

                {/* Blank count validation */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Blanks found:</span>
                    <span
                      className={`font-bold ${
                        countBlanks(currentForm.question) ===
                        currentForm.blanksCount
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {countBlanks(currentForm.question)}
                    </span>
                    <span className="text-gray-600">
                      (expected: {currentForm.blanksCount})
                    </span>
                  </div>

                  {countBlanks(currentForm.question) !==
                    currentForm.blanksCount &&
                    currentForm.question.trim() && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={16} />
                        <span>
                          Please use exactly {currentForm.blanksCount} blank
                          {currentForm.blanksCount === 1 ? "" : "s"} (___)
                        </span>
                      </div>
                    )}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Use &quot;___&quot; (three underscores) to create blanks. Example: &quot;What
                is 2 + 3 = ___?&quot;
              </p>
            </div>

            {/* Audio Section (Optional) */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-3 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎤 Audio Guide{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (Optional)
                </span>
              </h3>

              <div className="space-y-4">
                {/* Recording Section */}
                <div className="bg-white p-4 rounded-xl border-2 border-purple-300">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Mic className="text-purple-600" size={18} />
                    Record Audio
                  </h4>

                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startRecording}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <Mic size={16} />
                        Start Recording
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <Square size={16} />
                        Stop Recording
                      </motion.button>
                    )}

                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-semibold">
                          Recording... {formatTime(recordingTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {audioPreviewUrl && selectedAudioFile && (
                    <div className="mt-4">
                      <audio
                        ref={audioElementRef}
                        src={audioPreviewUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700 font-semibold">
                            Recording ready! (
                            {Math.round(selectedAudioFile.size / 1024)}KB)
                          </span>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={isPlaying ? pauseAudio : playAudio}
                              className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-all duration-300"
                            >
                              {isPlaying ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleAudioUpload}
                              disabled={isUploadingAudio}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-1 disabled:opacity-50"
                            >
                              {isUploadingAudio ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Upload size={14} />
                              )}
                              Upload
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div className="bg-white p-4 rounded-xl border-2 border-purple-300">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Upload className="text-purple-600" size={18} />
                    Upload Audio File
                  </h4>

                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      ref={audioFileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileSelect}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="bg-purple-100 p-3 rounded-full">
                        <FileAudio className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Click to upload audio file
                        </p>
                        <p className="text-xs text-gray-500">
                          MP3, WAV, OGG up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Audio Preview/Upload */}
                {selectedAudioFile && !audioUrl && (
                  <div className="bg-white p-4 rounded-xl border-2 border-purple-300">
                    <audio controls src={audioPreviewUrl} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                    <div className="flex gap-3 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAudioUpload}
                        disabled={isUploadingAudio}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingAudio ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Upload Audio
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearAudio}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Uploaded Audio Display */}
                {audioUrl && (
                  <div className="bg-white p-4 rounded-xl border-2 border-green-300">
                    <audio controls src={audioUrl} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <Check size={18} />
                        <span className="font-semibold">
                          Audio uploaded successfully!
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearAudio}
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                      >
                        Replace
                      </motion.button>
                    </div>
                  </div>
                )}

                {audioUploadError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle size={18} />
                      <span className="font-semibold">{audioUploadError}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Answer Options *
              </label>
              <div className="space-y-3">
                {currentForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300"
                    />
                    {currentForm.options.length > 2 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeOption(index)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300"
                      >
                        <Minus size={16} />
                      </motion.button>
                    )}
                  </div>
                ))}

                {currentForm.options.length < 6 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addOption}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Option
                  </motion.button>
                )}
              </div>
            </div>

            {/* Correct Answers */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                Correct Answer{currentForm.blanksCount === 1 ? "" : "s"} *
              </label>
              <div className="space-y-3">
                {currentForm.correctAnswers.map((answer, index) => (
                  <div key={index}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {currentForm.blanksCount === 1
                        ? "Correct Answer"
                        : `Blank ${index + 1} Answer`}
                    </label>
                    <select
                      value={answer}
                      onChange={(e) =>
                        updateCorrectAnswer(index, e.target.value)
                      }
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white"
                    >
                      <option value="">Select correct answer...</option>
                      {currentForm.options.map((option, optIndex) => (
                        <option
                          key={optIndex}
                          value={option}
                          disabled={!option.trim()}
                        >
                          {option.trim()
                            ? `${String.fromCharCode(65 + optIndex)}: ${option}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {currentForm.question && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-3 border-purple-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Preview
                </h4>
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <p className="text-gray-800 font-semibold mb-4">
                    {currentForm.question}
                  </p>
                  {audioUrl && (
                    <div className="mb-4">
                      <audio controls src={audioUrl} className="w-full">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {currentForm.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 ${
                          currentForm.correctAnswers.includes(option) &&
                          option.trim()
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <span className="font-semibold text-gray-700">
                          {String.fromCharCode(65 + index)}: {option || "..."}
                        </span>
                      </div>
                    ))}
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
                placeholder="Explain why this answer is correct (optional)..."
                rows={3}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Help students understand the reasoning behind the answer
              </p>
            </div>

            {/* Validation Messages */}
            {!isValidForm && currentForm.question && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle size={16} />
                  <span className="font-semibold">
                    Please fix the following issues:
                  </span>
                </div>
                <ul className="text-red-600 text-sm space-y-1 ml-6">
                  {countBlanks(currentForm.question) !==
                    currentForm.blanksCount && (
                    <li>
                      • Question must have exactly {currentForm.blanksCount}{" "}
                      blank{currentForm.blanksCount === 1 ? "" : "s"} (___)
                    </li>
                  )}
                  {currentForm.options.some((option) => !option.trim()) && (
                    <li>• All answer options must be filled</li>
                  )}
                  {currentForm.correctAnswers.some(
                    (answer) => !answer.trim()
                  ) && <li>• All correct answers must be selected</li>}
                  {!currentForm.correctAnswers.every((answer) =>
                    currentForm.options.some(
                      (option) => option.trim() === answer.trim()
                    )
                  ) && (
                    <li>
                      • Correct answers must be selected from the available
                      options
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addMathQuestion}
              disabled={!isValidForm}
              className="w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={24} />
              Add Fill-in-the-Blank Question
            </motion.button>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl">
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

              {/* Audio Guidelines */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mt-4">
                <h4 className="font-bold text-blue-800 mb-2 text-sm">
                  🎵 Audio Guidelines
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Read question clearly</div>
                  <div>• Pronounce options distinctly</div>
                  <div>• Keep audio under 10MB</div>
                  <div>• Test playback quality</div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2 text-sm">
                  💡 Tips
                </h4>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>• Use clear, unambiguous language</li>
                  <li>• Vary difficulty progressively</li>
                  <li>• Include distractors in options</li>
                  <li>• Test questions thoroughly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Display Section */}
      {mathQuestions.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <BookOpen className="text-purple-600" size={24} />
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
                        const questionData = parseEquation(question.equation);
                        return (
                          <motion.div
                            key={question.originalIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{
                              scale:
                                editingIndex !== question.originalIndex
                                  ? 1.01
                                  : 1,
                            }}
                            className={`bg-white p-6 rounded-2xl border-3 shadow-lg hover:shadow-xl transition-all duration-300 ${
                              difficultyBgColors[difficulty]
                            } ${
                              editingIndex === question.originalIndex
                                ? "ring-4 ring-purple-300"
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
                                      disabled={!isValidEditForm}
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

                                {/* Edit form content would go here - similar to the main form */}
                                <div className="text-sm text-gray-600">
                                  Edit functionality can be expanded here...
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="text-lg font-bold text-gray-800 mb-3">
                                      {questionData.question}
                                    </div>

                                    {/* Audio player if available */}
                                    {questionData.audioUrl && (
                                      <div className="mb-4">
                                        <audio controls src={questionData.audioUrl} className="w-full">
                                          Your browser does not support the audio element.
                                        </audio>
                                      </div>
                                    )}

                                    {/* Answer options */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                      {questionData.options.map(
                                        (option, index) => (
                                          <div
                                            key={index}
                                            className={`p-2 rounded-lg border-2 text-sm ${
                                              questionData.correctAnswers.includes(
                                                option
                                              )
                                                ? "border-green-400 bg-green-50 text-green-700"
                                                : "border-gray-200 bg-gray-50 text-gray-700"
                                            }`}
                                          >
                                            <span className="font-semibold">
                                              {String.fromCharCode(65 + index)}:{" "}
                                              {option}
                                            </span>
                                            {questionData.correctAnswers.includes(
                                              option
                                            ) && (
                                              <span className="ml-2 text-green-600">
                                                ✓
                                              </span>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyBgColors[difficulty]} ${difficultyTextColors[difficulty]}`}
                                      >
                                        {question.difficulty}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {questionData.blanksCount} blank
                                        {questionData.blanksCount === 1
                                          ? ""
                                          : "s"}
                                      </div>
                                      {questionData.audioUrl && (
                                        <div className="text-xs text-purple-600 flex items-center gap-1">
                                          <FileAudio size={12} />
                                          Audio
                                        </div>
                                      )}
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
                                      className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 rounded-lg transition-all duration-300"
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
                                  Click to edit question
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
            No Fill-in-the-Blank Questions Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by adding your first fill-in-the-blank question above!
          </p>
        </div>
      )}
    </>
  );
};