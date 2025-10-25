import React, { useState, useEffect } from "react";
import { GameDataI, MatchingPairI } from "@/types/Course";
import { MdClose, MdRefresh, MdCheck } from "react-icons/md";
import Confetti from "react-confetti";
import { speak } from "@/utils/Audio";
import { MatchingCanvas } from "./MatchingCanvas";
import MatchingInstructions from "./Instructions";
import { formatMatchinQuestions } from "@/utils/FormatQuestions";

interface MatchingProps {
  questionData: string;
  course: GameDataI;
  onBack: () => void;
  onComplete: (data: {
    Score: string;
    MissedQuestions: string;
    StartedOn: string;
  }) => void;
}

interface LineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  thickness: number;
  isDashed: boolean;
}

interface Connection {
  leftId: string;
  rightId: string;
  line: LineProps;
}

interface ConnectionsMap {
  [key: string]: Connection;
}

const Matching: React.FC<MatchingProps> = ({
  questionData,
  onBack,
  onComplete,
}) => {
  const [startTime] = useState(new Date().toISOString());
  const [pairs, setPairs] = useState<MatchingPairI[]>([]);
  const [scrambledPairs, setScrambledPairs] = useState<MatchingPairI[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<string[]>([]);
  const [userConnections, setUserConnections] = useState<ConnectionsMap>({});
  const [attemptMade, setAttemptMade] = useState(false);
  const [contentHeight, setContentHeight] = useState("full");
  const [showInstructions, setShowInstructions] = useState(true);

  // Calculate and adjust content height based on window size
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      // Adjust content height based on viewport height to ensure everything fits
      if (vh < 700) {
        setContentHeight("compact");
      } else if (vh < 900) {
        setContentHeight("medium");
      } else {
        setContentHeight("full");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    if (questionData) {
      const parsedPairs = formatMatchinQuestions(questionData);
      setPairs(parsedPairs);

      const rightItems = [...parsedPairs.map((p) => p.right)];
      const shuffled = rightItems.sort(() => Math.random() - 0.5);

      const scrambled = parsedPairs.map((pair, index) => ({
        left: pair.left,
        right: shuffled[index],
      }));

      setScrambledPairs(scrambled);
    }
  }, [questionData]);

  useEffect(() => {
    if (gameOver) {
      onComplete({
        Score: score.toFixed(2),
        MissedQuestions: missedQuestions.join(", "),
        StartedOn: startTime,
      });
    }
  }, [gameOver]);

  const handleConnectionsComplete = (connections: ConnectionsMap) => {
    setUserConnections(connections);
    setAttemptMade(true);
  };

  const checkAnswers = () => {
    setIsSubmitting(true);

    let correctCount = 0;
    const wrongMatches: string[] = [];

    // Track which left items have been matched
    const matchedLeftItems = new Set();

    // First pass: Check for correct matches
    Object.values(userConnections).forEach((conn) => {
      const leftId = conn.leftId;
      const rightId = conn.rightId;

      // Find the correct pair for this leftId
      const correctPair = pairs.find((p) => p.left === leftId);

      if (correctPair && correctPair.right === rightId) {
        correctCount++;
        matchedLeftItems.add(leftId);
      } else if (correctPair) {
        wrongMatches.push(`${leftId}:${correctPair.right}`);
        matchedLeftItems.add(leftId);
      }
    });

    // Second pass: Find unmatched items
    pairs.forEach((pair) => {
      if (!matchedLeftItems.has(pair.left)) {
        wrongMatches.push(`${pair.left}:${pair.right}`);
      }
    });

    const calculatedScore =
      pairs.length > 0 ? (correctCount / pairs.length) * 100 : 0;

    // Set the score as a percentage (0-100)
    setScore(calculatedScore);

    // Save missed questions
    setMissedQuestions(wrongMatches);

    // Show celebration if all matches are correct
    if (correctCount === pairs.length) {
      setShowCelebration(true);
      speak("congratulations");
    }
    setGameOver(true);
  };

  const handleReset = () => {
    setScore(0);
    setMissedQuestions([]);
    setGameOver(false);
    setUserConnections({});
    setAttemptMade(false);
    setShowCelebration(false);
    const rightItems = [...pairs.map((p) => p.right)];
    const shuffled = rightItems.sort(() => Math.random() - 0.5);

    const scrambled = pairs.map((pair, index) => ({
      left: pair.left,
      right: shuffled[index],
    }));

    setScrambledPairs(scrambled);
  };

  const handleStartGame = () => {
    setShowInstructions(false);
  };

  // Get heading and instruction size based on content height
  const getHeadingSize = () => {
    if (contentHeight === "compact") return "text-2xl";
    if (contentHeight === "medium") return "text-3xl";
    return "text-3xl";
  };

  const getInstructionSize = () => {
    if (contentHeight === "compact") return "text-sm";
    if (contentHeight === "medium") return "text-base";
    return "text-xl";
  };

  const getButtonSize = () => {
    if (contentHeight === "compact") return "text-lg py-2";
    if (contentHeight === "medium") return "text-xl py-3";
    return "text-2xl py-4";
  };

  if (showInstructions) {
    return <MatchingInstructions onStart={handleStartGame} onBack={onBack} />;
  }

  return (
    <div
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-4 w-full h-full font-comic flex flex-col items-center justify-center overflow-hidden"
      style={{
        height: "calc(100vh - 120px)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`flex flex-col items-center p-2 mb-2 ${
          contentHeight === "compact" ? "" : "mb-2"
        }`}
      >
        <h2
          className={`${getHeadingSize()} font-bold text-primary-500 text-center`}
        >
          Draw lines to match the items!
        </h2>
        <p className={`${getInstructionSize()} text-primary-400 text-center`}>
          Use your pencil to connect matching pairs
        </p>
      </div>

      <div className="relative mt-4 w-full mx-8">
        {typeof window !== "undefined" && (
          <MatchingCanvas
            pairs={scrambledPairs}
            onComplete={handleConnectionsComplete}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-4 w-full mt-6">
        <button
          onClick={handleReset}
          className={`hidden  flex-shrink-0 bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-md sm:flex items-center justify-center`}
          title="Reset connections"
        >
          <MdRefresh className="text-3xl" />
        </button>
        <button
          onClick={checkAnswers}
          disabled={
            !attemptMade ||
            isSubmitting ||
            Object.keys(userConnections).length !== pairs.length
          }
          className={`w-4/5 sm:w-1/3 bg-primary-400 text-white ${getButtonSize()} rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md flex items-center justify-center gap-2`}
        >
          <MdCheck className="text-lg md:text-3xl" /> Check Answer
        </button>

        <button
          onClick={() => setGameOver(true)}
          className={`hidden flex-shrink-0 bg-red-400 text-white p-2 rounded-full hover:bg-red-300 transition-all transform hover:scale-105 shadow-md sm:flex items-center justify-center`}
          title="Exit game"
        >
          <MdClose className="text-3xl" />
        </button>
      </div>
      {showCelebration && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
    </div>
  );
};

export default Matching;
