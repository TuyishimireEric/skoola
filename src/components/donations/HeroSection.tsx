import { motion } from "framer-motion";
import { Heart, Users, BookOpen, Globe } from "lucide-react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen pt-32 pb-16 overflow-hidden">
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
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-1/3 w-36 h-36 bg-green-200 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-yellow-100 px-6 py-3 rounded-full mb-6">
              <Heart className="w-5 h-5 text-primary-600" />
              <span className="font-comic font-semibold text-primary-700">
                Support Education for All
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold font-comic text-primary-800 mb-6"
          >
            Help Us Make Education{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-yellow-500">
              Accessible
            </span>{" "}
            to Everyone
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-primary-600 font-comic mb-8 max-w-3xl mx-auto"
          >
            Your donation helps us keep Ganzaa completely free for students
            worldwide, ensuring that quality education knows no boundaries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
          >
            <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-primary-100">
              <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold font-comic text-primary-700 mb-2">
                10,000+
              </h3>
              <p className="text-primary-600 font-comic text-sm">
                Students Helped
              </p>
            </div>
            <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-primary-100">
              <Globe className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold font-comic text-primary-700 mb-2">
                25+
              </h3>
              <p className="text-primary-600 font-comic text-sm">
                Countries Reached
              </p>
            </div>
            <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-primary-100">
              <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold font-comic text-primary-700 mb-2">
                100%
              </h3>
              <p className="text-primary-600 font-comic text-sm">Free Access</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
