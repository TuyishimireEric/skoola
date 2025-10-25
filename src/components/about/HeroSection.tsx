import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Users } from "lucide-react";
import Link from "next/link";
import { fadeInVariants } from "@/utils/functions";

const HeroSection: React.FC = () => {
  // Memoize the JSX content
  const heroContent = useMemo(
    () => (
      <section
        className="relative w-full min-h-screen overflow-hidden"
        role="banner"
      >
        {/* Hero Background */}
        <div className="absolute inset-0 z-10">
          <Image
            src="/backgroundImage.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover w-full h-full"
            style={{ objectPosition: "center" }}
          />
        </div>

        {/* Decorative Elements */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          aria-hidden="true"
        >
          <div className="relative w-full h-full max-w-[1600px] mx-auto">
            <div className="absolute right-0 bottom-0 w-full sm:w-4/5 md:w-3/5 lg:w-1/2 h-full opacity-20 sm:opacity-30 md:opacity-40">
              <div className="relative w-full h-full flex items-end justify-end">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 right-20 text-8xl"
                  role="img"
                  aria-label="Graduation cap"
                >
                  🎓
                </motion.div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-40 right-40 text-7xl"
                  role="img"
                  aria-label="Books"
                >
                  📚
                </motion.div>
                <motion.div
                  animate={{ y: [0, -25, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-10 right-60 text-6xl"
                  role="img"
                  aria-label="Star"
                >
                  🌟
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 flex items-center min-h-screen pt-24 md:pt-20 pb-8 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
          <div className="w-full max-w-5xl mx-auto text-center">
            <motion.div
              className="absolute -top-10 -left-10 w-20 sm:w-32 h-20 sm:h-32 bg-yellow-200 rounded-full opacity-30 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              aria-hidden="true"
            />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute -top-4 sm:-top-6 left-2 sm:left-8 z-10"
              >
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 text-primary-700 px-3 sm:px-6 py-1 sm:py-2 rounded-full text-sm sm:text-lg font-comic font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                  <span role="img" aria-label="Sparkles">
                    ✨
                  </span>{" "}
                  Our Story{" "}
                  <span role="img" aria-label="Sparkles">
                    ✨
                  </span>
                </div>
              </motion.div>

              {/* Main Content */}
              <div className="bg-white flex-col items-center bg-opacity-50 backdrop-blur-xl mx-auto text-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 rounded-2xl sm:rounded-3xl shadow-2xl border-3 border-primary-100 relative overflow-hidden">
                {/* Decorative corners */}
                <div
                  className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-primary-100 rounded-bl-full opacity-50"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 w-20 sm:w-32 h-20 sm:h-32 bg-yellow-50 rounded-tr-full opacity-30"
                  aria-hidden="true"
                />

                {/* Heading */}
                <motion.header
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="relative z-10 mb-4 sm:mb-5 w-full"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-comic text-primary-700 leading-tight">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="block"
                    >
                      We&apos;re Building the
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="block mt-1 sm:mt-2"
                    >
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-primary-400 to-primary-500">
                        Future of Learning
                      </span>{" "}
                      <span className="relative inline-block">
                        <span className="relative z-10">Together!</span>
                        <motion.svg
                          className="absolute -bottom-1 sm:-bottom-2 left-0 w-full"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                          viewBox="0 0 100 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 5 Q 50 0 95 5"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-yellow-400"
                            strokeLinecap="round"
                          />
                        </motion.svg>
                      </span>
                    </motion.span>
                  </h1>
                </motion.header>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="relative w-full z-10 text-sm sm:text-lg md:text-xl text-primary-600 font-comic mb-4 sm:mb-6 leading-relaxed"
                >
                  At Ganzaa.org, we believe every child deserves to fall in love
                  with learning. Our mission is to transform education into an
                  adventure that excites, engages, and empowers the next
                  generation of thinkers, creators, and leaders.
                </motion.p>

                {/* CTA Section */}
                <motion.nav
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="w-full relative z-10 space-y-4 sm:space-y-8 mb-6 sm:mb-12"
                  role="navigation"
                  aria-label="Page navigation"
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center w-full">
                    <Link
                      href="#impact"
                      className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-comic border-2 border-white font-bold text-lg sm:text-xl rounded-full shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                      type="button"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        Discover Our Impact
                        <Heart
                          className="group-hover:animate-pulse"
                          size={24}
                          aria-hidden="true"
                        />
                      </span>
                    </Link>

                    <Link
                      href="#team"
                      className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 font-comic font-bold text-lg sm:text-xl rounded-full shadow-xl border-2 border-primary-200 hover:border-primary-300 transform hover:scale-105 hover:rotate-1 transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                      type="button"
                    >
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        Meet Our Team
                        <Users
                          className="group-hover:scale-110 transition-transform"
                          size={24}
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </div>
                </motion.nav>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    ),
    []
  );

  return heroContent;
};

export default HeroSection;
