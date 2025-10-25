"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Clock,
  Heart,
  Home,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
} from "lucide-react";

// Types
interface GameQuestion {
  id: string;
  left: number;
  right: number;
  correctOperator: "<" | ">" | "=";
  difficulty: "easy" | "medium" | "hard";
  startTime: number;
}

interface GameState {
  currentQuestionIndex: number;
  score: number;
  lives: number;
  timeLeft: number;
  isPlaying: boolean;
  isPaused: boolean;
  showCelebration: boolean;
  gameCompleted: boolean;
  selectedOperator: "<" | ">" | "=" | null;
  streak: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeTaken: number;
  questionStartTime: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  accuracy: number;
  time: number;
  date: string;
}

const AfricanVillageMathGame: React.FC = () => {
  // Game configuration
  const game = {
    Id: "1",
    Title: "Village Math Safari",
    Description: "Compare numbers and become the village math champion!",
    NumberOfQuestions: 10,
    Duration: 8,
  };

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    lives: 3,
    timeLeft: 480,
    isPlaying: false,
    isPaused: false,
    showCelebration: false,
    gameCompleted: false,
    selectedOperator: null,
    streak: 0,
    totalQuestions: 10,
    correctAnswers: 0,
    totalTimeTaken: 0,
    questionStartTime: 0,
  });

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);

  // Load leaderboard from memory
  useEffect(() => {
    const savedLeaderboard = [
      { name: "Amara", score: 2840, accuracy: 95, time: 180, date: "2024-12-20" },
      { name: "Kwame", score: 2650, accuracy: 90, time: 220, date: "2024-12-19" },
      { name: "Zara", score: 2480, accuracy: 85, time: 240, date: "2024-12-18" },
      { name: "Kofi", score: 2200, accuracy: 80, time: 280, date: "2024-12-17" },
      { name: "Asha", score: 1950, accuracy: 75, time: 320, date: "2024-12-16" },
    ];
    setLeaderboard(savedLeaderboard);
  }, []);

  // Generate random questions
  const generateQuestions = (count: number): GameQuestion[] => {
    const newQuestions: GameQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const difficulty = i < 3 ? "easy" : i < 7 ? "medium" : "hard";
      let left: number, right: number;

      switch (difficulty) {
        case "easy":
          left = Math.floor(Math.random() * 20) + 1;
          right = Math.floor(Math.random() * 20) + 1;
          break;
        case "medium":
          left = Math.floor(Math.random() * 75) + 1;
          right = Math.floor(Math.random() * 75) + 1;
          break;
        case "hard":
          left = Math.floor(Math.random() * 150) + 1;
          right = Math.floor(Math.random() * 150) + 1;
          break;
      }

      const correctOperator: "<" | ">" | "=" =
        left < right ? "<" : left > right ? ">" : "=";

      newQuestions.push({
        id: `q-${i}`,
        left,
        right,
        correctOperator,
        difficulty,
        startTime: 0,
      });
    }

    return newQuestions;
  };

  // Initialize questions on component mount
  useEffect(() => {
    const questionCount = game.NumberOfQuestions || 10;
    const newQuestions = generateQuestions(questionCount);
    setQuestions(newQuestions);
    setGameState((prev) => ({
      ...prev,
      totalQuestions: questionCount,
      timeLeft: (game.Duration || 8) * 60,
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState.timeLeft === 0 && gameState.isPlaying) {
      setGameState((prev) => ({
        ...prev,
        gameCompleted: true,
        isPlaying: false,
      }));
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeLeft]);

  // Set question start time when a new question appears
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && questions[gameState.currentQuestionIndex]) {
      setGameState(prev => ({ ...prev, questionStartTime: Date.now() }));
    }
  }, [gameState.currentQuestionIndex, gameState.isPlaying, gameState.isPaused]);

  // Calculate time-based score
  const calculateScore = (timeTaken: number, difficulty: string): number => {
    const baseScore = difficulty === "easy" ? 100 : difficulty === "medium" ? 150 : 200;
    const maxTime = difficulty === "easy" ? 15 : difficulty === "medium" ? 25 : 35;
    const timeBonus = Math.max(0, maxTime - timeTaken) * 10;
    return Math.floor(baseScore + timeBonus);
  };

  // Handle answer submission
  const handleAnswerSubmit = () => {
    if (!gameState.selectedOperator || !questions[gameState.currentQuestionIndex]) return;

    const currentQuestion = questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedOperator === currentQuestion.correctOperator;
    const timeTaken = (Date.now() - gameState.questionStartTime) / 1000;

    if (isCorrect) {
      const questionScore = calculateScore(timeTaken, currentQuestion.difficulty);
      const streakBonus = gameState.streak * 50;
      const totalQuestionScore = questionScore + streakBonus;

      setGameState((prev) => ({
        ...prev,
        score: prev.score + totalQuestionScore,
        streak: prev.streak + 1,
        correctAnswers: prev.correctAnswers + 1,
        showCelebration: true,
        selectedOperator: null,
        totalTimeTaken: prev.totalTimeTaken + timeTaken,
      }));

      setTimeout(() => {
        setGameState((prev) => {
          const nextIndex = prev.currentQuestionIndex + 1;
          if (nextIndex >= questions.length) {
            return {
              ...prev,
              gameCompleted: true,
              isPlaying: false,
              showCelebration: false,
            };
          }
          return {
            ...prev,
            currentQuestionIndex: nextIndex,
            showCelebration: false,
          };
        });
      }, 1500);
    } else {
      setGameState((prev) => ({
        ...prev,
        lives: prev.lives - 1,
        streak: 0,
        selectedOperator: null,
        totalTimeTaken: prev.totalTimeTaken + timeTaken,
      }));

      if (gameState.lives <= 1) {
        setGameState((prev) => ({
          ...prev,
          gameCompleted: true,
          isPlaying: false,
        }));
      }
    }
  };

  // Add player to leaderboard
  const addToLeaderboard = () => {
    if (!playerName.trim()) return;

    const accuracy = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: gameState.score,
      accuracy,
      time: Math.round(gameState.totalTimeTaken),
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    setShowNameInput(false);
    setShowLeaderboard(true);
  };

  // Game control functions
  const startGame = () => {
    setShowInstructions(false);
    setGameState((prev) => ({ ...prev, isPlaying: true, questionStartTime: Date.now() }));
  };

  const pauseGame = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const restartGame = () => {
    const newQuestions = generateQuestions(game?.NumberOfQuestions || 10);
    setQuestions(newQuestions);
    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lives: 3,
      timeLeft: (game?.Duration || 8) * 60,
      isPlaying: true,
      isPaused: false,
      showCelebration: false,
      gameCompleted: false,
      selectedOperator: null,
      streak: 0,
      totalQuestions: game?.NumberOfQuestions || 10,
      correctAnswers: 0,
      totalTimeTaken: 0,
      questionStartTime: Date.now(),
    });
    setShowInstructions(false);
    setShowNameInput(false);
    setShowLeaderboard(false);
  };

  const goHome = () => {
    console.log("Going home");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[gameState.currentQuestionIndex];

  return (
    <>
      <div className="min-h-screen relative">
        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn">
            <div className="bg-gradient-to-br from-orange-100 to-yellow-100 border-2 sm:border-4 border-orange-400 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-w-xs sm:max-w-md w-full shadow-2xl animate-slideUp mx-2">
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-3xl sm:text-6xl mb-2 sm:mb-3">🏘️</div>
                <h2 className="text-lg sm:text-3xl font-bold text-orange-800 mb-1 sm:mb-2">
                  {game.Title}
                </h2>
                <p className="text-orange-700 text-xs sm:text-lg font-medium">{game.Description}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-4 border-2 border-orange-300">
                <h3 className="text-sm sm:text-xl font-bold text-orange-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-2xl">🎯</span>
                  How to Play
                </h3>
                <ul className="space-y-1 sm:space-y-2 text-orange-700 font-medium text-xs sm:text-base">
                  <li className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">🔢</span>
                    Compare numbers with &lt;, =, or &gt;
                  </li>
                  <li className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">⚡</span>
                    Answer quickly for bonus points!
                  </li>
                  <li className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">❤️</span>
                    You have 3 lives - be careful!
                  </li>
                  <li className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">🏆</span>
                    Join the leaderboard after playing!
                  </li>
                </ul>
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center mb-2 sm:mb-0">
                <button
                  onClick={goHome}
                  className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-2 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Home size={14} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <button
                  onClick={startGame}
                  className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-8 py-1.5 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Play size={14} className="sm:w-5 sm:h-5" />
                  Start Safari!
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="text-orange-600 hover:text-orange-800 font-medium text-xs sm:text-sm underline"
                >
                  View Leaderboard 🏆
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Name Input Modal */}
        {showNameInput && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 border-2 sm:border-4 border-green-400 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl animate-slideUp mx-2">
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-3xl sm:text-6xl mb-2 sm:mb-3">🏆</div>
                <h2 className="text-lg sm:text-2xl font-bold text-green-800 mb-1 sm:mb-2">
                  Join the Leaderboard!
                </h2>
                <p className="text-green-700 text-xs sm:text-base">Enter your name to save your score</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-green-700 font-medium mb-1 sm:mb-2 text-xs sm:text-base">Your Name:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-green-300 focus:border-green-500 focus:outline-none text-sm sm:text-lg font-medium"
                  placeholder="Enter your name..."
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && addToLeaderboard()}
                />
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => setShowNameInput(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Skip
                </button>
                <button
                  onClick={addToLeaderboard}
                  disabled={!playerName.trim()}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                >
                  Save Score!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 sm:border-4 border-purple-400 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-w-sm sm:max-w-lg w-full shadow-2xl animate-slideUp mx-2 max-h-[95vh] overflow-y-auto">
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-3xl sm:text-6xl mb-2 sm:mb-3">🏆</div>
                <h2 className="text-lg sm:text-3xl font-bold text-purple-800 mb-1 sm:mb-2">
                  Village Champions
                </h2>
                <p className="text-purple-700 text-xs sm:text-base">Top Math Safari Explorers</p>
              </div>

              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6 max-h-60 sm:max-h-80 overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-200 to-yellow-300 border-yellow-400"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400"
                        : index === 2
                        ? "bg-gradient-to-r from-orange-200 to-orange-300 border-orange-400"
                        : "bg-white border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-500 text-white" :
                        index === 2 ? "bg-orange-500 text-white" :
                        "bg-purple-500 text-white"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-purple-800 text-xs sm:text-base truncate max-w-20 sm:max-w-none">{entry.name}</div>
                        <div className="text-xs text-purple-600">{entry.accuracy}% • {entry.time}s</div>
                      </div>
                    </div>
                    <div className="font-bold text-purple-800 text-xs sm:text-lg">{entry.score}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Completed Modal */}
        {gameState.gameCompleted && !showNameInput && !showLeaderboard && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 animate-fadeIn">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 sm:border-4 border-yellow-400 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl text-center animate-bounceIn mx-2">
              <div className="text-4xl sm:text-8xl mb-3 sm:mb-4 animate-bounce">
                {gameState.correctAnswers >= gameState.totalQuestions * 0.8 ? "🏆" : "💪"}
              </div>

              <h2 className="text-lg sm:text-3xl font-bold text-orange-800 mb-3 sm:mb-4">
                {gameState.correctAnswers >= gameState.totalQuestions * 0.8 ? "Amazing Safari!" : "Good Adventure!"}
              </h2>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-3 sm:mb-4 border-2 border-yellow-300">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-blue-300">
                    <div className="text-sm sm:text-2xl font-bold text-blue-700">{gameState.score}</div>
                    <div className="text-xs font-medium text-blue-600">Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-green-300">
                    <div className="text-sm sm:text-2xl font-bold text-green-700">{gameState.correctAnswers}</div>
                    <div className="text-xs font-medium text-green-600">Correct</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-purple-300">
                    <div className="text-sm sm:text-2xl font-bold text-purple-700">
                      {Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)}%
                    </div>
                    <div className="text-xs font-medium text-purple-600">Accuracy</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-orange-300">
                    <div className="text-sm sm:text-2xl font-bold text-orange-700">{Math.round(gameState.totalTimeTaken)}s</div>
                    <div className="text-xs font-medium text-orange-600">Time</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center mb-3 sm:mb-4">
                <button
                  onClick={goHome}
                  className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-2 sm:px-5 py-1.5 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Home size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Home</span>
                </button>
                <button
                  onClick={restartGame}
                  className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2 sm:px-5 py-1.5 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Play Again</span>
                </button>
              </div>

              <button
                onClick={() => setShowNameInput(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🏆 Join Leaderboard!
              </button>
            </div>
          </div>
        )}

        {/* Main Game Interface */}
        <div className="h-screen flex flex-col">
          {/* Header - Ultra Compact for Mobile */}
          <header className="bg-gradient-to-r from-orange-400/90 to-yellow-400/90 backdrop-blur-sm border-b-2 sm:border-b-4 border-orange-500 p-1 sm:p-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-4">
                <button
                  onClick={goHome}
                  className="bg-white/90 hover:bg-white text-orange-700 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-orange-300"
                >
                  <Home size={16} className="sm:w-6 sm:h-6" />
                </button>
                <div>
                  <h1 className="text-sm sm:text-2xl font-bold text-white drop-shadow-lg leading-tight">{game.Title}</h1>
                  <p className="text-orange-100 font-medium text-xs sm:text-base leading-tight">
                    Q{gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-white/90 px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg sm:rounded-2xl border border-yellow-400 shadow-lg">
                  <Star size={12} className="text-yellow-600 sm:w-4 sm:h-4" />
                  <span className="font-bold text-yellow-700 text-xs sm:text-lg">{gameState.score}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/90 px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg sm:rounded-2xl border border-red-400 shadow-lg">
                  <Heart size={12} className="text-red-600 sm:w-4 sm:h-4" />
                  <span className="font-bold text-red-700 text-xs sm:text-lg">{gameState.lives}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/90 px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg sm:rounded-2xl border border-blue-400 shadow-lg">
                  <Clock size={12} className="text-blue-600 sm:w-4 sm:h-4" />
                  <span className="font-bold text-blue-700 text-xs sm:text-lg">{formatTime(gameState.timeLeft)}</span>
                </div>
                {gameState.streak > 0 && (
                  <div className="flex items-center gap-1 bg-white/90 px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg sm:rounded-2xl border border-orange-400 shadow-lg animate-pulse">
                    <span className="text-xs sm:text-xl">🔥</span>
                    <span className="font-bold text-orange-700 text-xs sm:text-lg">{gameState.streak}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Game Play Area - Optimized for Small Screens */}
          <main className="flex-1 flex flex-col justify-center p-2 sm:p-6 relative overflow-hidden">
            {gameState.isPlaying && !gameState.gameCompleted && currentQuestion ? (
              <div className="h-full flex flex-col justify-between">
                {/* Pause overlay */}
                {gameState.isPaused && (
                  <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 border-2 sm:border-4 border-blue-400 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center shadow-2xl animate-slideUp">
                      <div className="text-3xl sm:text-6xl mb-3 sm:mb-4">⏸️</div>
                      <h3 className="text-lg sm:text-2xl font-bold text-blue-700 mb-3 sm:mb-4">Safari Paused</h3>
                      <button
                        onClick={pauseGame}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Continue Safari!
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Header - Compact */}
                <div className="text-center mb-2 sm:mb-8">
                  <h2 className="text-lg sm:text-4xl font-bold text-white drop-shadow-lg mb-2 sm:mb-4 animate-slideDown">
                    Compare the Numbers!
                  </h2>
                  <div className="inline-block bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-2xl px-3 sm:px-6 py-1 sm:py-3 border-2 sm:border-3 shadow-lg">
                    <span className={`text-xs sm:text-lg font-bold ${
                      currentQuestion.difficulty === "easy"
                        ? "text-green-600"
                        : currentQuestion.difficulty === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                      {currentQuestion.difficulty === "easy" && "🟢 EASY"}
                      {currentQuestion.difficulty === "medium" && "🟡 MEDIUM"}
                      {currentQuestion.difficulty === "hard" && "🔴 HARD"}
                    </span>
                  </div>
                </div>

                {/* Main Question - Mobile Optimized Stack Layout */}
                <div className="flex-1 flex items-center justify-center px-1">
                  <div className="flex flex-col items-center justify-center gap-3 sm:gap-8 w-full max-w-sm sm:max-w-4xl">
                    
                    {/* Numbers - Vertical Stack on Mobile for Better Space Usage */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 w-full">
                      {/* Left Number */}
                      <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm rounded-xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 border-blue-400 shadow-xl text-center w-full max-w-[140px] sm:min-w-[180px] hover:shadow-2xl transition-all duration-300 animate-slideInLeft">
                        <span className="text-3xl sm:text-6xl lg:text-8xl font-bold text-blue-700 block drop-shadow-lg">
                          {currentQuestion.left}
                        </span>
                      </div>

                      {/* VS indicator - Horizontal line on mobile */}
                      <div className="flex items-center justify-center">
                        <div className="text-lg sm:text-4xl font-bold text-white drop-shadow-lg transform rotate-90 sm:rotate-0">
                          VS
                        </div>
                      </div>

                      {/* Right Number */}
                      <div className="bg-gradient-to-br from-white to-green-50 backdrop-blur-sm rounded-xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 border-green-400 shadow-xl text-center w-full max-w-[140px] sm:min-w-[180px] hover:shadow-2xl transition-all duration-300 animate-slideInRight">
                        <span className="text-3xl sm:text-6xl lg:text-8xl font-bold text-green-700 block drop-shadow-lg">
                          {currentQuestion.right}
                        </span>
                      </div>
                    </div>

                    {/* Operator Selection - Compact Mobile Design */}
                    <div className="flex flex-row gap-3 sm:gap-6 justify-center w-full">
                      {(["<", "=", ">"] as const).map((operator) => {
                        const isSelected = gameState.selectedOperator === operator;
                        return (
                          <button
                            key={operator}
                            onClick={() =>
                              setGameState((prev) => ({
                                ...prev,
                                selectedOperator: operator,
                              }))
                            }
                            className={`w-12 h-12 sm:w-24 sm:h-24 lg:w-28 lg:h-28 text-xl sm:text-4xl lg:text-5xl font-bold rounded-lg sm:rounded-2xl transition-all duration-300 border-2 sm:border-4 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 ${
                              isSelected
                                ? "bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 shadow-2xl scale-110 animate-pulse"
                                : "bg-gradient-to-br from-white to-yellow-50 text-orange-600 border-orange-400 hover:from-yellow-50 hover:to-orange-100 hover:border-orange-500"
                            }`}
                          >
                            {operator}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Controls - Ultra Compact for Mobile */}
                <div className="mt-2 sm:mt-8">
                  <div className="flex flex-col gap-2 sm:gap-6">
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!gameState.selectedOperator}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm sm:text-2xl py-3 sm:py-6 px-4 sm:px-8 rounded-lg sm:rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-300 border-2 sm:border-4 border-white/30 hover:scale-105 active:scale-95"
                    >
                      {gameState.selectedOperator ? "🎯 Submit!" : "❓ Choose First"}
                    </button>

                    <div className="grid grid-cols-4 gap-1 sm:gap-4 sm:flex sm:justify-center">
                      <button
                        onClick={pauseGame}
                        disabled={!gameState.isPlaying}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 border border-white/30 hover:scale-105 active:scale-95"
                      >
                        {gameState.isPaused ? <Play size={12} className="sm:w-5 sm:h-5" /> : <Pause size={12} className="sm:w-5 sm:h-5" />}
                        <span className="hidden sm:inline">{gameState.isPaused ? "Resume" : "Pause"}</span>
                      </button>

                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 border border-white/30 hover:scale-105 active:scale-95"
                      >
                        {soundEnabled ? <Volume2 size={12} className="sm:w-5 sm:h-5" /> : <VolumeX size={12} className="sm:w-5 sm:h-5" />}
                        <span className="hidden sm:inline">Sound</span>
                      </button>

                      <button
                        onClick={() => setShowLeaderboard(true)}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 border border-white/30 hover:scale-105 active:scale-95"
                      >
                        <Trophy size={12} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Board</span>
                      </button>

                      <button
                        onClick={goHome}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 border border-white/30 hover:scale-105 active:scale-95"
                      >
                        <Home size={12} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Home</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>

        {/* Success Message - Mobile Optimized */}
        {gameState.showCelebration && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-bounceIn">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-8 py-2 sm:py-4 rounded-lg sm:rounded-2xl font-bold text-sm sm:text-xl shadow-2xl border-2 sm:border-4 border-white/30 mx-2">
              <div className="flex items-center gap-1 sm:gap-3">
                <span className="text-lg sm:text-3xl">🎉</span>
                <span>Correct! +{10 + (gameState.streak - 1) * 2}pts!</span>
                <span className="text-lg sm:text-3xl">✨</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3) translate(-50%, -50%); opacity: 0; }
          50% { transform: scale(1.05) translate(-50%, -50%); }
          70% { transform: scale(0.9) translate(-50%, -50%); }
          100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.5s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.5s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.6s ease-out; }
        
        .border-3 { border-width: 3px; }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }

        /* Custom responsive utilities */
    

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .animate-slideInLeft,
          .animate-slideInRight {
            animation-duration: 0.3s;
          }
          
          /* Ensure buttons don't get too small */
          button {
            min-height: 32px;
          }
          
          /* Better text wrapping on small screens */
          .truncate {
            max-width: 80px;
          }
        }

        /* Ultra small screens (< 375px) */
        @media (max-width: 374px) {
          .text-xs { font-size: 0.65rem; }
          .gap-1 { gap: 0.125rem; }
          .p-1 { padding: 0.125rem; }
          .px-1 { padding-left: 0.125rem; padding-right: 0.125rem; }
          .py-1 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
        }
      `}</style>
    </>
  );
};

export default AfricanVillageMathGame;