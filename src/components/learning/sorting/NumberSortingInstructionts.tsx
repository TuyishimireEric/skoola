import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Play, ArrowUp, ArrowDown, ArrowBigLeft } from "lucide-react";
import { speak } from "@/utils/Audio";

interface NumberSortingInstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

interface NumberItem {
  id: string;
  value: number;
}

const colorPalette = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-indigo-400 to-indigo-600",
];

const NumberSortingInstructions: React.FC<NumberSortingInstructionsProps> = ({
  onStart,
  onBack
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "ascending"
  );

  // Container reference
  const containerRef = useRef<HTMLDivElement>(null);

  // Example numbers to sort
  const [numbers, setNumbers] = useState<NumberItem[]>([]);

  useEffect(() => {
    // Create a scrambled version of example numbers
    const numbersArray = [5, 2, 8, 1, 9].map((num, index) => ({
      id: `example-${index}`,
      value: num,
    }));

    // Shuffle the numbers
    const shuffled = [...numbersArray].sort(() => Math.random() - 0.5);
    setNumbers(shuffled);

    // Randomly choose sorting order for the example
    setSortOrder(Math.random() > 0.5 ? "ascending" : "descending");
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
      className="relative border-[20px] border-primary-400 rounded-[48px] shadow-md p-4 md:p-8 w-full h-full font-comic overflow-y-auto"
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
      <div className="flex flex-col items-center justify-center h-full gap-3 md:gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-4xl font-bold text-primary-500 mb-2">
              Number Sorting!
            </h2>
          </div>
        </motion.div>

        {/* Main example card */}
        <div className="bg-white p-6 md:p-6 rounded-3xl shadow-lg max-w-3xl w-full">
          <div className="p-4 bg-primary-100 md:p-4 rounded-2xl flex flex-col items-center justify-center">
            <p className="mb-4 text-lg text-primary-600 font-semibold flex items-center gap-2">
              Drag and arrange the numbers in
              <span className="font-bold flex items-center">
                {sortOrder === "ascending" ? (
                  <>
                    ascending <ArrowUp className="ml-1" />
                  </>
                ) : (
                  <>
                    descending <ArrowDown className="ml-1" />
                  </>
                )}
              </span>
              order!
            </p>

            <div className="w-full flex justify-center mb-2">
              <div className="w-full h-full p-4 flex flex-wrap justify-center items-center gap-6">
                <Reorder.Group
                  axis="x"
                  values={numbers}
                  onReorder={setNumbers}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  {numbers.map((item, index) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      style={{
                        userSelect: "none",
                        cursor: "grab",
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      whileDrag={{
                        scale: 1.1,
                        zIndex: 1,
                        boxShadow: "0 10px 15px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        className={`${
                          colorPalette[index % colorPalette.length]
                        } text-white shadow-lg border-4 border-white rounded-2xl w-24 h-24 flex items-center justify-center relative`}
                      >
                        <span className="text-5xl font-bold">{item.value}</span>
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 rounded-2xl pointer-events-none"></div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-md text-primary-400">
                {sortOrder === "ascending" ? (
                  <span>
                    Remember: <strong>Ascending</strong> means from smallest to
                    largest (1, 2, 3...)
                  </span>
                ) : (
                  <span>
                    Remember: <strong>Descending</strong> means from largest to
                    smallest (9, 8, 7...)
                  </span>
                )}
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

export default NumberSortingInstructions;
