import React, { useState, useEffect } from "react";
import { Star, Clock, HelpCircle, RefreshCw } from "lucide-react";
import { GameDataI } from "@/types/Course";
import { MdClose } from "react-icons/md";
import Confetti from "react-confetti";
import { speak } from "@/utils/Audio";
import StatusIndicator from "../StatusIndicator";
import { ShowHelp } from "../ShowHelp";
import FillInBlanksInstructions from "./Instructions";
import { shuffleArray } from "@/utils/functions";
import { formatFillInBlanks } from "@/utils/FormatQuestions";

interface FillInBlanksProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

interface Question {
  id: number;
  sentence: string;
  missingWord: string;
  hint?: string;
  originalSentence: string;
}

const FillInBlanks = ({
  questionData,
  course,
  onBack,
  onComplete,
}: FillInBlanksProps) => {
  const [startTime] = useState(new Date().toISOString());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [verbList, setVerbList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const initialTime = course.Duration ?? 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<string[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [usedVerbs, setUsedVerbs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (questionData) {
      const parsedQuestions = formatFillInBlanks(questionData);
      setQuestions(parsedQuestions);

      const verbs = parsedQuestions.map((q) => q.missingWord);
      const shuffledVerbs = shuffleArray([...verbs]);
      setVerbList(shuffledVerbs);
    }
  }, [questionData]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !timerPaused && !showInstructions) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, timerPaused, showInstructions]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: Number((score / questions.length) * 100).toFixed(2),
        MissedQuestions: missedQuestions.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  const handleResetInput = () => {
    setUserAnswer("");
    setSelectedVerb(null);
    setIsCorrect(null);
  };

  // Fixed selectVerb function
  const selectVerb = (verb: string) => {
    if (!isSubmitting && isCorrect !== true && !usedVerbs[verb.toLowerCase()]) {
      setSelectedVerb(verb);
      setUserAnswer(verb);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim() && !selectedVerb) return;

    setIsSubmitting(true);
    setHasFailedOnce(false);

    const currentQuestion = questions[currentIndex];
    const answer = selectedVerb || userAnswer;

    // Case insensitive comparison
    const isAnswerCorrect =
      answer.trim().toLowerCase() === currentQuestion.missingWord.toLowerCase();

    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setUsedVerbs((prev) => ({
        ...prev,
        [currentQuestion.missingWord.toLowerCase()]: true,
      }));

      setShowCelebration(true);
      speak("great");
      if (!hasFailedOnce) {
        setScore((prev) => prev + 1);
      }

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setUserAnswer("");
          setSelectedVerb(null);
          setIsCorrect(null);
          setShowCelebration(false);
          setHasFailedOnce(false);
        } else {
          setGameOver(true);
        }
        setIsSubmitting(false);
      }, 2000);
    } else {
      speak("wrong");
      setHasFailedOnce(true);
      if (!missedQuestions.includes(questions[currentIndex].originalSentence)) {
        setMissedQuestions((prev) => [
          ...prev,
          questions[currentIndex].originalSentence,
        ]);
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const openHelpModal = () => {
    setShowHelpModal(true);
    setTimerPaused(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
    setTimerPaused(false);
  };

  const handleStartGame = () => {
    setShowInstructions(false);
  };

  const renderSentenceWithBlank = (sentence: string) => {
    const parts = sentence.split("_________");

    return (
      <div className="flex flex-wrap items-center justify-center text-2xl  md:text-6xl gap-1 xs:gap-2 min-h-[44px] w-full">
        <span>{parts[0]}</span>
        <span className="relative inline-block mx-1 xs:mx-2 mb-1 xs:mb-2">
          <div
            className={`mx-2 px-2 xs:px-4 w-20 xs:w-24 sm:w-28 md:w-40 text-center flex items-center justify-center border-b-4 border-primary-400 bg-white text-2xl md:text-4xl min-h-[36px] xs:min-h-[40px] md:min-h-[42px] ${
              isCorrect === true
                ? "bg-green-100"
                : isCorrect === false
                ? "bg-red-100"
                : ""
            }`}
          >
            {selectedVerb || userAnswer || ""}
          </div>
        </span>
        <span>{parts[1]}</span>
      </div>
    );
  };

  if (showInstructions) {
    return (
      <FillInBlanksInstructions onStart={handleStartGame} onBack={onBack} />
    );
  }

  return (
    <>
      <div
        className="relative  w-full h-full font-comic overflow-y-auto"
        style={{ minHeight: "calc(100vh - 120px)", maxHeight: "100%" }}
      >
        <div className="absolute top-0 p-1 xs:p-2 md:p-6 flex items-center justify-between w-full px-4 z-20">
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
            total={questions.length}
            label="Score"
            color="text-yellow-400"
            borderColor="border-primary-300"
          />
        </div>

        <div className="mt-28 md:mt-16 relative pt-8 xs:pt-12 sm:pt-16 md:pt-20 pb-2 xs:pb-4 inset-0 z-10 flex flex-col items-center justify-start h-full gap-2 xs:gap-3 md:gap-6 px-1 xs:px-2 md:px-6 overflow-y-auto">
          <div className="flex flex-col items-center w-full max-w-full mb-1 xs:mb-2 md:mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-500">
              Fill In The correct Verbs
            </h2>
            <p className=" text-sm xs:text-sm md:text-base text-gray-600">
              Click on the correct verb
            </p>
            <div className="border-b mb-2 flex flex-wrap justify-center gap-1 xs:gap-2 md:gap-3 mt-1 xs:mt-2 md:mt-4 max-h-32 xs:max-h-36 md:max-h-none overflow-y-auto p-1 xs:p-2">
              {verbList.map((verb, index) => {
                const isUsed = usedVerbs[verb.toLowerCase()];
                const isSelected = selectedVerb === verb;
                const isDisabled = isSubmitting || isCorrect === true || isUsed;

                return (
                  <button
                    key={index}
                    onClick={() => selectVerb(verb)}
                    disabled={isDisabled}
                    className={`px-8 py-1 md:py-2 rounded-full text-base md:text-2xl font-medium transition-colors hover:bg-green-400 duration-300 pointer-pointer ${
                      isUsed
                        ? "bg-green-100 text-green-600 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary-400 text-white"
                        : "bg-primary-100 text-primary-600 hover:bg-primary-200 cursor-pointer"
                    }`}
                  >
                    {verb}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full flex justify-center my-6 md:my-6">
            <div className="p-1 xs:p-2 md:p-6 rounded-2xl xs:rounded-3xl w-full">
              {questions[currentIndex] && (
                <div className="text-xl md:text-2xl text-center">
                  {renderSentenceWithBlank(questions[currentIndex].sentence)}
                </div>
              )}
            </div>
          </div>

          {isCorrect === true && (
            <div className="bg-green-100 text-green-800 px-2 xs:px-3 md:px-6 py-1 rounded-full text-xs xs:text-sm md:text-xl font-medium text-center">
              Correct! The verb &quot;{questions[currentIndex].missingWord}
              &quot; fits perfectly! 👏
            </div>
          )}

          {isCorrect === false && (
            <div className="bg-red-100 text-red-800 px-2 xs:px-3 md:px-6 py-1 rounded-full text-xs xs:text-sm md:text-xl font-medium text-center">
              Not quite right. Try another verb! 🔄
            </div>
          )}

          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-1 xs:gap-2 md:gap-4 w-full mt-1 xs:mt-2 mb-2 xs:mb-4 md:mb-6">
            {hasFailedOnce ? (
              <button
                type="button"
                onClick={openHelpModal}
                className="w-full sm:w-1/3 bg-blue-500 text-white text-base xs:text-lg md:text-2xl py-1 xs:py-2 md:py-4 rounded-full hover:bg-blue-400 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-1 md:gap-2"
              >
                <HelpCircle size={16} className="hidden sm:block" />
                Get Help
              </button>
            ) : (
              <button
                onClick={handleResetInput}
                className="hidden w-2/3 sm:w-1/3 items-center justify-center gap-1 md:gap-2 bg-yellow-400 text-white text-base xs:text-lg md:text-2xl py-1 xs:py-2 md:py-4 px-2 xs:px-3 md:px-6 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-md"
              >
                <RefreshCw />
                Clear
              </button>
            )}

            <button
              onClick={checkAnswer}
              disabled={isSubmitting || (!userAnswer.trim() && !selectedVerb)}
              className="w-2/3 sm:w-1/3 flex justify-center items-center gap-1 md:gap-2 bg-primary-400 text-white text-base xs:text-lg md:text-2xl py-1 xs:py-2 md:py-4 px-2 xs:px-3 md:px-6 rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
            >
              Check
            </button>

            <button
              onClick={() => setGameOver(true)}
              className=" w-1/3 items-center justify-center flex gap-2 bg-red-400  text-white text-base xs:text-lg md:text-2xl p-1 xs:p-2 md:p-4 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md"
            >
              <MdClose />
              End
            </button>
          </div>
        </div>
      </div>
      {showHelpModal && (
        <ShowHelp
          question={`Fill in the blank with the correct verb: ${questions[currentIndex].sentence}`}
          answer={`The missing verb is: "${questions[currentIndex].missingWord}"`}
          course={course}
          isOpen={showHelpModal}
          onClose={closeHelpModal}
        />
      )}

      {showCelebration && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={100}
          gravity={0.2}
        />
      )}
    </>
  );
};

export default FillInBlanks;
