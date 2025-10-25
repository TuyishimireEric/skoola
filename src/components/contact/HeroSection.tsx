"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Send, HeartHandshake, Users } from "lucide-react";
import Link from "next/link";

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection: React.FC = () => {
  // Memoize the JSX content for performance
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
            <div className="absolute right-0 bottom-0 w-full sm:w-4/5 md:w-3/5 lg:w-1/2 h-full opacity-15 sm:opacity-25 md:opacity-35">
              <div className="relative w-full h-full flex items-end justify-end">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 right-20 text-8xl"
                  role="img"
                  aria-label="Mail"
                >
                  📧
                </motion.div>
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-40 right-40 text-7xl"
                  role="img"
                  aria-label="Phone"
                >
                  📞
                </motion.div>
                <motion.div
                  animate={{
                    y: [0, -25, 0],
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-10 right-60 text-6xl"
                  role="img"
                  aria-label="Heart"
                >
                  💝
                </motion.div>
                <motion.div
                  animate={{
                    y: [0, -18, 0],
                    x: [0, 10, 0],
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
                  className="absolute top-20 right-32 text-5xl"
                  role="img"
                  aria-label="Wave"
                >
                  👋
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 flex items-center min-h-screen pt-24 md:pt-20 pb-8 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
          <div className="w-full max-w-6xl mx-auto text-center">
            {/* Floating particles */}
            <motion.div
              className="absolute -top-10 -left-10 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-30 blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute top-1/4 right-10 w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-25 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
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
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 text-black px-3 sm:px-6 py-1 sm:py-2 rounded-full text-sm sm:text-lg font-comic font-bold shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                  <span role="img" aria-label="Wave">
                    👋
                  </span>{" "}
                  Get in Touch{" "}
                  <span role="img" aria-label="Heart">
                    💛
                  </span>
                </div>
              </motion.div>

              {/* Main Content */}
              <div className="bg-white/40 backdrop-blur-xl mx-auto text-center p-6 sm:p-8 md:p-10 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white/50 relative overflow-hidden">
                {/* Decorative corners */}
                <div
                  className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-60"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full opacity-50"
                  aria-hidden="true"
                />

                {/* Heading */}
                <motion.header
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="relative z-10 mb-6 sm:mb-8 w-full"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-comic text-primary-700 leading-tight">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="block"
                    >
                      We&apos;d Love to
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="block mt-1 sm:mt-2"
                    >
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-primary-400 to-primary-500">
                        Hear from You!
                      </span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="inline-block ml-4"
                      >
                        <HeartHandshake
                          className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500 inline"
                          aria-hidden={true}
                        />
                      </motion.div>
                    </motion.span>
                  </h1>
                </motion.header>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="relative w-full z-10 text-sm sm:text-lg md:text-xl text-primary-600 font-comic mb-4 sm:mb-6 leading-relaxed"
                >
                  Have questions about Ganzaa? Want to partner with us? Or just
                  want to say hello? We&apos;re here to help and would love to
                  connect with you. Choose your preferred way to reach out!
                </motion.p>

                {/* CTA Section */}
                <motion.nav
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="w-full relative z-10 mb-4"
                  role="navigation"
                  aria-label="Contact page navigation"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                    <Link
                      href="#contact-form"
                      className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 via-primary-400 to-primary-500 text-white font-comic font-bold text-lg sm:text-xl rounded-full shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        Send Us a Message
                        <Send
                          className="group-hover:translate-x-1 transition-transform"
                          size={24}
                          aria-hidden={true}
                        />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>

                    <Link
                      href="/faq"
                      className="group px-8 sm:px-10 py-3 sm:py-4 bg-white/80 backdrop-blur-sm text-primary-600 font-comic font-bold text-lg sm:text-xl rounded-full shadow-xl border-2 border-primary-200 hover:border-primary-400 hover:bg-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300 focus:ring-offset-2"
                    >
                      <span className="flex items-center justify-center gap-3">
                        Browse FAQ
                        <Users
                          className="group-hover:scale-110 transition-transform"
                          size={24}
                          aria-hidden={true}
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
