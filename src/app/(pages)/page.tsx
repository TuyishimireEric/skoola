"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GraduationCap, Users, Brain, MessageSquare, Bell, School, ArrowRight, CheckCircle, Rocket, ChevronDown, User, LogOut, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const { userId, userEmail, userImage, userName, userRoleId } =
    useClientSession();

  const userMenuItems: UserMenuItem[] = [
    { name: "Profile", href: "/", icon: User },
  ];

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/" });
    setUserMenuOpen(false);
  };

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Real-Time Monitoring",
      description: "Track student attendance, behavior, and performance in real-time across all classes"
    },
    {
      icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "AI-Powered Predictions",
      description: "Advanced AI analyzes patterns to predict dropout risk with 60-70% accuracy thresholds"
    },
    {
      icon: <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Seamless Communication",
      description: "Integrated chatbox connects teachers and parents for immediate intervention"
    },
    {
      icon: <Bell className="w-6 h-6 sm:w-8 sm:h-8" />,
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

  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 relative"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  duration: 0.6,
                }}
              >
                <Image
                  src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1763116382/logo_gc6c0r.png"
                  alt="logo"
                  width={50}
                  height={50}
                  className="object-contain w-full h-full"
                  priority
                  unoptimized
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </Link>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              SkoolaSync
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-green-600 transition-colors text-sm lg:text-base">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors text-sm lg:text-base">How It Works</Link>
            {userRoleId == 1 && (
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors text-sm lg:text-base">Dashboard</Link>
            )}

            {userRoleId == 6 && (
              <Link href="/students" className="text-gray-600 hover:text-green-600 transition-colors text-sm lg:text-base">Students</Link>
            )}

            {userId ? (
              <div className="relative ml-2 xl:ml-4" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
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
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-blue-50/50" />

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
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="ml-2"
              >
                <Link
                  href="/login"
                  className="group relative inline-flex items-center gap-2 px-6 py-2 overflow-hidden rounded-full font-comic font-bold text-sm transition-all duration-500"
                >
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

                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/20"
                    whileHover={{ borderColor: "rgba(255,255,255,0.4)" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {userId && (
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors p-2">
                <School className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4"
            >
              <Link
                href="#features"
                className="block text-gray-600 hover:text-green-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block text-gray-600 hover:text-green-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {!userId && (
                <Link
                  href="/login"
                  className="block bg-green-600 text-white px-4 py-2 rounded-full text-center hover:bg-green-700 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-amber-50 to-white opacity-60"></div>
        <div
          className="absolute top-20 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-green-200 rounded-full blur-3xl opacity-20"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
        <div
          className="absolute bottom-20 left-4 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-amber-200 rounded-full blur-3xl opacity-20"
          style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                Empowering Education in Rwanda
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Preventing Student Dropouts with
                <span className="bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent block"> AI Technology</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                An innovative early warning system connecting teachers, parents, and students to identify and address dropout risks before they happen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-green-700 transition-all hover:shadow-xl flex items-center gap-2 justify-center group">
                  Get Started
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-green-600 text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-green-50 transition-all">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-green-500 to-amber-500 rounded-2xl lg:rounded-3xl p-1 shadow-2xl transform hover:scale-105 transition-transform duration-500 max-w-md mx-auto lg:max-w-none">
                <div className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Dropout Risk Alert</div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">Student: Jean Pierre</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Risk Level</span>
                      <span className="text-amber-600 font-bold text-sm sm:text-base">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
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
                  <button className="w-full bg-gradient-to-r from-green-600 to-amber-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all text-sm sm:text-base">
                    View Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-amber-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-white text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold">{stat.number}</div>
                <div className="text-lg sm:text-xl font-semibold">{stat.label}</div>
                <div className="text-green-100 text-sm sm:text-base">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Comprehensive <span className="text-green-600">Early Warning System</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Everything you need to identify, track, and prevent student dropouts in one unified platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-amber-500 rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              How <span className="text-green-600">SkoolaSync</span> Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              A simple three-step process to transform student support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-100 p-6 sm:p-8 rounded-2xl space-y-4 h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">1</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Teachers Record Data</h3>
                <p className="text-gray-700 text-sm sm:text-base">Teachers track attendance, behavior, and academic performance daily through an intuitive dashboard</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-100 p-6 sm:p-8 rounded-2xl space-y-4 h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">2</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">AI Analyzes Patterns</h3>
                <p className="text-gray-700 text-sm sm:text-base">Our AI engine identifies dropout risk factors and calculates risk percentages with actionable recommendations</p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-100 p-6 sm:p-8 rounded-2xl space-y-4 h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">3</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Stakeholders Act</h3>
                <p className="text-gray-700 text-sm sm:text-base">Parents and teachers receive alerts and communicate through integrated chat to support students early</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboards Preview */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Three Powerful <span className="text-green-600">Dashboards</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Tailored interfaces for every stakeholder</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white border-2 border-green-200 rounded-2xl p-6 sm:p-8 space-y-4 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Teacher Dashboard</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Student list management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Attendance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Behavior monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Performance recording</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 sm:p-8 space-y-4 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Student Dashboard</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Personal profile view</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Attendance history</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Behavior records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Academic progress</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-2xl p-6 sm:p-8 space-y-4 hover:shadow-xl transition-all md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <School className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Parent Dashboard</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Student information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Real-time notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Class activities updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Teacher communication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-green-600 to-amber-600">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold px-4">
            Ready to Transform Education in Your School?
          </h2>
          <p className="text-lg sm:text-xl text-green-50 px-4">
            Join SkoolaSync today and help prevent student dropouts with AI-powered insights
          </p>
          <button className="bg-white text-green-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-2xl transition-all hover:scale-105">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <School className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            <span className="text-xl sm:text-2xl font-bold">SkoolaSync</span>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Empowering education in Rwanda through technology
          </p>
          <div className="text-gray-500 text-xs sm:text-sm">
            © 2025 SkoolaSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;