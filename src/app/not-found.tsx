"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* African Village Gradient Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100">
        <Image
          src="/backgroundImage.png"
          alt="African village landscape"
          fill
          className="object-cover opacity-40"
          style={{
            objectPosition: "right",
          }}
          priority
        />
      </div>

      {/* Animated African Decorative Elements */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-20 text-6xl opacity-30"
        >
          🌳
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute top-40 right-32 text-5xl opacity-25"
        >
          🦁
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          className="absolute bottom-40 left-40 text-4xl opacity-30"
        >
          🏺
        </motion.div>
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
          className="absolute top-1/2 left-1/4 text-3xl opacity-20"
        >
          🌍
        </motion.div>
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, -20, 20, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 3 }}
          className="absolute bottom-60 right-20 text-5xl opacity-25"
        >
          🦒
        </motion.div>
      </div>

      {/* Character Image with Enhanced Animation */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="relative w-full h-full mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="fixed right-12 sm:right-24 bottom-0 w-full sm:w-4/5 md:w-3/5 lg:w-2/3 h-5/6 opacity-60 sm:opacity-80 md:opacity-100"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-full h-full"
            >
              <Image
                src="/Sad.png"
                alt="Sad cartoon character from African village"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw"
                className="object-contain object-right-bottom filter drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-30 w-full lg:w-1/2 h-full flex flex-col">
        <div className="flex flex-col justify-center h-full px-6 sm:px-12 space-y-8">
          {/* Main Error Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative space-y-6 backdrop-blur-xl bg-white/80 p-8 sm:p-10 rounded-3xl border-4 border-orange-300 shadow-2xl"
          >
            {/* Floating Emoji */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-8 -right-4 text-6xl"
              aria-hidden="true"
            >
              😢
            </motion.div>

            {/* 404 Number with African Pattern */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              className="relative"
            >
              <h1 className="text-6xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 font-comic">
                404
              </h1>
              <div className="absolute inset-0 text-6xl sm:text-8xl font-bold text-orange-200 -z-10 translate-x-2 translate-y-2">
                404
              </div>
            </motion.div>

            {/* Title with Village Theme */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-orange-700 font-comic flex items-center gap-3">
                <span className="text-4xl" aria-hidden="true">
                  🏘️
                </span>
                Lost in the Village!
              </h2>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4"
            >
              <p className="text-lg sm:text-xl text-gray-700 font-comic leading-relaxed">
                Oops! It looks like you&apos;ve wandered off the village path! 🛤️ The
                page you&apos;re looking for seems to have disappeared into the
                African wilderness.
              </p>
              <p className="text-base text-gray-600 font-comic">
                Don&apos;t worry though - our village animals will help you find your
                way back home! 🦓🐘
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100 border-3 border-orange-300 rounded-2xl shadow-lg hover:from-orange-200 hover:to-yellow-200 transition-all duration-300 font-comic focus:ring-4 focus:ring-orange-300"
                aria-label="Go back to previous page"
              >
                <ArrowLeft size={24} />
                <span>Go Back</span>
                <span className="text-2xl" aria-hidden="true">
                  🔙
                </span>
              </motion.button>

              <Link href="/" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 border-3 border-orange-400 rounded-2xl shadow-lg transition-all duration-300 font-comic focus:ring-4 focus:ring-orange-300"
                  aria-label="Go to home page"
                >
                  <Home size={24} />
                  <span>Village Home</span>
                  <span className="text-2xl" aria-hidden="true">
                    🏠
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
