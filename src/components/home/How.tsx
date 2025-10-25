"use client";

import Link from "next/link";
import { memo } from "react";
import {
  UserPlus,
  BookOpen,
  Trophy,
  Rocket,
  Star,
  LucideIcon,
} from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "Create Your Free Account",
    description:
      "Sign up in seconds and create your personalized learning profile to begin your educational journey",
    icon: "👤",
    color: "from-green-400 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    lucideIcon: UserPlus,
  },
  {
    step: 2,
    title: "Choose Your Learning Path",
    description:
      "Select subjects you love, set your age preferences, and customize your learning experience",
    icon: "📚",
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50",
    lucideIcon: BookOpen,
  },
  {
    step: 3,
    title: "Start Playing & Learning",
    description:
      "Jump into exciting games, complete fun activities, and earn rewards as you grow smarter every day",
    icon: "🏆",
    color: "from-orange-400 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    lucideIcon: Trophy,
  },
];

// Types
type Step = {
  step: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  lucideIcon: LucideIcon;
};

type StepCardProps = {
  item: Step;
  index: number;
};

// Step card component (optimized)
const StepCard = memo(({ item, index }: StepCardProps) => {
  const IconComponent = item.lucideIcon;

  return (
    <div
      className={`group relative h-full animate__animated animate__fadeInUp animate__delay-${index}s`}
    >
      <article className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border-4 border-white/50 relative h-full transition-all duration-300 group-hover:shadow-2xl">
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Step Number Badge */}
        <div
          className={`absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${item.color} text-white text-lg sm:text-xl font-comic font-bold w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          {item.step}
        </div>

        <div className="relative z-10 mt-8 text-center">
          {/* Emoji Icon */}
          <div className="text-4xl sm:text-5xl mb-4 animate__animated animate__bounce animate__infinite">
            {item.icon}
          </div>

          {/* Lucide Icon */}
          <div
            className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-xl shadow-lg mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
          >
            <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 font-comic mb-3 group-hover:text-gray-900 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-600 font-comic text-sm sm:text-base leading-relaxed group-hover:text-gray-700 transition-colors">
            {item.description}
          </p>

          {/* Decorative corner */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
        </div>
      </article>
    </div>
  );
});

StepCard.displayName = "StepCard";

export const HowItWorksSection = () => {
  return (
    <section
      className="relative px-8 py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50"
      aria-labelledby="how-it-works-title"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 text-4xl opacity-20 animate__animated animate__bounce animate__infinite">
          📱
        </div>
        <div className="absolute bottom-20 left-10 text-3xl opacity-15 animate__animated animate__bounce animate__infinite animate__delay-1s">
          🎯
        </div>
        <div className="absolute top-40 left-1/4 text-2xl opacity-10 animate__animated animate__bounce animate__infinite animate__delay-2s">
          ⭐
        </div>

        {/* Soft blobs */}
        <div className="absolute top-10 right-1/3 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-green-200 rounded-full opacity-20 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate__animated animate__fadeInUp">
          <div className="inline-block mb-6 animate__animated animate__fadeInDown">
            <div className="bg-gradient-to-r from-green-300 to-yellow-300 text-gray-800 px-6 py-3 rounded-full text-sm sm:text-base font-comic font-bold shadow-lg border-2 border-green-200 transform rotate-1">
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Easy to Get Started
                <Star className="w-5 h-5 text-yellow-600" />
              </span>
            </div>
          </div>

          <h2
            id="how-it-works-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 font-comic mb-4 animate__animated animate__fadeInUp animate__delay-1s"
          >
            Start Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-yellow-500">
              Adventure
            </span>{" "}
            Today!
          </h2>

          <p className="text-lg text-gray-700 font-comic max-w-3xl mx-auto animate__animated animate__fadeInUp animate__delay-2s">
            <span className="hidden sm:inline">
              Getting started with Ganzaa is as easy as 1-2-3! Join thousands of
              happy learners today.
            </span>
            <span className="sm:hidden">
              Getting started is as easy as 1-2-3!
            </span>
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-12 sm:mb-16">
          {STEPS.map((item, index) => (
            <StepCard key={item.step} item={item} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center animate__animated animate__fadeInUp animate__delay-3s">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-full font-bold font-comic text-lg sm:text-2xl shadow-2xl border-4 border-green-300 relative overflow-hidden group transition-all duration-300 hover:scale-105"
          >
            <Rocket className="w-6 h-6 animate__animated animate__tada animate__infinite animate__slow" />
            <span>
              <span className="hidden sm:inline">Create Free Account</span>
              <span className="sm:hidden">Get Started</span>
            </span>
            <span className="text-2xl animate__animated animate__bounce animate__infinite animate__slower">
              🚀
            </span>
          </Link>

          <p className="mt-4 sm:mt-6 text-gray-600 font-comic text-sm sm:text-base animate__animated animate__fadeIn animate__delay-4s">
            <span className="hidden sm:inline">
              🎉 No credit card required • Completely free to get started • Join
              10,000+ happy families
            </span>
            <span className="sm:hidden">
              🎉 Free to start • No credit card needed
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
