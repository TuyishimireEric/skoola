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
  Upload,
  Camera,
  Loader2,
  Mic,
  Play,
  Pause,
  Square,
  FileAudio,
  Headphones,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MathQuestionInput, DifficultyLevel } from "@/types/Questions";
import showToast from "@/utils/showToast";
import { uploadImage, uploadAudio } from "@/server/actions";

interface ReadingComponentProps {
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

interface ReadingProblem {
  imageUrl: string;
  textToRead: string;
  audioUrl: string;
}

export const Reading: React.FC<ReadingComponentProps> = ({
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

  // Reading problem creation states
  const [imageUrl, setImageUrl] = useState("");
  const [textToRead, setTextToRead] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // Image upload states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Audio upload states
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string>("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>("");
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse reading problem from equation string
  const parseReadingProblem = (equation: string): ReadingProblem => {
    try {
      const parts = equation.split("|");
      if (parts.length >= 3) {
        const imageUrl = parts[0] || "";
        const textToRead = parts[1] || "";
        const audioUrl = parts[2] || "";

        return { imageUrl, textToRead, audioUrl };
      }
    } catch (error) {
      console.error("Error parsing reading problem:", error);
    }

    return {
      imageUrl: "",
      textToRead: "",
      audioUrl: "",
    };
  };

  // Create equation string from reading problem data
  const createReadingProblemString = (data: ReadingProblem): string => {
    return `${data.imageUrl}|${data.textToRead}|${data.audioUrl}`;
  };

  // Generate current problem data
  const getCurrentProblemData = (): ReadingProblem => {
    return {
      imageUrl: imageUrl.trim(),
      textToRead: textToRead.trim(),
      audioUrl: audioUrl.trim(),
    };
  };

  // Update parent equation when inputs change
  useEffect(() => {
    const problemData = getCurrentProblemData();
    const equationString = createReadingProblemString(problemData);

    if (equationString !== newEquation) {
      setNewEquation(equationString);
    }
  }, [imageUrl, textToRead, audioUrl]);

  // Sync with parent state
  useEffect(() => {
    const currentData = parseReadingProblem(newEquation);
    if (
      currentData.imageUrl ||
      currentData.textToRead ||
      currentData.audioUrl
    ) {
      setImageUrl(currentData.imageUrl);
      setTextToRead(currentData.textToRead);
      setAudioUrl(currentData.audioUrl);
    }
  }, [newEquation]);

  // Image handling functions
  const handleImageFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setImageUploadError(
          "Please select an image file (PNG, JPG, GIF, etc.)"
        );
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError("Image size should be less than 5MB");
        return;
      }

      setSelectedImageFile(file);
      setImageUploadError("");

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImageFile) return;

    setIsUploadingImage(true);
    setImageUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const result = await uploadImage(formData);

      if (result.success && result.image) {
        setImageUrl(result.image.secure_url);
        showToast("Image uploaded successfully", "success");
      }

      setSelectedImageFile(null);
      setImagePreviewUrl("");
    } catch (error) {
      console.error("Image upload error:", error);
      setImageUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setImageUploadError("");
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
  };

  // Audio handling functions
  const handleAudioFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("audio/")) {
        setAudioUploadError(
          "Please select an audio file (MP3, WAV, OGG, etc.)"
        );
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

      const result = await uploadAudio(formData);

      if (result.success && result.audio) {
        setAudioUrl(result.audio.secure_url);
        showToast("Audio uploaded successfully", "success");
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

  // Validation
  const validateReadingProblem = (): boolean => {
    const data = getCurrentProblemData();
    return data.textToRead.trim() !== "" && data.audioUrl.trim() !== "";
  };

  const isValidProblem = validateReadingProblem();

  // Handle add question
  const handleAddQuestion = () => {
    if (isValidProblem) {
      addMathQuestion();
      clearAllInputs();
    }
  };

  const clearAllInputs = () => {
    setImageUrl("");
    setTextToRead("");
    setAudioUrl("");
    setSelectedImageFile(null);
    setSelectedAudioFile(null);
    setImagePreviewUrl("");
    setAudioPreviewUrl("");
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = "";
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
      const editData = parseReadingProblem(editForm.equation);
      const isValidEdit =
        editData.textToRead.trim() !== "" && editData.audioUrl.trim() !== "";

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
  const editData = parseReadingProblem(editForm.equation);
  const updateEditEquation = (
    imageUrl: string,
    textToRead: string,
    audioUrl: string
  ) => {
    const data: ReadingProblem = { imageUrl, textToRead, audioUrl };
    const equationString = createReadingProblemString(data);
    setEditForm({ ...editForm, equation: equationString });
  };
  const isValidEditProblem =
    editData.textToRead.trim() !== "" && editData.audioUrl.trim() !== "";

  return (
    <>
      {/* Empty State */}
      {mathQuestions.length === 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-4 border-gray-200 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Reading Exercises Created Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Start by creating your first reading exercise with text and audio!
          </p>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-emerald-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <BookOpen className="text-emerald-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Add Reading Exercises
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add New Exercise Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input Section */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-2xl border-3 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📝 Text to Read
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter the text students should read *
                </label>
                <textarea
                  value={textToRead}
                  onChange={(e) => setTextToRead(e.target.value)}
                  placeholder="e.g., The cat sat on the mat. It was a sunny day."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-lg resize-none"
                />
                <p className="text-gray-500 text-sm mt-2">
                  This text will be displayed to students for reading practice.
                </p>
              </div>
              {textToRead && (
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-blue-300">
                    <span className="text-sm text-gray-600 block mb-2">
                      Preview:
                    </span>
                    <span className="text-lg text-gray-800 leading-relaxed">
                      {textToRead}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-3 border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎤 Audio Recording/Upload
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

            {/* Image Upload Section (Optional) */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-3 border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📸 Supporting Image{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (Optional)
                </span>
              </h3>

              {!imageUrl && !imagePreviewUrl && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="bg-orange-100 p-3 rounded-full">
                        <Camera className="text-orange-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {imagePreviewUrl && !imageUrl && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-orange-300">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage ? (
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

              {imageUploadError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={18} />
                    <span className="font-semibold">{imageUploadError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reading Exercise Preview */}
            {textToRead && audioUrl && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border-3 border-emerald-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👁️ Reading Exercise Preview
                </h3>
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-300">
                  {imageUrl && (
                    <div className="mb-4">
                      <img
                        src={imageUrl}
                        alt="Reading exercise"
                        className="w-32 h-24 object-contain rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">
                        📝 Text to Read:
                      </span>
                      <p className="text-lg text-gray-800 leading-relaxed bg-blue-50 p-3 rounded-lg">
                        {textToRead}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">
                        🎧 Audio Guide:
                      </span>
                      <audio controls src={audioUrl} className="w-full">
                        Your browser does not support the audio element.
                      </audio>
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
                Easy: Simple words, Medium: Common phrases, Hard: Complex
                sentences
              </p>
            </div>

            {/* Explanation Input */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Reading Notes{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Add any notes about pronunciation, meaning, or context..."
                rows={4}
                className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 font-comic resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                Provide additional context or guidance for the reading exercise
              </p>
            </div>

            {/* Validation Message */}
            {(textToRead.trim() || audioUrl.trim()) && !isValidProblem && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={20} />
                  <span className="font-semibold">
                    Please provide both text to read and audio recording/upload
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
              Add Reading Exercise
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
                  <div className="text-sm text-gray-600">Total Exercises</div>
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

              {/* Reading Guidelines */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mt-4">
                <h4 className="font-bold text-blue-800 mb-2 text-sm">
                  📖 Reading Guidelines
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Clear pronunciation in audio</div>
                  <div>• Appropriate reading pace</div>
                  <div>• Match audio to text exactly</div>
                  <div>• Use simple, clear language</div>
                  <div>• Audio max: 10MB</div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2 text-sm">
                  💡 Tips
                </h4>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>• Use microphone for best quality</li>
                  <li>• Read slowly and clearly</li>
                  <li>• Include supporting images</li>
                  <li>• Test audio before uploading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Display Section */}
      {mathQuestions.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-teal-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-3 rounded-2xl">
                <Headphones className="text-teal-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Created Reading Exercises ({mathQuestions.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Organized by difficulty</span>
            </div>
          </div>

          {/* Exercises by Difficulty */}
          <div className="space-y-6">
            {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map(
              (difficulty) => {
                const exercisesForDifficulty =
                  groupedQuestions[difficulty] || [];

                if (exercisesForDifficulty.length === 0) return null;

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
                        {difficulty} ({exercisesForDifficulty.length})
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                      {exercisesForDifficulty.map((exercise) => {
                        const exerciseData = parseReadingProblem(
                          exercise.equation
                        );

                        return (
                          <motion.div
                            key={exercise.originalIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{
                              scale:
                                editingIndex !== exercise.originalIndex
                                  ? 1.02
                                  : 1,
                            }}
                            className={`bg-white p-6 rounded-2xl border-3 shadow-lg hover:shadow-xl transition-all duration-300 ${
                              difficultyBgColors[difficulty]
                            } ${
                              editingIndex === exercise.originalIndex
                                ? "ring-4 ring-teal-300"
                                : ""
                            }`}
                          >
                            {editingIndex === exercise.originalIndex ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-gray-800">
                                    Edit Reading Exercise
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

                                {/* Edit Text */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Text to Read
                                  </label>
                                  <textarea
                                    value={editData.textToRead}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        editData.imageUrl,
                                        e.target.value,
                                        editData.audioUrl
                                      )
                                    }
                                    rows={3}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Enter text to read..."
                                  />
                                </div>

                                {/* Edit Image URL */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Image URL (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.imageUrl}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        e.target.value,
                                        editData.textToRead,
                                        editData.audioUrl
                                      )
                                    }
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-all duration-300"
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

                                {/* Edit Audio URL */}
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Audio URL
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.audioUrl}
                                    onChange={(e) =>
                                      updateEditEquation(
                                        editData.imageUrl,
                                        editData.textToRead,
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-all duration-300"
                                    placeholder="Enter audio URL..."
                                  />
                                  {editData.audioUrl && (
                                    <audio
                                      controls
                                      src={editData.audioUrl}
                                      className="w-full"
                                    >
                                      Your browser does not support the audio
                                      element.
                                    </audio>
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
                                    Reading Notes
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
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Optional reading notes..."
                                  />
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {/* Exercise Display */}
                                    <div className="mb-4">
                                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200 mb-3">
                                        <div className="flex flex-col gap-4">
                                          {exerciseData.imageUrl && (
                                            <div className="flex-shrink-0">
                                              <img
                                                src={exerciseData.imageUrl}
                                                alt="Reading Exercise"
                                                className="w-full sm:w-32 h-32 object-contain rounded-lg border-2 border-gray-200"
                                                onError={(e) => {
                                                  e.currentTarget.src =
                                                    "/api/placeholder/128/128";
                                                  e.currentTarget.alt =
                                                    "Image not available";
                                                }}
                                              />
                                            </div>
                                          )}

                                          <div className="flex-1">
                                            <span className="text-sm text-gray-600 block mb-2">
                                              📖 Text to Read:
                                            </span>
                                            <p className="text-lg text-gray-800 leading-relaxed bg-white p-3 rounded-lg border">
                                              {exerciseData.textToRead}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Audio Player */}
                                      <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
                                        <span className="text-sm text-gray-600 block mb-2">
                                          🎧 Audio Guide:
                                        </span>
                                        <audio
                                          controls
                                          src={exerciseData.audioUrl}
                                          className="w-full"
                                        >
                                          Your browser does not support the
                                          audio element.
                                        </audio>
                                      </div>
                                    </div>

                                    <div
                                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficultyBgColors[difficulty]} ${difficultyTextColors[difficulty]}`}
                                    >
                                      {exercise.difficulty}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        startEditing(
                                          exercise.originalIndex,
                                          exercise
                                        )
                                      }
                                      className="bg-teal-100 hover:bg-teal-200 text-teal-600 p-2 rounded-lg transition-all duration-300"
                                      title="Edit exercise"
                                    >
                                      <Edit3 size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() =>
                                        removeMathQuestion(
                                          exercise.originalIndex
                                        )
                                      }
                                      className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300"
                                      title="Delete exercise"
                                    >
                                      <Trash2 size={16} />
                                    </motion.button>
                                  </div>
                                </div>

                                {exercise.explanation && (
                                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                                    <div className="flex items-start gap-2">
                                      <div className="text-yellow-500 mt-0.5">
                                        💡
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                          Reading Notes:
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                          {exercise.explanation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Edit hint overlay */}
                                <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
                                  Click edit button to modify this reading
                                  exercise
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
