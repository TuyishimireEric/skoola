import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ArrowBigLeft, Play } from "lucide-react";
import { speak } from "@/utils/Audio";

interface SortingInstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

const colorPalette = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-pink-100",
  "bg-purple-100",
  "bg-orange-100",
  "bg-teal-100",
  "bg-indigo-100",
];

const SortingInstructions: React.FC<SortingInstructionsProps> = ({
  onStart,
  onBack,
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

  const containerRef = useRef<HTMLDivElement>(null);

  // Example words to sort
  const exampleSentence = "I am a student";
  const [words, setWords] = useState<Array<{ id: string; text: string }>>([]);

  useEffect(() => {
    // Create a scrambled version of the example sentence
    const wordsArray = exampleSentence.split(" ").map((word, index) => ({
      id: `example-${index}`,
      text: word,
    }));

    // Shuffle the words
    const shuffled = [...wordsArray].sort(() => Math.random() - 0.5);
    setWords(shuffled);
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
      // When countdown reaches 0, start the game
      setShowCountdown(false);
      onStart();
    }
  }, [countdownValue, showCountdown, onStart]);

  // Event handlers
  const handleStartClick = () => {
    setShowCountdown(true);
    setCountdownValue(3);
    speak("counter");
  };

  return (
    <div
      ref={containerRef}
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-4 md:p-8 w-full h-full font-comic overflow-hidden"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Countdown overlay */}
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

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-4xl font-bold text-primary-500">
              Sentence Sorting!
            </h2>
          </div>
        </motion.div>

        {/* Main example card */}
        <div className="bg-white p-6 md:p-6 rounded-3xl shadow-lg max-w-3xl w-full">
          <div className="p-4 bg-primary-100 md:p-6 rounded-2xl flex flex-col items-center justify-center">
            <p className="mb-4 text-lg text-primary-600 font-semibold">
              Drag and arrange the words to form a correct sentence!
            </p>

            <div className="w-full flex justify-center mb-2">
              <div className="w-full h-full p-4 flex flex-wrap justify-center items-center gap-4">
                <Reorder.Group
                  axis="x"
                  values={words}
                  onReorder={setWords}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                  }}
                >
                  {words.map((item, index) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      style={{
                        userSelect: "none",
                        cursor: "grab",
                        backgroundColor: "none",
                        shadow: "none",
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      whileDrag={{
                        scale: 1.1,
                        zIndex: 1,
                      }}
                    >
                      <div
                        className={` ${
                          colorPalette[index % colorPalette.length]
                        } text-black shadow-lg  font-comic text-3xl font-semibold rounded-3xl px-6 py-2`}
                      >
                        {item.text}
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>

            <div className="text-center">
              <p className="text-md text-primary-400 mt-2">
                When you&apos;re done, click &quot;Check Answer&quot; to see if
                you got it right.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center flex">
          <button
            onClick={onBack}
            className="bg-primary-200 text-primary-600 text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3 mr-4"
          >
            <ArrowBigLeft size={28} />
            Back
          </button>
          <button
            onClick={handleStartClick}
            className="bg-primary-400 text-white text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3"
          >
            <Play size={28} />
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortingInstructions;
