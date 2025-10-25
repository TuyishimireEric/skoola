import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowBigLeft, Play } from "lucide-react";
import { MatchingCanvas } from "./MatchingCanvas";
import { speak } from "@/utils/Audio";

interface MatchingPair {
  left: string;
  right: string;
  id?: number;
}

interface InstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

const MatchingInstructions: React.FC<InstructionsProps> = ({
  onStart,
  onBack,
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  const containerRef = useRef<HTMLDivElement>(null);

  const pairs: MatchingPair[] = [
    { left: "One", right: "1", id: 0 },
    { left: "Two", right: "2", id: 1 },
  ];

  const [scrambledPairs, setScrambledPairs] = useState<MatchingPair[]>([]);

  useEffect(() => {
    // Create a scrambled version of the pairs
    const rightItems = [...pairs.map((p) => p.right)];
    const shuffled = rightItems.sort(() => Math.random() - 0.5);

    const scrambled = pairs.map((pair, index) => ({
      left: pair.left,
      right: shuffled[index],
    }));

    setScrambledPairs(scrambled);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;

    if (countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowCountdown(false);
      onStart();
    }
  }, [countdownValue, showCountdown, onStart]);

  const handleStartClick = () => {
    setShowCountdown(true);
    speak("counter");
    setCountdownValue(3);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-full pt-14 p-2 md:p-8 w-full font-comic "
      >
        <div className="flex flex-col items-center justify-center h-full gap-3 md:gap-4 pt-8">
          <div className="text-3xl md:text-3xl font-bold text-primary-500">
            Match the Pairs!
          </div>

          {/* Main example card */}
          <div className="bg-white p-6 md:p-6 rounded-3xl shadow-lg max-w-3xl w-full">
            <div className="p-4 bg-primary-100 md:p-6 rounded-2xl flex flex-col items-center justify-center">
              <p className="mb-2 text-lg text-primary-600 font-semibold">
                Here&apos;s how matching works!
              </p>

              {/* Example matching interface */}
              <div className="relative w-full py-3" style={{ height: "160px" }}>
                {scrambledPairs.length > 0 && (
                  <MatchingCanvas
                    pairs={scrambledPairs}
                    onComplete={() => {}}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
            <button
              onClick={onBack}
              className="bg-primary-200 order-2 sm:order-1 text-primary-600 text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3 mr-4"
            >
              <ArrowBigLeft size={28} />
              Back
            </button>
            <button
              onClick={handleStartClick}
              className="bg-primary-400 order-1 sm:order-2 text-white text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3"
            >
              <Play size={28} />
              Start Game
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showCountdown && (
          <div className="absolute inset-0 z-50 text-white text-9xl font-bold bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div
              key={countdownValue}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {countdownValue === 0 ? "GO!" : countdownValue}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MatchingInstructions;
