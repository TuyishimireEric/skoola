import { speak } from "@/utils/Audio";
import { useState, useEffect, useCallback, useRef } from "react";

interface WordStatus {
  word: string;
  status: string;
  wasSaid: boolean;
}

interface DialogLine {
  character: string;
  text: string;
  words: WordStatus[];
  order: number;
  status: string;
  score: number;
}

interface UseSpeechRecognitionProps {
  dialogLines: DialogLine[];
  initialLineIndex?: number;
}

interface SpeechRecognitionResult {
  lineCorrectCount: number;
  allWordsCorrect: boolean;
}

// Add totalWords state and calculation functions
export function useDialog({
  dialogLines = [],
  initialLineIndex = 0,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [currentLineIndex, setCurrentLineIndex] =
    useState<number>(initialLineIndex);
  const [updatedDialogLines, setUpdatedDialogLines] =
    useState<DialogLine[]>(dialogLines);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [readyForSpeech, setReadyForSpeech] = useState<boolean>(true);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [realtimeCelebrationShown, setRealtimeCelebrationShown] =
    useState<boolean>(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [completedLines, setCompletedLines] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // New stats states
  const [missedWordsCount, setMissedWordsCount] = useState<number>(0);
  const [correctWordsCount, setCorrectWordsCount] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [totalWords, setTotalWords] = useState<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const currentLineIndexRef = useRef<number>(initialLineIndex);
  const isMountedRef = useRef<boolean>(true);
  const gameOverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep currentLineIndexRef updated with currentLineIndex
  useEffect(() => {
    currentLineIndexRef.current = currentLineIndex;
  }, [currentLineIndex]);

  // Update dialog lines when props change and calculate total words
  useEffect(() => {
    if (dialogLines && dialogLines.length > 0) {
      setUpdatedDialogLines(dialogLines);

      // Calculate total words across all dialog lines
      const totalWordsCount = dialogLines.reduce(
        (sum, line) => sum + line.words.length,
        0
      );
      setTotalWords(totalWordsCount);
    }
  }, [dialogLines]);

  // Update stats whenever missedWords or totalWords change
  useEffect(() => {
    const missedCount = missedWords.length;
    const correctCount = Math.max(0, totalWords - missedCount);
    const calculatedAccuracy =
      totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 100;

    setMissedWordsCount(missedCount);
    setCorrectWordsCount(correctCount);
    setAccuracy(calculatedAccuracy);
  }, [missedWords, totalWords, completedLines]);

  // Check if all lines are completed with delay, and set game over state accordingly
  useEffect(() => {
    if (
      updatedDialogLines.length > 0 &&
      completedLines.length === updatedDialogLines.length
    ) {
      // Clear any existing timer
      if (gameOverTimerRef.current) {
        clearTimeout(gameOverTimerRef.current);
      }

      // Set game over with delay to allow for last line stats to be included
      gameOverTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsGameOver(true);
        }
      }, 300);
    }

    return () => {
      if (gameOverTimerRef.current) {
        clearTimeout(gameOverTimerRef.current);
      }
    };
  }, [completedLines, updatedDialogLines]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition during cleanup", e);
        }
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      if (gameOverTimerRef.current) {
        clearTimeout(gameOverTimerRef.current);
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || (window as Window).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    // Only create a new instance if we don't already have one
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        if (!isMountedRef.current) return;

        let interimTranscript = "";
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            finalTranscriptRef.current = finalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Current speech content (final + interim)
        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript.toLowerCase());

        lastSpeechTimeRef.current = Date.now();

        const lineIdx = currentLineIndexRef.current;

        // Process in real-time with enhanced feedback
        if (isListening && lineIdx < updatedDialogLines.length) {
          const result = updateWordStatusesInRealTime(
            currentTranscript.toLowerCase(),
            lineIdx
          );

          if (!result) return;

          // Make sure we're working with the current line
          if (updatedDialogLines && updatedDialogLines[lineIdx]) {
            const currentLine = updatedDialogLines[lineIdx];

            // Check if all words are correct and show immediate celebration
            if (
              result.allWordsCorrect &&
              result.lineCorrectCount === currentLine.words.length &&
              !realtimeCelebrationShown
            ) {
              setRealtimeCelebrationShown(true);
              setFeedbackMessage("Excellent! 🌟");

              // Add to completed lines
              if (!completedLines.includes(lineIdx)) {
                setCompletedLines((prev) => [...prev, lineIdx]);
              }

              // Show mini celebration without stopping
              setTimeout(() => {
                if (isMountedRef.current) {
                  setShowCelebration(true);
                }
              }, 300);
            }
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (!isMountedRef.current) return;

        // Only restart if we specifically want to be listening
        if (isListening && readyForSpeech === false) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Error restarting speech recognition", e);
            setIsListening(false);
            setIsProcessingSpeech(false);
            setReadyForSpeech(true);
          }
        } else {
          setIsProcessingSpeech(false);
          if (finalTranscriptRef.current && !realtimeCelebrationShown) {
            finalizeRecognition();
          }
        }
      };

      recognitionRef.current.onerror = () => {
        if (!isMountedRef.current) return;

        if (isListening && readyForSpeech === false) {
          // Try to restart on error only if we're supposed to be listening
          setTimeout(() => {
            if (
              recognitionRef.current &&
              isListening &&
              readyForSpeech === false &&
              isMountedRef.current
            ) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error("Failed to restart speech recognition", e);
                setIsListening(false);
                setIsProcessingSpeech(false);
                setReadyForSpeech(true);
              }
            }
          }, 1000);
        } else {
          setIsListening(false);
          setIsProcessingSpeech(false);
          setReadyForSpeech(true);
        }
      };
    }

    // Setup inactivity detection
    const checkInactivity = () => {
      if (isListening && !readyForSpeech) {
        const now = Date.now();
        // If there's been no speech for 5 seconds, finalize
        if (now - lastSpeechTimeRef.current > 5000) {
          if (finalTranscriptRef.current) {
            finalizeRecognition();
          }
        }
      }
    };

    // Set up inactivity checker
    const inactivityInterval = setInterval(checkInactivity, 2000);

    return () => {
      clearInterval(inactivityInterval);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition", e);
        }
      }
    };
  }, [
    isListening,
    readyForSpeech,
    realtimeCelebrationShown,
    completedLines,
    updatedDialogLines,
  ]);

  // Update word statuses in real time
  const updateWordStatusesInRealTime = useCallback(
    (spokenText: string, lineIndex: number): SpeechRecognitionResult | null => {
      if (!updatedDialogLines || !updatedDialogLines[lineIndex]) return null;

      const currentLine = updatedDialogLines[lineIndex];
      const lineWords = currentLine.words;
      const spokenWords = spokenText
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      const updatedWordStatuses = [...currentLine.words];
      let lineCorrectCount = 0;
      let allWordsCorrect = true;

      // First, clear all pending statuses to avoid sticking
      updatedWordStatuses.forEach((status, idx) => {
        if (status.status === "pending") {
          updatedWordStatuses[idx] = {
            word: status.word,
            status: "incorrect",
            wasSaid: false,
          };
        }
      });

      // Then check each word against the spoken text
      lineWords.forEach((word, idx) => {
        const lowerWord = word.word.toLowerCase().replace(/[.,!?;:]/g, "");

        // Check if this word appears in what's been spoken so far
        const matchFound = spokenWords.some((spokenWord) => {
          const cleanSpokenWord = spokenWord.replace(/[.,!?;:]/g, "");
          return (
            cleanSpokenWord === lowerWord ||
            cleanSpokenWord.includes(lowerWord) ||
            lowerWord.includes(cleanSpokenWord)
          );
        });

        if (matchFound) {
          updatedWordStatuses[idx] = {
            word: word.word,
            status: "correct",
            wasSaid: true,
          };
          lineCorrectCount++;
        } else {
          allWordsCorrect = false;
        }
      });

      setUpdatedDialogLines((prev) => {
        // Make sure we have the line at the correct index
        if (!prev || !prev[lineIndex]) return prev;

        const newDialogLines = [...prev];
        newDialogLines[lineIndex] = {
          ...newDialogLines[lineIndex],
          words: updatedWordStatuses,
        };
        return newDialogLines;
      });

      if (allWordsCorrect && lineCorrectCount === lineWords.length) {
        setFeedbackMessage("Excellent! 🌟 Click Next to continue.");
      }

      return { lineCorrectCount, allWordsCorrect };
    },
    [updatedDialogLines]
  );

  // Process final recognition results
  const processRecognitionResults = useCallback(
    (spokenText: string) => {
      const lineIndex = currentLineIndexRef.current;
      if (!updatedDialogLines || !updatedDialogLines[lineIndex])
        return { correctCount: 0, matchPercentage: 0 };

      const currentLine = updatedDialogLines[lineIndex];
      const lineWords = currentLine.words;
      const spokenWords = spokenText
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      const updatedWordStatuses = [...currentLine.words];
      let correctCount = 0;

      lineWords.forEach((line, idx) => {
        const lowerWord = line.word.toLowerCase().replace(/[.,!?;:]/g, "");

        // Check if this word appears in what's been spoken
        const matchFound = spokenWords.some((spokenWord) => {
          const cleanSpokenWord = spokenWord.replace(/[.,!?;:]/g, "");
          return (
            cleanSpokenWord === lowerWord ||
            cleanSpokenWord.includes(lowerWord) ||
            lowerWord.includes(cleanSpokenWord)
          );
        });

        if (matchFound) {
          updatedWordStatuses[idx] = {
            word: line.word,
            status: "correct",
            wasSaid: true,
          };
          correctCount++;
        } else {

          setMissedWords((prev) => {
            if (!prev.includes(line.word)) {
              return [...prev, line.word];
            }
            return prev;
          });

          updatedWordStatuses[idx] = {
            word: line.word,
            status: "incorrect",
            wasSaid: false,
          };
        }
      });

      setUpdatedDialogLines((prev) => {
        if (!prev || !prev[lineIndex]) return prev;

        const newDialogLines = [...prev];
        newDialogLines[lineIndex] = {
          ...newDialogLines[lineIndex],
          words: updatedWordStatuses,
        };
        return newDialogLines;
      });

      const matchPercentage = (correctCount / lineWords.length) * 100;

      return { correctCount, matchPercentage };
    },
    [updatedDialogLines]
  );

  // Finalize recognition
  const finalizeRecognition = useCallback(() => {
    const lineIndex = currentLineIndexRef.current;
    if (
      !isMountedRef.current ||
      !updatedDialogLines ||
      !updatedDialogLines[lineIndex]
    )
      return;

    const result = processRecognitionResults(finalTranscriptRef.current);
    const matchPercentage = result ? result.matchPercentage : 0;

    // Stop listening after processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(
          "Error stopping speech recognition during finalization",
          e
        );
      }
      setIsListening(false);
      setIsProcessingSpeech(false);
      setReadyForSpeech(true);
    }

    // If accuracy is over 60%, mark as success and prepare to move to next line
    if (matchPercentage >= 60) {
      setFeedbackMessage("Great job! 🌟");
      setShowCelebration(true);
      speak("great");

      // Add to completed lines
      if (!completedLines.includes(lineIndex)) {
        setCompletedLines((prev) => [...prev, lineIndex]);
      }

      // Mark current line as completed
      setUpdatedDialogLines((prev) => {
        if (!prev || !prev[lineIndex]) return prev;

        const newDialogLines = [...prev];
        newDialogLines[lineIndex] = {
          ...newDialogLines[lineIndex],
          status: "completed",
        };

        return newDialogLines;
      });

      // Show celebration and then move to next line
      setTimeout(() => {
        if (isMountedRef.current) {
          setShowCelebration(false);

          // Only move to next line after celebration if accuracy is good
          if (lineIndex < updatedDialogLines.length - 1) {
            // Move to next line and ensure recognition is completely reset
            setCurrentLineIndex((prevIndex) => prevIndex + 1);

            // These resets are important so the user must click "Speak" again
            setIsListening(false);
            setReadyForSpeech(true);
            setIsProcessingSpeech(false);
            setTranscript("");
            finalTranscriptRef.current = "";
            setRealtimeCelebrationShown(false);
            setFeedbackMessage("");
          } else {
            // Reset for the last line
            setReadyForSpeech(true);
            setIsProcessingSpeech(false);
            setTranscript("");
            finalTranscriptRef.current = "";
            setRealtimeCelebrationShown(false);
            setFeedbackMessage("All lines completed! 🎉");

            // Set game over with delay to ensure last line stats are included
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsGameOver(true);
              }
            }, 300);
          }
        }
      }, 1800);
    } else {
      setFeedbackMessage("Try again! 🎯");
      speak("wrong");
      setReadyForSpeech(true);
      setIsProcessingSpeech(false);
      setIsListening(false);
      setTranscript("");
      finalTranscriptRef.current = "";
      setRealtimeCelebrationShown(false);
    }
  }, [
    updatedDialogLines,
    completedLines,
    missedWords,
    processRecognitionResults,
  ]);

  const startListening = useCallback(() => {
    if (!isMountedRef.current) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        const error = e as Error;
        console.error("Error stopping speech recognition", error.message);
      }

      setTranscript("");
      finalTranscriptRef.current = "";
      setIsListening(true);
      setIsProcessingSpeech(true);
      setReadyForSpeech(false);
      lastSpeechTimeRef.current = Date.now();
      setFeedbackMessage("");
      setRealtimeCelebrationShown(false);

      // Get current line index from the state
      const lineIndex = currentLineIndexRef.current;

      // Reset word statuses to pending when starting to listen
      if (updatedDialogLines && updatedDialogLines[lineIndex]) {
        setUpdatedDialogLines((prev) => {
          if (!prev || !prev[lineIndex]) return prev;

          const newDialogLines = [...prev];
          const resetStatuses = newDialogLines[lineIndex].words.map(
            (wordStatus) => ({
              word: wordStatus.word,
              status: "pending" as const,
              wasSaid: false,
            })
          );

          newDialogLines[lineIndex] = {
            ...newDialogLines[lineIndex],
            words: resetStatuses,
          };

          return newDialogLines;
        });
      }

      // Wait a brief moment to ensure any previous session is stopped
      setTimeout(() => {
        if (!isMountedRef.current) return;

        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Error starting speech recognition", e);
          setIsListening(false);
          setReadyForSpeech(true);
          setIsProcessingSpeech(false);
        }
      }, 100);
    }
  }, [updatedDialogLines]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!isMountedRef.current) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping speech recognition", e);
      }
      setIsListening(false);
      setIsProcessingSpeech(false);
      setReadyForSpeech(true);

      // Final check when explicitly stopping
      if (finalTranscriptRef.current && !realtimeCelebrationShown) {
        finalizeRecognition();
      }

      // Check if all lines are completed when user stops talking
      const allLinesCompleted =
        completedLines.length === updatedDialogLines.length;
      const lastLineCompleted =
        currentLineIndex === updatedDialogLines.length - 1 &&
        completedLines.includes(currentLineIndex);

      if (allLinesCompleted || lastLineCompleted) {
        // Set game over with delay to ensure last line stats are included
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsGameOver(true);
          }
        }, 300);
      }
    }
  }, [
    realtimeCelebrationShown,
    finalizeRecognition,
    completedLines,
    updatedDialogLines.length,
    currentLineIndex,
  ]);

  const moveToNextLine = useCallback(() => {
    if (!isMountedRef.current) return;

    // Stop listening if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping speech recognition", e);
      }
    }

    setIsListening(false);
    setIsProcessingSpeech(false);
    setTranscript("");
    finalTranscriptRef.current = "";
    setReadyForSpeech(true);
    setRealtimeCelebrationShown(false);
    setFeedbackMessage("");
    setShowCelebration(false);

    if (currentLineIndexRef.current < updatedDialogLines.length - 1) {
      setCurrentLineIndex((prevIndex) => prevIndex + 1);
    } else {
      // Set game over with delay to ensure last line stats are included
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsGameOver(true);
        }
      }, 300);
    }
  }, [updatedDialogLines]);

  const areAllLinesCompleted = useCallback(() => {
    return completedLines.length === updatedDialogLines.length;
  }, [completedLines, updatedDialogLines]);

  const currentCharacter =
    updatedDialogLines[currentLineIndex]?.character || "John";

  return {
    dialogLines: updatedDialogLines,
    currentLineIndex,
    transcript,
    isListening,
    isProcessingSpeech,
    readyForSpeech,
    feedbackMessage,
    showCelebration,
    missedWords,
    currentCharacter,
    completedLines,
    isGameOver,
    areAllLinesCompleted,
    moveToNextLine,
    startListening,
    stopListening,
    setCurrentLineIndex,
    missedWordsCount,
    correctWordsCount,
    accuracy,
    totalWords,
  };
}
