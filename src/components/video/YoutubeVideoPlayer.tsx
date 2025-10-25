import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  VolumeX,
  Volume2,
  Maximize,
  Settings,
} from "lucide-react";

// Define YouTube Player Event interfaces
interface YouTubePlayerEvent {
  target: YTPlayer;
  data: number;
}

// Define YouTube Player options interface
interface YouTubePlayerOptions {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    modestbranding?: 0 | 1;
    enablejsapi?: 0 | 1;
    origin?: string;
    [key: string]: unknown; // Use unknown instead of any
  };
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onPlaybackQualityChange?: (event: YouTubePlayerEvent) => void;
    onPlaybackRateChange?: (event: YouTubePlayerEvent) => void;
    [key: string]: unknown; // Use unknown instead of any
  };
}

// Define YouTube IFrame API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (elementId: string, options: YouTubePlayerOptions) => YTPlayer;
    };
  }
}

// Define interface for YouTube Player
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setPlaybackRate: (rate: number) => void;
  getPlayerState: () => number;
  getDuration: () => number;
  getCurrentTime: () => number;
}

interface YouTubeVideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
}

const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  url,
  title = "Video Player",
  poster,
  className = "",
  autoplay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = getYouTubeVideoId(url);

  // Load YouTube IFrame API
  useEffect(() => {
    // Only load the script if it hasn't been loaded already
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
      // Define the callback function
      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API ready");
      };
    }
    
    // Add message listener for YouTube iframe API events
    const handleYouTubeEvents = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "onStateChange") {
          // State 1 is playing, 2 is paused
          setIsPlaying(data.info === 1);
        }
      } catch (e) {
        const error = e as Error;
        console.error("Error parsing YouTube event data:", error.message);
      }
    };
    
    window.addEventListener("message", handleYouTubeEvents);
    return () => window.removeEventListener("message", handleYouTubeEvents);
  }, []);
  
  // Auto-hide controls after inactivity
  useEffect(() => {
    const playerElement = playerContainerRef.current;
    
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
      
      setControlsTimeout(timeout);
    };
    
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [isPlaying, controlsTimeout]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle play/pause
  const handlePlayPause = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (isPlaying) {
        // Pause YouTube video
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        // Play YouTube video
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (muted) {
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      } else {
        iframeRef.current.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
      }
      setMuted(!muted);
    }
  };
  
  // Handle fullscreen
  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  };
  
  // Change playback rate
  const changePlaybackRate = (rate: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(`{"event":"command","func":"setPlaybackRate","args":[${rate}]}`, '*');
      setPlaybackRate(rate);
    }
  };

  return (
    <div 
      ref={playerContainerRef}
      className={`relative overflow-hidden rounded-lg shadow-lg ${className} ${isFullscreen ? 'w-screen h-screen' : ''}`}
      style={{ 
        paddingBottom: isFullscreen ? '56.25%' : '62.5%', // 16:9 (56.25%) in fullscreen, 16:10 (62.5%) normally
        backgroundColor: '#fff' /* Black background to match YouTube's default */
      }}
      onMouseEnter={() => setShowControls(true)}
    >
      {!videoId ? (
        // Fallback if no valid YouTube URL
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
          {poster ? (
            <div className="relative w-full h-full">
              <Image 
                src={poster} 
                alt={title} 
                fill 
                style={{ objectFit: 'cover' }} 
                priority 
              />
            </div>
          ) : (
            <div className="text-center p-4">
              <p>Invalid YouTube URL</p>
              <p className="text-sm opacity-70 mt-2">{url}</p>
            </div>
          )}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&controls=0&showinfo=0&rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      )}

      {/* Play/Pause overlay - only visible when paused or on hover */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          onClick={handlePlayPause}
        >
          <button className="bg-white/90 rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Play className="w-6 h-6 text-gray-800 ml-1" />
          </button>
        </div>
      )}
      
      {/* Video controls bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 flex items-center justify-between ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePlayPause}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Playback speed dropdown */}
          <div className="relative group">
            <button 
              className="text-white text-xs flex items-center gap-1 hover:text-gray-200 transition-colors"
              aria-label="Playback speed"
            >
              <Settings className="w-4 h-4" />
              <span>{playbackRate}x</span>
            </button>
            <div className="absolute right-0 bottom-full mb-1 bg-black/80 rounded-md p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="flex flex-col w-16 text-center">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    className={`py-1 px-2 text-xs hover:bg-white/20 rounded text-white ${speed === playbackRate ? 'bg-white/20' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      changePlaybackRate(speed);
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fullscreen button */}
          <button 
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Toggle fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubeVideoPlayer;