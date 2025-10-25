import { motion } from "framer-motion";

interface AfricanLoaderProps {
  Title: string;
  Description: string;
  isSmall?: boolean;
}

const AfricanLoader = ({ Title, Description, isSmall }: AfricanLoaderProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isSmall ? "py-8" : "min-h-[60vh]"
      }`}
    >
      <div className="relative">
        {/* Central spinning element */}
        <motion.div
          className="relative w-24 h-24 my-6"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 rounded-full opacity-20"></div>
          <div className="absolute inset-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full opacity-30"></div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -360, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-6xl"
            >
              🦁
            </motion.div>
          </div>
        </motion.div>

        {/* Orbiting animals */}
        {["🦒", "🐘", "🦏", "🦓"].map((animal, index) => (
          <motion.div
            key={animal}
            className="absolute text-2xl"
            style={{
              top: "50%",
              left: "50%",
            }}
            animate={{
              rotate: [0, 360],
              x: Math.cos((index * Math.PI) / 2) * 60,
              y: Math.sin((index * Math.PI) / 2) * 60,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.2,
            }}
          >
            {animal}
          </motion.div>
        ))}

        {/* Floating sparkles */}
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute text-yellow-400"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.h3
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`font-comic font-bold text-primary-700 mb-2 ${
            isSmall ? "text-lg" : "text-2xl"
          }`}
        >
          {Title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`font-comic text-primary-600 ${
            isSmall ? "text-sm" : "text-lg"
          }`}
        >
          {Description}
        </motion.p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AfricanLoader;
