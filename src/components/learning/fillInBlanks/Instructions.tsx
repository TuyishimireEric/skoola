import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowBigLeft, Play } from "lucide-react";
import { speak } from "@/utils/Audio";

interface FillInBlanksInstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

const FillInBlanksInstructions: React.FC<FillInBlanksInstructionsProps> = ({
  onStart,
  onBack,
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [showCorrectExample, setShowCorrectExample] = useState(false);
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const exampleSentence = "Anna _________ milk.";
  const correctAnswer = "drinks";

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
    setCountdownValue(3);
    speak("counter");
  };

  const handleExampleSubmit = () => {
    setShowCorrectExample(true);
  };

  const handleVerbSelection = (verb: string) => {
    setSelectedVerb(verb);
  };

  const renderExampleWithBlank = () => {
    const parts = exampleSentence.split("_________");

    return (
      <div className="flex items-start justify-center text-2xl gap-2 min-h-[40px]">
        <span>{parts[0]}</span>
        <span className="relative inline-block mx-2">
          <div
            className={`px-4 w-28 flex items-center justify-center text-center border-b-4 border-primary-400 bg-white rounded-lg text-xl min-h-[36px]`}
          >
            {selectedVerb || ""}
          </div>
        </span>
        <span>{parts[1]}</span>
      </div>
    );
  };

  const exampleVerbs = ["runs", "drinks", "eat"];

  return (
    <>
      <div
        ref={containerRef}
        className="relative  w-full h-full font-comic overflow-y-auto"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <h2 className="text-3xl md:text-3xl font-bold text-primary-500 mb-2">
                Fill In The Verbs!
              </h2>
            </div>
          </motion.div>

          {/* Main example card */}
          <div className="bg-white p-6 md:p-6 rounded-3xl shadow-lg max-w-3xl w-full">
            <div className="p-4 bg-primary-100 md:p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className="mb-2 text-lg text-primary-600 font-semibold">
                Click on a verb below to fill in the blank space!
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-3">
                {exampleVerbs.map((verb, index) => (
                  <button
                    key={index}
                    onClick={() => handleVerbSelection(verb)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      selectedVerb === verb
                        ? "bg-primary-400 text-white"
                        : "bg-primary-200 text-primary-600 hover:bg-primary-200"
                    }`}
                  >
                    {verb}
                  </button>
                ))}
              </div>

              <div className="w-full flex justify-center mb-3">
                <div className="p-4 rounded-full w-full">
                  <div className="text-center">{renderExampleWithBlank()}</div>
                </div>
              </div>

              {!showCorrectExample ? (
                <button
                  onClick={handleExampleSubmit}
                  disabled={!selectedVerb}
                  className="bg-primary-400 text-white text-lg py-2 px-8 rounded-full hover:bg-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <div className="text-center">
                  {selectedVerb?.toLowerCase() === correctAnswer ? (
                    <p className="text-green-600 font-semibold text-lg mb-2">
                      Correct! &quot;{correctAnswer}&quot; is the right verb!
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold text-lg mb-2">
                      The correct verb is &quot;{correctAnswer}&quot;.
                    </p>
                  )}
                </div>
              )}
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

export default FillInBlanksInstructions;
