import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, ArrowLeft, Volume2, VolumeX, Sparkles, Star, Gamepad2 } from "lucide-react";

interface TutorialVideoProps {
  game: {
    Title: string;
    TutorialVideo?: string; // YouTube URL
    Type: string;
  };
  onSkip: () => void;
  onComplete: () => void;
  onBack: () => void;
}

const TutorialVideo: React.FC<TutorialVideoProps> = ({
  game,
  onSkip,
  onComplete,
  onBack,
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = game.TutorialVideo
    ? getYouTubeVideoId(game.TutorialVideo)
    : null;

  const handleWatchTutorial = useCallback(() => {
    setShowVideo(true);
  }, []);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const handleStartGame = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // If no tutorial video is available, skip directly
  if (!game.TutorialVideo || !videoId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center border-4 border-orange-400"
        >
          <motion.div 
            className="text-5xl md:text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮
          </motion.div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 font-comic">
            Ready to Play?
          </h1>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            No tutorial available for this game. You can start playing right
            away!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex-1 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 md:px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
            >
              <ArrowLeft size={20} />
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 md:px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
            >
              <Play size={20} />
              Start Game
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show video player
  if (showVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300 flex flex-col">
        {/* Header */}
        <div className="p-3 md:p-4 flex items-center justify-between bg-white shadow-md">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-gray-800 font-semibold bg-gradient-to-r from-red-100 to-orange-100 px-3 md:px-4 py-2 rounded-xl border-2 border-orange-300 text-sm md:text-base"
          >
            <ArrowLeft size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          <h1 className="text-sm md:text-xl font-bold text-gray-800 font-comic text-center flex-1 px-2">
            {game.Title} - Tutorial
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-gray-800 font-semibold bg-gradient-to-r from-yellow-100 to-green-100 px-3 md:px-4 py-2 rounded-xl border-2 border-green-300"
          >
            {isMuted ? <VolumeX size={16} className="md:w-5 md:h-5" /> : <Volume2 size={16} className="md:w-5 md:h-5" />}
          </motion.button>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex items-center justify-center p-3 md:p-4">
          <div className="w-full max-w-4xl">
            <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&rel=0&modestbranding=1`}
                title={`${game.Title} Tutorial`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  // Set up event listener for video end (this is limited with YouTube embeds)
                  setTimeout(() => setVideoEnded(true), 10000); // Fallback after 10 seconds
                }}
              />
            </div>

            {/* Controls */}
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4 sm:px-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 md:px-8 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
              >
                <Gamepad2 size={20} />
                Skip to Game
              </motion.button>

              {videoEnded && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartGame}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 md:px-8 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
                >
                  <Play size={20} />
                  Start Game
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 text-4xl md:text-6xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🦁
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-4xl md:text-6xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🦒
        </motion.div>
      </div>
    );
  }

  // Show tutorial intro screen
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 text-4xl md:text-6xl opacity-50"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        ☀️
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-4xl md:text-6xl opacity-50"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🌍
      </motion.div>
      <motion.div
        className="absolute top-1/2 left-5 text-3xl md:text-5xl opacity-50"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🦓
      </motion.div>
      <motion.div
        className="absolute top-1/2 right-5 text-3xl md:text-5xl opacity-50"
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        🐘
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full text-center border-4 border-orange-400 relative z-10"
      >
        <motion.div 
          className="text-5xl md:text-6xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎓
        </motion.div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ delay: i * 0.1, duration: 1, repeat: Infinity }}
            >
              <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 font-comic">
          Learn How to Play!
        </h1>
        <p className="text-gray-600 mb-6 text-sm md:text-lg">
          Watch the fun tutorial for <strong className="text-orange-500">{game.Title}</strong> or jump straight into the adventure!
        </p>

        {/* Video preview with clickable play button */}
        <motion.div 
          className="mb-6 cursor-pointer group"
          onClick={handleWatchTutorial}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative w-full h-32 sm:h-40 md:h-48 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-2xl border-4 border-orange-400 flex items-center justify-center overflow-hidden shadow-lg">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Tutorial thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <motion.div 
                className="bg-white rounded-full p-3 md:p-4 shadow-xl border-4 border-orange-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Play size={32} className="text-orange-500 ml-1 md:w-10 md:h-10" />
              </motion.div>
            </div>
            
            {/* Sparkles around play button */}
            <Sparkles className="absolute top-4 right-4 text-yellow-300 w-6 h-6 md:w-8 md:h-8" />
            <Sparkles className="absolute bottom-4 left-4 text-yellow-300 w-6 h-6 md:w-8 md:h-8" />
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Click to watch tutorial</p>
        </motion.div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWatchTutorial}
            className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-3 md:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
          >
            <Play size={20} />
            Watch Tutorial Video
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 md:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
          >
            <Gamepad2 size={20} />
            Start Playing Now!
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-full bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white font-bold py-2.5 md:py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
          >
            <ArrowLeft size={20} />
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialVideo;