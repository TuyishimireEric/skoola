import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Book, Clock, Star, Mic, CheckCircle, Volume2 } from "lucide-react";
import { GameDataI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import StatusIndicator from "./StatusIndicator";
import { calculateTextAccuracy } from "@/utils/textUtils";
import { speakFeedback } from "./SpeakFeedback";
import { formatReadingQuestions } from "@/utils/FormatQuestions";

interface ReadingProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

// Define SpeechRecognition interfaces to replace 'any'
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Add SpeechRecognition to Window interface
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const ReadingComponent = ({
  questionData,
  course,
  onComplete,
}: ReadingProps) => {
  const [startTime] = useState(new Date().toISOString());
  const [words, setWords] = useState<{ word: string; difficulty: string }[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const initialTime = course.Duration ?? 120;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [lastRecordedText, setLastRecordedText] = useState<string>("");
  const [isReading, setIsReading] = useState(false);

  // Speech recognition setup
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSupported =
    (typeof window !== "undefined" && "SpeechRecognition" in window) ||
    (typeof window !== "undefined" && "webkitSpeechRecognition" in window);
  const synthSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Define readWordAloud BEFORE it's used in useEffect
  const readWordAloud = useCallback(
    (word: string) => {
      if (synthSupported) {
        window.speechSynthesis.cancel();

        speechSynthesisRef.current = new SpeechSynthesisUtterance(word);

        let voices = window.speechSynthesis.getVoices();

        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            setVoicePreferences(voices);
          };
        } else {
          setVoicePreferences(voices);
        }

        function setVoicePreferences(voices: SpeechSynthesisVoice[]) {
          // First preference: African English
          let selectedVoice = voices.find(
            (voice) =>
              voice.lang.includes("en") &&
              (voice.name.includes("South African") ||
                voice.name.includes("Nigerian") ||
                voice.name.includes("Kenya"))
          );

          // Second preference: any child voice
          if (!selectedVoice) {
            selectedVoice = voices.find(
              (voice) =>
                voice.name.toLowerCase().includes("kid") ||
                voice.name.toLowerCase().includes("child")
            );
          }

          // Third preference: any English voice
          if (!selectedVoice) {
            selectedVoice = voices.find((voice) => voice.lang.includes("en"));
          }

          // If we found a suitable voice, use it
          if (selectedVoice && speechSynthesisRef.current) {
            speechSynthesisRef.current.voice = selectedVoice;
          }

          // Adjust pitch for a more child-friendly sound if no specific child voice found
          if (
            speechSynthesisRef.current &&
            !(
              selectedVoice?.name.toLowerCase().includes("kid") ||
              selectedVoice?.name.toLowerCase().includes("child")
            )
          ) {
            speechSynthesisRef.current.pitch = 1.2;
            speechSynthesisRef.current.rate = 0.9;
          }

          // Speak the word
          if (speechSynthesisRef.current) {
            setIsReading(true);

            speechSynthesisRef.current.onend = () => {
              setIsReading(false);
            };

            window.speechSynthesis.speak(speechSynthesisRef.current);
          }
        }
      }
    },
    [synthSupported]
  );

  useEffect(() => {
    if (questionData) {
      setWords(formatReadingQuestions(questionData));
    }
  }, [questionData, formatReadingQuestions]);

  useEffect(() => {
    // Setup speech recognition
    if (speechSupported) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const currentWord = words[currentIndex].word.toLowerCase();
        setLastRecordedText(transcript);

        const calculatedAccuracy = calculateTextAccuracy(
          currentWord,
          transcript
        ).percentage;
        setAccuracy(calculatedAccuracy);
        setRecordingComplete(true);

        if (calculatedAccuracy >= 60) {
          setFeedback("Great job!");
          setShowCelebration(true);
          setScore((prev) => prev + 1);
        } else {
          speakFeedback("Wrong");
          if (retryCount < 2) {
            setFeedback(`Try again! You said "${transcript}"`);
          } else {
            setFeedback(
              `The correct word was "${currentWord}". Let's move on.`
            );
            if (!missedWords.includes(currentWord)) {
              setMissedWords((prev) => [...prev, currentWord]);
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setRecordingComplete(true);
        setFeedback("I couldn't hear you. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthSupported && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    currentIndex,
    words,
    retryCount,
    missedWords,
    speechSupported,
    synthSupported,
  ]); // Added missing dependencies

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      readWordAloud(words[currentIndex].word);
    }
  }, [currentIndex, words, readWordAloud]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: Number(((score / words.length) * 100).toFixed(2)).toString(),
        MissedQuestions: missedWords.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  const startRecording = () => {
    if (speechSupported && recognitionRef.current) {
      if (synthSupported) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      }

      setIsRecording(true);
      setRecordingComplete(false);
      setFeedback("");
      recognitionRef.current.start();
    } else {
      setFeedback("Speech recognition is not supported in your browser.");
    }
  };

  const handleNextWord = () => {
    if (accuracy >= 60 || retryCount >= 2) {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setRetryCount(0);
        setAccuracy(0);
        setRecordingComplete(false);
        setFeedback("");
        setShowCelebration(false);
        setLastRecordedText("");
      } else {
        setGameOver(true);
      }
    } else {
      setRetryCount((prev) => prev + 1);
      setRecordingComplete(false);
    }
  };

  const currentWord = words[currentIndex];

  return (
    <div
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-8 w-full h-full font-comic"
      style={{ height: "calc(100vh - 150px)" }}
    >
      <div className="absolute top-0 left-0 p-6 flex items-center justify-between w-full">
        <StatusIndicator
          icon={Clock}
          value={`${timeLeft}s`}
          label="Time Left"
          color="text-primary-400"
          borderColor="border-primary-400"
        />
        <StatusIndicator
          icon={Star}
          value={score}
          label="Score"
          color="text-yellow-400"
          borderColor="border-primary-300"
        />
      </div>

      <div className="flex flex-col items-center justify-center h-full gap-8">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <Book className="w-40 h-40 text-primary-400 mb-6" />
          </div>
        </motion.div>
        {currentWord && (
          <div className="w-full flex flex-col items-center">
            <motion.div
              key={`word-${currentIndex}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center mb-4 w-full">
                <h2 className="text-6xl font-bold text-primary-500">
                  {words[currentIndex].word}
                </h2>
                <button
                  onClick={() => readWordAloud(words[currentIndex].word)}
                  className={`ml-4 p-4 bg-blue-100 rounded-full transition-all hover:bg-blue-200 ${
                    isReading ? "animate-pulse" : ""
                  }`}
                  disabled={isReading}
                >
                  <Volume2 size={32} className="text-primary-500" />
                </button>
              </div>
            </motion.div>

            {feedback && (
              <div
                className={`text-2xl mb-6 px-6 py-3 rounded-full ${
                  accuracy >= 60
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {feedback}
              </div>
            )}

            {lastRecordedText && recordingComplete && (
              <div className="mb-6 text-xl">
                You said: <span className="font-bold">{lastRecordedText}</span>
                {accuracy > 0 && (
                  <span className="ml-2 text-blue-500">
                    ({accuracy}% match)
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 w-full">
              {!recordingComplete ? (
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`w-1/2 text-white text-3xl py-5 rounded-full transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-3 ${
                    isRecording
                      ? "bg-red-500 animate-pulse"
                      : "bg-primary-400 hover:bg-primary-300"
                  }`}
                >
                  <Mic className={isRecording ? "animate-bounce" : ""} />
                  {isRecording ? "Listening..." : "Read Word"}
                </button>
              ) : (
                <button
                  onClick={handleNextWord}
                  className="w-1/2 bg-green-500 text-white text-3xl py-5 rounded-full hover:bg-green-400 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-3"
                >
                  {accuracy >= 60 ? <CheckCircle /> : null}
                  {accuracy >= 60
                    ? "Correct! Next Word"
                    : retryCount >= 2
                    ? "Next Word"
                    : "Try Again"}
                </button>
              )}

              <button
                onClick={() => setGameOver(true)}
                className="w-max bg-red-400 text-white text-3xl p-5 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md"
              >
                <MdClose />
              </button>
            </div>
          </div>
        )}
      </div>
      {showCelebration && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={50}
          gravity={0.2}
        />
      )}
    </div>
  );
};

export default ReadingComponent;
