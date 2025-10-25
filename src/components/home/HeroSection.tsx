"use client";

import { motion } from "framer-motion";
import { AlertCircle, Users, TrendingUp, Bell, School, BarChart3, UserCheck } from "lucide-react";
import { useState } from "react";

// Simulated session hook - replace with your actual implementation
const useClientSession = () => {
  const [session] = useState({ userRoleId: null, userId: null });
  return session;
};

const isValidUserRoleId = (roleId: unknown): roleId is number => {
  return typeof roleId === "number" && !isNaN(roleId);
};

export default function HeroSection() {
  const { userRoleId, userId } = useClientSession();

  const getButtonContent = () => {
    if (!userId) {
      return {
        text: "Get Started",
        href: "/login",
        icon: School,
        gradient: "from-blue-600 to-indigo-600",
      };
    }

    if (isValidUserRoleId(userRoleId)) {
      if (userRoleId === 2) {
        // Student
        return {
          text: "View Dashboard",
          href: "/student",
          icon: UserCheck,
          gradient: "from-green-600 to-emerald-600",
        };
      }
      if (userRoleId === 6) {
        // Parent
        return {
          text: "Monitor Progress",
          href: "/parent",
          icon: Users,
          gradient: "from-purple-600 to-pink-600",
        };
      }
      if (userRoleId === 5) {
        // Teacher
        return {
          text: "Early Warning System",
          href: "/teacher",
          icon: AlertCircle,
          gradient: "from-orange-600 to-red-600",
        };
      }
      if (userRoleId === 3) {
        // School Leader
        return {
          text: "School Analytics",
          href: "/admin",
          icon: BarChart3,
          gradient: "from-blue-600 to-cyan-600",
        };
      }
    }

    return {
      text: "Access Platform",
      href: "/dashboard",
      icon: TrendingUp,
      gradient: "from-blue-600 to-indigo-600",
    };
  };

  const buttonContent = getButtonContent();
  const ButtonIcon = buttonContent.icon;

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-600"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 right-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-40 h-40 bg-indigo-400 rounded-full opacity-20 blur-3xl"
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen pt-24 md:pt-20 pb-12 px-4 sm:px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
        <div className="w-full lg:w-10/12 xl:w-9/12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Impact Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                <AlertCircle size={18} />
                <span>Early Warning System for Rwanda</span>
              </div>
            </motion.div>

            {/* Main Content Card */}
            <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 md:p-12 lg:p-14 rounded-3xl shadow-2xl border border-blue-100 relative overflow-hidden">
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 mb-6"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-4">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="block"
                  >
                    Welcome to
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="block"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                      SkoolaSync
                    </span>
                  </motion.span>
                </h1>

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="h-1 w-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full origin-left"
                />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative z-10 text-xl sm:text-2xl text-gray-700 font-medium mb-6 leading-relaxed"
              >
                Preventing student dropout through{" "}
                <span className="text-blue-600 font-semibold">real-time monitoring</span> and{" "}
                <span className="text-indigo-600 font-semibold">collaborative action</span>
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="relative z-10 text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl"
              >
                A technology-based early warning system addressing high dropout rates in Rwanda's rural primary schools. SkoolaSync bridges the communication gap among parents, teachers, school leaders, and students by providing real-time oversight of attendance, academic performance, and behavioral patterns.
              </motion.p>

              {/* Key Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              >
                {[
                  { icon: Bell, label: "Real-Time Alerts", color: "text-orange-600" },
                  { icon: Users, label: "Connected Community", color: "text-blue-600" },
                  { icon: TrendingUp, label: "Data-Driven Insights", color: "text-green-600" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <feature.icon className={`${feature.color}`} size={24} />
                    <span className="font-semibold text-gray-800">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="relative z-10 flex flex-col sm:flex-row gap-4"
              >
                <a
                  href={buttonContent.href}
                  className={`group relative px-8 py-4 bg-gradient-to-r ${buttonContent.gradient} text-white font-semibold text-lg rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden text-center`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {buttonContent.text}
                    <ButtonIcon
                      className="group-hover:translate-x-1 transition-transform"
                      size={22}
                    />
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </a>

                <a
                  href="/about"
                  className="group px-8 py-4 bg-white text-gray-700 font-semibold text-lg rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
                >
                  <span className="flex items-center justify-center gap-3">
                    Learn More
                    <School className="group-hover:rotate-12 transition-transform" size={22} />
                  </span>
                </a>
              </motion.div>

              {/* Trust Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="relative z-10 mt-8 pt-6 border-t border-gray-200"
              >
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-600 font-semibold">✓</span>
                  Supporting rural primary schools across Rwanda
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}