"use client";

import { motion } from "framer-motion";
import {
  Target,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  IMPACT_STATS,
  MISSION_FEATURES,
  TEAM_MEMBERS,
  VALUES,
} from "@/utils/Constants";
import TeamMemberCard from "@/components/about/TeamMemberCard";
import HeroSection from "@/components/about/HeroSection";
import { slideInVariants, fadeInVariants, scaleInVariants } from "@/utils/functions";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Mission Section */}
      <section
        className="py-16 sm:py-20 bg-gradient-to-b from-white to-primary-50 relative overflow-hidden"
        role="main"
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-primary-200 rounded-full opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-14 relative z-10">
          <div className="grid lg:grid-cols-1 gap-12 items-center">
            {/* Mission */}
            <motion.div
              initial="left"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideInVariants}
              transition={{ duration: 0.6 }}
            >
              <article className="bg-white bg-opacity-70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border-3 border-primary-100 relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-primary-100 rounded-bl-full opacity-50" />

                <header className="flex items-center gap-3 mb-6 relative z-10">
                  <motion.div
                    className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Target
                      className="w-8 h-8 text-primary-600"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-bold font-comic text-primary-700">
                    Our Mission
                  </h2>
                </header>
                <p className="text-lg text-primary-600 font-comic leading-relaxed mb-6">
                  At Ganzaa, our mission is to empower parents and support
                  children by creating an engaging, interactive learning
                  experience that nurtures both academic growth and a genuine
                  love for education. We are committed to helping parents
                  monitor their child’s progress with ease, offering tools that
                  provide insight into learning habits, performance, and
                  personal development. Through our platform, children can
                  explore their courses in a fun, interactive way that makes
                  studying enjoyable, meaningful, and connected to real-life
                  skills. By bridging the gap between home and school, we aim to
                  build a supportive environment where kids not only understand
                  what they’re learning — but also develop curiosity,
                  confidence, and a passion for knowledge.
                </p>
                <ul className="space-y-3" role="list">
                  {MISSION_FEATURES.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-primary-600 font-comic bg-primary-50 p-3 rounded-xl hover:bg-primary-100 transition-colors"
                    >
                      <CheckCircle2
                        className="w-5 h-5 text-green-500 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </article>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section
        id="our-impact"
        className="py-16 sm:py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-yellow-500 relative overflow-hidden"
        role="region"
        aria-labelledby="impact-heading"
      >
        {/* Animated background shapes */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-300 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.header
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInVariants}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-comic font-bold">
                Making a Difference
              </span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>

            <h2
              id="impact"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-comic text-white mb-4"
            >
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-white/90 font-comic max-w-2xl mx-auto">
              Real results from real families around the world
            </p>
          </motion.header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleInVariants}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group"
              >
                <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-center hover:bg-white/30 transition-all duration-300 border-2 border-white/20 relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className="text-4xl sm:text-5xl font-black text-white font-comic mb-2 relative z-10"
                  >
                    {stat.number}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white font-comic mb-2 relative z-10">
                    {stat.label}
                  </h3>
                  <p className="text-white/80 font-comic text-sm relative z-10">
                    {stat.description}
                  </p>

                  {/* Icon decoration */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 text-white/10 text-6xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  >
                    {index === 0 && "🎓"}
                    {index === 1 && "🏫"}
                    {index === 2 && "⭐"}
                    {index === 3 && "👨‍👩‍👧‍👦"}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        className="py-16 sm:py-20 bg-gradient-to-b from-white via-primary-50 to-yellow-50 relative overflow-hidden"
        role="region"
        aria-labelledby="values-heading"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-10 right-10 text-primary-200 text-8xl opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ⚙️
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-10 text-yellow-300 text-6xl opacity-20"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            💡
          </motion.div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.header
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInVariants}
            className="text-center mb-12"
          >
            <div className="inline-block">
              <h2
                id="values-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold font-comic text-primary-700 mb-4"
              >
                Our Core Values
              </h2>
              <motion.div
                className="w-32 h-1 bg-gradient-to-r from-primary-400 via-yellow-400 to-primary-400 rounded-full mx-auto"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <p className="text-xl text-primary-600 font-comic mt-4">
              The principles that guide everything we do
            </p>
          </motion.header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <motion.article
                key={value.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInVariants}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="group"
              >
                <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-3 border-primary-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full">
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <motion.div
                      className={`${value.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <value.icon
                        className={`w-8 h-8 ${value.color}`}
                        aria-hidden="true"
                      />
                    </motion.div>
                    <h3 className="text-xl font-bold font-comic text-primary-700 mb-2 text-center">
                      {value.title}
                    </h3>
                    <p className="text-primary-600 font-comic text-center text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="py-16 sm:py-24 bg-gradient-to-br from-primary-50 via-yellow-50 to-primary-100 relative overflow-hidden"
        role="region"
        aria-labelledby="team-heading"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full animate-bounce" />
          <div className="absolute top-32 right-20 w-16 h-16 bg-primary-300 rounded-full animate-pulse" />
          <div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-orange-300 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-32 right-1/3 w-14 h-14 bg-yellow-400 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/4 left-1/3 text-yellow-400 text-4xl"
            style={{
              animation: "spin 6s linear infinite",
            }}
          >
            ⭐
          </div>
          <div
            className="absolute bottom-1/3 right-1/4 text-orange-400 text-3xl"
            style={{
              animation: "spin 8s linear infinite",
              animationDelay: "1s",
            }}
          >
            ✨
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.header
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <h2
                id="team-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-black font-comic text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-yellow-500 to-orange-500 mb-2 drop-shadow-sm"
              >
                Meet Our Super Team!{" "}
                <span role="img" aria-label="Star">
                  🌟
                </span>
              </h2>
              <div
                className="w-full h-2 bg-gradient-to-r from-primary-400 via-yellow-400 to-orange-400 rounded-full"
                aria-hidden="true"
              />
            </div>

            <p className="text-xl sm:text-2xl text-primary-700 font-comic max-w-3xl mx-auto leading-relaxed">
              Amazing friends who love making learning{" "}
              <span className="text-yellow-600 font-black">super fun</span> and{" "}
              <span className="text-orange-600 font-black">exciting</span> for
              you!{" "}
              <span role="img" aria-label="Rocket">
                🚀
              </span>
            </p>
          </motion.header>

          {/* Team Grid */}
          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row justify-center gap-8 max-w-6xl">
              {TEAM_MEMBERS.map((member, index) => (
                <TeamMemberCard
                  key={member.name}
                  member={member}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInVariants}
            transition={{ delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="inline-block bg-gradient-to-r from-primary-500 via-yellow-500 to-orange-500 rounded-full p-1">
              <div className="bg-white rounded-full px-8 py-4">
                <p className="text-xl font-comic font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-orange-600">
                  Ready to learn and have fun with us?{" "}
                  <span role="img" aria-label="Party">
                    🎉
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
