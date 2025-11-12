"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GraduationCap, Users, Brain, MessageSquare, TrendingUp, Bell, School, ArrowRight, CheckCircle, Rocket, ChevronDown, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useClientSession } from '@/hooks/user/useClientSession';
import ProfileImage from '@/components/dashboard/ProfileImage';
import { UserMenuItem } from '@/components/menu/NavBar';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const { userRoleId, userId, userEmail, userImage, userName } =
    useClientSession();

  const userMenuItems: UserMenuItem[] = [
    { name: "Profile", href: "/profile", icon: User },
  ];

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/" });
    setUserMenuOpen(false);
  };

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-Time Monitoring",
      description: "Track student attendance, behavior, and performance in real-time across all classes"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Predictions",
      description: "Advanced AI analyzes patterns to predict dropout risk with 60-70% accuracy thresholds"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Seamless Communication",
      description: "Integrated chatbox connects teachers and parents for immediate intervention"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Early Warning System",
      description: "Automated notifications alert stakeholders when students show risk factors"
    }
  ];

  const stats = [
    { number: "3", label: "Dashboards", sublabel: "Teacher, Student & Parent" },
    { number: "100%", label: "Real-Time", sublabel: "Communication & Updates" },
    { number: "AI", label: "Powered", sublabel: "Predictive Analytics" }
  ];

  const toggleUserMenu = useCallback((): void => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen w-full max-w-7xl bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              SkoolaSync
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors">How It Works</Link>
            {userId && (
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">Dashboard</Link>
            )}
            
            {userId ? (
              // Enhanced User Profile Menu
              <div className="relative ml-2 xl:ml-4" ref={userMenuRef}>
                


                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Animated background shine */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{
                      x: userMenuOpen ? "100%" : "-100%",
                      opacity: userMenuOpen ? 1 : 0,
                    }}
                    transition={{
                      x: { duration: 0.6, ease: "easeInOut" },
                      opacity: { duration: 0.3 },
                    }}
                  />

                  <motion.div
                    className="relative w-8 h-8"
                    animate={
                      userMenuOpen
                        ? { scale: 1.1, rotate: 5 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {userImage ? (
                      <ProfileImage imageUrl={userImage} size="w-8 h-8" />
                    ) : (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
                        🦁
                      </div>
                    )}
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <span className="hidden xl:block font-comic font-medium text-sm relative z-10">
                    {userName?.split(" ")[0] || "User"}
                  </span>

                  <motion.div
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </motion.button>

                {/* Enhanced User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        duration: 0.4,
                      }}
                      className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-100/50 py-2 z-50 overflow-hidden"
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-blue-50/50" />

                      {/* User Info Header */}
                      <div className="relative px-4 py-4 border-b border-primary-100/50">
                        <motion.div
                          className="flex items-center gap-3"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <motion.div
                            className="relative w-10 h-10"
                            whileHover={{ scale: 1.1 }}
                          >
                            {userImage ? (
                              <Image
                                src={userImage}
                                alt={userName || "User"}
                                width={40}
                                height={40}
                                className="rounded-full object-cover border-2 border-primary-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center border-2 border-primary-200">
                                <User className="w-5 h-5 text-primary-600" />
                              </div>
                            )}
                            <motion.div
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-comic font-bold text-primary-700 text-sm">
                              {userName || "User"}
                            </p>
                            <p className="text-xs text-primary-500 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Menu Items */}
                      <div className="relative py-2">
                        {userMenuItems.map((item, index) => (
                          <motion.div
                            key={item.name}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-comic font-medium text-primary-700 hover:bg-primary-100/50 hover:text-primary-600 transition-all duration-300 group relative overflow-hidden"
                            >
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <item.icon
                                  size={18}
                                  className="text-primary-400 group-hover:text-primary-600 transition-colors"
                                />
                              </motion.div>
                              <span className="relative z-10">{item.name}</span>

                              {/* Hover effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary-100/0 via-primary-100/30 to-primary-100/0"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                              />
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="relative border-t border-primary-100/50 pt-2">
                        <motion.button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-comic font-medium text-red-600 hover:bg-red-50/50 transition-all duration-300 group relative overflow-hidden"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ x: 2 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <LogOut size={18} />
                          </motion.div>
                          <span className="relative z-10">Sign Out</span>

                          {/* Hover effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-red-50/0 via-red-50/50 to-red-50/0"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                          />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Enhanced Get Started Button
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="ml-2 "
              >
                <Link
                  href="/login"
                  className="group relative inline-flex items-center gap-2 px-6  py-2 overflow-hidden rounded-full font-comic font-bold text-sm transition-all duration-500"
                >
                  {/* Multi-layer animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ backgroundSize: "200% 100%" }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Pulsing glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary-400/30 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Content */}
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    <motion.div
                      animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                    >
                      <Rocket size={18} className="filter drop-shadow-sm" />
                    </motion.div>
                    <motion.span
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Login
                    </motion.span>
                  </span>

                  {/* Enhanced border effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/20"
                    whileHover={{ borderColor: "rgba(255,255,255,0.4)" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-amber-50 to-white opacity-60"></div>
        <div
          className="absolute top-20 right-10 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20"
          style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                Empowering Education in Rwanda
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Preventing Student Dropouts with
                <span className="bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent"> AI Technology</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                An innovative early warning system connecting teachers, parents, and students to identify and address dropout risks before they happen.
              </p>
              <div className="flex gap-4">
                <button className="bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-all hover:shadow-xl flex items-center gap-2 group">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-full hover:bg-green-50 transition-all">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-amber-500 rounded-3xl p-1 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="bg-white rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Dropout Risk Alert</div>
                      <div className="font-semibold text-gray-900">Student: Jean Pierre</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Risk Level</span>
                      <span className="text-amber-600 font-bold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>3 days absent this week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Decreased class participation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Failing 2 subjects</span>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-600 to-amber-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
                    View Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-amber-600">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-white text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-5xl font-bold">{stat.number}</div>
                <div className="text-xl font-semibold">{stat.label}</div>
                <div className="text-green-100">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Comprehensive <span className="text-green-600">Early Warning System</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to identify, track, and prevent student dropouts in one unified platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-amber-500 rounded-2xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              How <span className="text-green-600">SkoolaSync</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple three-step process to transform student support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-100 p-8 rounded-2xl space-y-4 h-full">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                <h3 className="text-2xl font-bold text-gray-900">Teachers Record Data</h3>
                <p className="text-gray-700">Teachers track attendance, behavior, and academic performance daily through an intuitive dashboard</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-100 p-8 rounded-2xl space-y-4 h-full">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <h3 className="text-2xl font-bold text-gray-900">AI Analyzes Patterns</h3>
                <p className="text-gray-700">Our AI engine identifies dropout risk factors and calculates risk percentages with actionable recommendations</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-100 p-8 rounded-2xl space-y-4 h-full">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                <h3 className="text-2xl font-bold text-gray-900">Stakeholders Act</h3>
                <p className="text-gray-700">Parents and teachers receive alerts and communicate through integrated chat to support students early</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboards Preview */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Three Powerful <span className="text-green-600">Dashboards</span>
            </h2>
            <p className="text-xl text-gray-600">Tailored interfaces for every stakeholder</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 space-y-4 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Student list management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Attendance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Behavior monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Performance recording</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 space-y-4 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Student Dashboard</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Personal profile view</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Attendance history</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Behavior records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Academic progress</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 space-y-4 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <School className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Parent Dashboard</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Student information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Real-time notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Class activities updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Teacher communication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-amber-600">
        <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Education in Your School?
          </h2>
          <p className="text-xl text-green-50">
            Join SkoolaSync today and help prevent student dropouts with AI-powered insights
          </p>
          <button className="bg-white text-green-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <School className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">SkoolaSync</span>
          </div>
          <p className="text-gray-400">
            Empowering education in Rwanda through technology
          </p>
          <div className="text-gray-500 text-sm">
            © 2025 SkoolaSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;