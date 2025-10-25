import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  score: number;
}

export const getFilledStars = (score: number) => {
  if (score >= 80) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
};

const StarRating = ({ score }: StarRatingProps) => {
  const getScoreMessage = (stars: number) => {
    switch (stars) {
      case 3:
        return "Fantastic! You're a Star! 🎉";
      case 2:
        return "Great Job! Keep Going! 🌟";
      case 1:
        return "Nice Try! You Can Do It! ⭐";
      default:
        return "Keep Practicing! You'll Get There! 💫";
    }
  };

  const filledStars = getFilledStars(score);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="relative">
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => {
            const isFilled = i < filledStars;
            return (
              <div
                key={i}
                className={`transform transition-all duration-500 ${
                  isFilled
                    ? "scale-125 hover:scale-150"
                    : "scale-100 hover:scale-110"
                }`}
              >
                <div
                  className={`
                  relative
                  ${isFilled ? "animate-bounce" : "animate-pulse"}
                  transition-all duration-300
                `}
                >
                  <Star
                    size={64}
                    className={`
                      ${
                        isFilled
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }
                      drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]
                      transition-all duration-300
                    `}
                  />
                  {isFilled && (
                    <div className="absolute inset-0 animate-ping">
                      <Star
                        size={64}
                        className="fill-yellow-400 text-yellow-400 opacity-20"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filledStars > 0 && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            {[...Array(Math.min(filledStars * 2, 4))].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${i * 20 - 30}px`,
                  animationDelay: `${i * 0.2}s`,
                  top: `-${i * 10}px`,
                }}
              >
                <span className="text-2xl">✨</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <p
          className={`
          text-2xl font-bold mb-2
          ${
            filledStars === 3
              ? "text-yellow-500"
              : filledStars === 2
              ? "text-yellow-600"
              : filledStars === 1
              ? "text-yellow-700"
              : "text-gray-500"
          }
        `}
        >
          {getScoreMessage(filledStars)}
        </p>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StarRating;
