import React, { useState, useEffect } from "react";
import { Play, Mic, X, ArrowBigLeft } from "lucide-react";
import { Characters } from "./Characters";

interface DialogInstructionsProps {
  onStart: () => void;
  onBack: () => void;
}

const DialogInstructions: React.FC<DialogInstructionsProps> = ({
  onStart,
  onBack,
}) => {
  const [currentCharacter, setCurrentCharacter] = useState("anna");
  const [showSpeakButton, setShowSpeakButton] = useState(true);
  const [message, setMessage] = useState(
    "Read the lines out loud when it's your turn!"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacter((prev) => (prev === "anna" ? "john" : "anna"));

      if (currentCharacter === "anna") {
        setMessage("When it's your turn, read the highlighted text!");
        setShowSpeakButton(true);
      } else {
        setMessage("Press the Speak button and read the text out loud!");
        setShowSpeakButton(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentCharacter]);

  const getBubblePositionClass = () => {
    return currentCharacter === "anna"
      ? "bg-pink-50 border-pink-200"
      : "bg-primary-100 border-primary-200";
  };

  return (
    <div
      className="relative rounded-3xl w-full h-full font-comic flex flex-col"
      style={{
        height: "calc(100vh - 150px)",
        backgroundImage: "url('/classroom-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Title */}
      <div className="text-4xl md:text-5xl font-bold text-primary-500 text-center mt-8 mb-4">
        Let&apos;s Practice Reading!
      </div>

      {/* Main content area with fixed height */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col md:flex-row items-center justify-end px-6 relative">
          {/* Left Character - Anna */}
          <div className="w-1/4 h-3/4 flex items-center justify-center">
            <div
              className={`${
                currentCharacter === "anna" ? "scale-100" : "opacity-70"
              } transition-all duration-300`}
            >
              <Characters
                currentCharacter={currentCharacter}
                name="anna"
                gameOver={false}
              />
            </div>
          </div>

          {/* Center Dialog Card */}
          <div className="w-full md:w-1/2 flex-grow z-10">
            {/* Speech bubble example */}
            <div
              key={currentCharacter + message}
              className={`
                w-full mx-auto mb-6 p-4 rounded-3xl shadow-lg border-4
                ${getBubblePositionClass()}
              `}
            >
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
                  className={`text-xl md:text-2xl font-medium leading-relaxed tracking-wide ${
                    currentCharacter === "anna"
                      ? "text-pink-700"
                      : "text-primary-700"
                  }`}
                >
                  {message}
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  {showSpeakButton ? (
                    <button
                      className="flex items-center bg-green-500 hover:bg-green-600 text-white text-xl gap-2 px-12 group py-3 rounded-full shadow-lg hover:shadow-lg transition-all"
                      onClick={() => setShowSpeakButton(false)}
                    >
                      <Mic
                        size={20}
                        className="group-hover:scale-110 animate-pulse transition-all duration-300"
                      />
                      <span>Speak</span>
                    </button>
                  ) : (
                    <button
                      className="flex items-center bg-red-400 text-white text-xl hover:bg-red-500 gap-2 px-12 group py-3 rounded-full shadow-lg hover:shadow-lg transition-all"
                      onClick={() => setShowSpeakButton(true)}
                    >
                      <X
                        size={20}
                        className="group-hover:scale-110 animate-pulse transition-all duration-300"
                      />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Start button in fixed position at bottom */}
            <div className="text-center flex">
              <button
                onClick={onBack}
                className="bg-primary-200 text-primary-600 text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3 mr-4"
              >
                <ArrowBigLeft size={28} />
                Back
              </button>
              <button
                onClick={onStart}
                className="bg-primary-400 text-white text-2xl md:text-2xl py-2 px-12 md:py-2 md:px-16 rounded-full hover:bg-primary-300 transition-all shadow-md flex items-center justify-center gap-3"
              >
                <Play size={28} />
                Start Game
              </button>
            </div>
          </div>

          {/* Right Character - John */}
          <div className="w-1/4 h-3/4 flex items-center justify-center">
            <div
              className={`${
                currentCharacter === "john" ? "scale-110" : "opacity-70"
              } transition-all duration-300`}
            >
              <Characters
                currentCharacter={currentCharacter}
                name="john"
                gameOver={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogInstructions;
