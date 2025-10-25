"use client";

import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import { GameDataI } from "@/types/Course";
import { Characters } from "./Characters";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useDialog } from "@/hooks/dialog/useDialog";
import DialogInstructions from "./Instructions";
import { DialogLineI } from "@/types/Dialog";
import { formatDialogQuestions } from "@/utils/FormatQuestions";

interface DialogProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

const Dialog: React.FC<DialogProps> = ({
  questionData,
  onBack,
  onComplete,
}) => {
  const [gameState, setGameState] = useState<
    "instructions" | "playing" | "gameOver"
  >("instructions");
  const [isBrowser, setIsBrowser] = useState(false);
  const [autoAdvanceTimeout, setAutoAdvanceTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [startTime] = useState(new Date().toISOString());
  const [parsedDialogLines, setParsedDialogLines] = useState<DialogLineI[]>([]);

  const {
    dialogLines,
    currentLineIndex,
    transcript,
    isListening,
    readyForSpeech,
    feedbackMessage,
    showCelebration,
    currentCharacter,
    completedLines,
    moveToNextLine,
    startListening,
    stopListening,
    missedWords,
    accuracy,
    isGameOver,
  } = useDialog({
    dialogLines: parsedDialogLines,
  });

  useEffect(() => {
    setIsBrowser(true);
    if (typeof window !== "undefined") {
      const hasSpeechRecognition = !!(
        window.SpeechRecognition || (window as Window).webkitSpeechRecognition
      );

      if (!hasSpeechRecognition) {
        console.warn("Speech recognition not supported in this browser");
      }
    }

    return () => {
      if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
      }
    };
  }, [autoAdvanceTimeout]);

  useEffect(() => {
    if (isGameOver) {
      onComplete({
        Score: accuracy.toString(),
        MissedQuestions: missedWords.join(", "),
        StartedOn: startTime,
      });
    }
  }, [isGameOver]);

  useEffect(() => {
    if (questionData) {
      try {
        const parsedLines = formatDialogQuestions(questionData);
        if (parsedLines.length > 0) {
          setParsedDialogLines(parsedLines);
        }
      } catch (error) {
        console.error("Error parsing dialog data:", error);
      }
    }
  }, [questionData]);

  // Listen for real-time celebration and auto-advance to next line
  useEffect(() => {
    if (showCelebration && completedLines.includes(currentLineIndex)) {
      // Auto advance after celebration (with delay)
      const timeout = setTimeout(() => {
        if (currentLineIndex < dialogLines.length - 1) {
          moveToNextLine();
        } else {
          setGameState("gameOver");
        }
      }, 2000);

      setAutoAdvanceTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [
    showCelebration,
    completedLines,
    currentLineIndex,
    dialogLines.length,
    moveToNextLine,
  ]);

  const handleStopSpeaking = () => {
    stopListening();
  };

  const getCurrentLineCompletion = () => {
    if (!dialogLines || !dialogLines[currentLineIndex]) return 0;

    const totalWordsInLine = dialogLines[currentLineIndex].words.length;
    if (totalWordsInLine === 0) return 0;

    const correctWordsInLine = dialogLines[currentLineIndex].words.filter(
      (word) => word.status === "correct"
    ).length;

    return (correctWordsInLine / totalWordsInLine) * 100;
  };

  // Get current character bubble position class
  const getBubblePositionClass = () => {
    return currentCharacter === "anna"
      ? "bg-pink-50 border-pink-200 justify-start left-0"
      : "bg-primary-100 border-primary-200 -right-14";
  };

  // Handle starting the game from instructions
  const handleStartGame = () => {
    setGameState("playing");
  };

  if (gameState === "instructions") {
    return <DialogInstructions onStart={handleStartGame} onBack={onBack} />;
  }

  return (
    <div
      className="relative rounded-[48px] p-6 pt-12 w-full h-full font-comic flex items-center"
      style={{
        height: "calc(100vh - 150px)",
        backgroundImage: "url('/classroom-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-1/4 h-3/4 flex items-center justify-center">
        <Characters
          currentCharacter={currentCharacter}
          name="anna"
          gameOver={gameState === "gameOver"}
        />
      </div>

      {/* Center Dialog Box */}
      <div className="flex-grow h-full flex justify-center relative">
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="flex gap-3">
            {dialogLines.map((_, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  idx === currentLineIndex
                    ? "bg-primary-500 animate-pulse scale-125"
                    : completedLines.includes(idx)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className={`
            absolute p-4 rounded-3xl shadow-lg border-4 top-1/4 min-h-28 w-max
            ${getBubblePositionClass()}
            ${isListening ? "border-green-400 animate-pulse" : ""}
            ${showCelebration ? "border-yellow-400" : ""}
            flex transition-all duration-300
          `}
        >
          {/* Dialog bubble arrow */}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 w-0 h-0 
              ${
                currentCharacter === "anna"
                  ? "left-0 -translate-x-[20px] border-r-[20px] border-r-pink-200"
                  : "right-0 translate-x-[20px] border-l-[20px] border-l-primary-200"
              } 
              border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent
              ${isListening ? "animate-pulse" : ""}`}
          ></div>

          <div className="w-full">
            <div
              className={`text-sm font-bold ${
                currentCharacter === "anna"
                  ? "text-pink-400"
                  : "text-primary-400"
              }`}
            >
              {currentCharacter === "anna" ? "Anna" : "John"}
            </div>

            <p
              className={`text-2xl font-medium leading-relaxed tracking-wide ${
                currentCharacter === "anna"
                  ? "text-pink-700"
                  : "text-primary-700"
              }`}
            >
              {dialogLines[currentLineIndex]?.words.map((wordStatus, idx) => (
                <span
                  key={idx}
                  className={`dialog-word inline-block mx-1 transition-all duration-300 ${
                    wordStatus.status === "correct"
                      ? "text-green-600 font-bold scale-110 transform rotate-0 animate-bounce-once"
                      : wordStatus.status === "incorrect"
                      ? "text-red-500"
                      : isListening
                      ? "animate-pulse"
                      : ""
                  }`}
                >
                  {wordStatus.word}
                </span>
              ))}
            </p>

            {/* Progress bar for current line */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getCurrentLineCompletion()}%` }}
              ></div>
            </div>

            {isListening && (
              <div className="flex justify-center mt-2">
                <div className="bg-green-100 rounded-full px-3 py-1 text-xs text-green-800 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>
                    Listening for words... Say: &quot;
                    {dialogLines[currentLineIndex]?.text}&quot;
                  </span>
                </div>
              </div>
            )}

            {feedbackMessage && (
              <div className="mt-4 text-center">
                <p
                  className={`text-lg font-bold ${
                    feedbackMessage.includes("Excellent") ||
                    feedbackMessage.includes("Great")
                      ? "text-green-500"
                      : feedbackMessage.includes("Try again")
                      ? "text-amber-500"
                      : "text-primary-500"
                  }`}
                >
                  {feedbackMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transcript display during listening */}
        {isListening && transcript && (
          <div className="absolute bottom-36 left-0 right-0 flex justify-center">
            <div className="bg-white bg-opacity-80 rounded-xl px-4 py-2 max-w-md">
              <p className="text-sm text-gray-600">
                I heard: &quot;{transcript}&quot;
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-10 flex justify-center items-center gap-4 mt-6 mb-8">
          {isListening ? (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center bg-red-400 text-white text-xl hover:bg-red-500 gap-2 px-12 group py-3 rounded-full shadow-lg hover:shadow-lg transition-all"
            >
              <MdClose
                size={20}
                className="group-hover:scale-110 animate-pulse transition-all duration-300"
              />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={startListening}
              className={`flex items-center text-white text-xl gap-2 px-12 group py-3 rounded-full shadow-lg hover:shadow-lg transition-all ${
                readyForSpeech
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!readyForSpeech}
            >
              <FaMicrophoneAlt
                size={20}
                className={`${
                  readyForSpeech ? "group-hover:scale-110 animate-pulse" : ""
                } transition-all duration-300`}
              />
              <span>Speak</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="btn-error flex items-center text-xl gap-2 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <MdClose size={20} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Right Character - John */}
      <div className="w-1/4 h-3/4 flex items-center justify-center">
        <Characters
          currentCharacter={currentCharacter}
          name="john"
          gameOver={gameState === "gameOver"}
        />
      </div>

      {/* Confetti celebration effect */}
      {showCelebration && isBrowser && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={150}
          gravity={0.3}
        />
      )}
    </div>
  );
};

export default Dialog;
