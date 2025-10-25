"use client";

import React, { useState, useRef, useEffect } from "react";
import HearingIcon from "@mui/icons-material/Hearing";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Image from "next/image";
import NatureKidsInput from "@/components/form/PlayInput";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FC_compareTexts } from "@/hooks/text/services";
import PleaseWait from "@/components/loader/PleaseWait";
import Results from "@/components/results/Results";

interface QuestionI {
  question: string;
  answer: string;
  myAnswer: string;
  keyWords: string[];
}

const initialQuestions: QuestionI[] = [
  {
    question: "Where did Robin live?",
    answer: "Robin lived in a tall tree.",
    myAnswer: "",
    keyWords: ["tree"],
  },
  {
    question: "Why was Robin scared?",
    answer: "He was scared to fly.",
    myAnswer: "",
    keyWords: ["fly"],
  },
  {
    question: "What happened after Robin jumped?",
    answer: "He started flying.",
    myAnswer: "",
    keyWords: ["started", "flying"],
  },
];

const audioUrl =
  "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1733144901/AI-driven/The%20Brave%20Little%20Bird.mp3";
const ImageUrl =
  "https://res.cloudinary.com/dn8vyfgnl/image/upload/v1733145530/AI-driven/brave_litter_bird.jpg";

const Page: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [questions, setQuestions] = useState<QuestionI[]>(initialQuestions);
  const [loading, setLoading] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>("");


  // New state for success modal and confetti
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [passedQuestions, setPassedQuestions] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setQuestions(initialQuestions);
    const audioElement = audioRef.current;

    if (!audioElement) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioElement.addEventListener("ended", handleEnded);

    return () => {
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changeSpeed = () => {
    if (!audioRef.current) return;

    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

    audioRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const checkAnswer = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      question: questions[currentQuestion - 1].question,
      answer: questions[currentQuestion - 1].answer,
      myAnswer: userAnswer,
      keyWords: questions[currentQuestion - 1].keyWords,
    };
    const result = await FC_compareTexts(formData);

    if (!result) return;

    setLoading(false);
    setSimilarityScore(result.data);
    setIsSubmitted(true);

    // Check if the answer passes the 80% threshold
    if (result.data >= 80) {
      // Add the current question to passed questions
      setPassedQuestions([...passedQuestions, currentQuestion]);
    }
  };

  const handleNextQuestion = () => {
    // Only allow moving to next question if current question is passed
    setIsSubmitted(false);
    if (passedQuestions.includes(currentQuestion)) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer("");
    }
  };

  // const handlePreviousQuestion = () => {
  //   // Allow moving to previous question if it's not the first question
  //   if (currentQuestion > 1) {
  //     setCurrentQuestion(currentQuestion - 1);
  //     setUserAnswer("");
  //   }
  // };

  return (
    <div className="w-full h-full flex justify-between ml-2">
      {isSubmitted && (
        <Results
          score={similarityScore}
          passMarks={80}
          handleNextQuestion={handleNextQuestion}
          onBack={() => setIsSubmitted(false)}
        />
      )}
      {/* Rest of the existing component remains the same */}
      <div className="w-full relative h-full bg-white border-[24px] rounded-[56px] border-primary shadow-2xl overflow-hidden">
        <div className="w-full bg-slate-50/50 p-4 pb-2 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="text-white bg-primary-500 rounded-full border-white border shadow-sm p-3">
              <HearingIcon sx={{ fontSize: 40 }} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold font-comic">Listening</h2>
              <p className="text-sm font-sm font-comic">
                Listen the story and answer the questions
              </p>
            </div>
          </div>
          <p className="text-2xl font-normal font-nunito bg-primary-500 rounded-full text-white border-white border shadow-sm p-1 px-3">
            1
          </p>
        </div>

        <div className="relative w-full h-full p-4 flex flex-col justify-start items-center gap-2">
          <div className="w-full h-full flex flex-col items-center">
            <div className="relative h-2/5 w-2/3 mb-2">
              <Image
                src={ImageUrl}
                alt="Bird"
                fill
                className="object-cover rounded-4 border-1 border-primary shadow-sm rounded-3xl"
              />
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="w-2/3 flex items-center justify-center space-x-4 mb-4">
                <button
                  onClick={changeSpeed}
                  className="bg-primary-500 text-white px-3 py-1 rounded-full"
                >
                  {playbackSpeed}x
                </button>
                <button
                  onClick={togglePlay}
                  className="bg-primary-500 text-white p-3 rounded-full"
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
              </div>
              <audio ref={audioRef} src={audioUrl} />
            </div>

            <div className="w-2/3 h-1/3 flex flex-col justify-between items-center">
              <p className="text-3xl font-comic mb-4 text-center">
                {currentQuestion}. {questions[currentQuestion - 1].question}
              </p>
              <div className="flex w-full items-center space-x-4">
                <NatureKidsInput
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Grow your answer!"
                  ariaLabel="Nature-inspired input"
                />
              </div>
              <div className="w-full flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  disabled={currentQuestion == 1}
                  className="text-white w-min bg-primary-500 opacity-80 rounded-full p-4 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform active:scale-90 active:opacity-80"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={loading}
                  className="text-white w-1/2 bg-primary-500 rounded-full p-4 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-90 active:opacity-80"
                >
                  {loading ? <PleaseWait /> : "Submit"}
                </button>
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={currentQuestion == questions.length}
                  className="text-white w-min bg-primary-500 opacity-80  rounded-full p-4 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform active:scale-90 active:opacity-80"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
