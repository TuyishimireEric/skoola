"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  Home,
  Gamepad2,
  Info,
  Phone,
  Heart,
  Rocket,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useClientSession } from "@/hooks/user/useClientSession";
import CompleteProfileModal from "../auth/CompleteProfile";
import ProfileImage from "../dashboard/ProfileImage";

// Define proper interfaces
interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  featured?: boolean;
}

export interface UserMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}
// Type guard for userRoleId
const isValidUserRoleId = (roleId: unknown): roleId is number => {
  return typeof roleId === "number" && !isNaN(roleId);
};

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [shouldCompleteProfile, setShouldCompleteProfile] =
    useState<boolean>(false);

  const { userRoleId, userId, userEmail, userImage, userName } =
    useClientSession();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((): void => {
    const scrollPosition = window.scrollY;
    setIsScrolled(scrollPosition > 50);
  }, []);

  useEffect(() => {
    if (userRoleId === 5 && !pathname.includes("teacher")) {
      setShouldCompleteProfile(true);
    }
  }, [userRoleId, pathname]);

  useEffect(() => {
    let ticking = false;
    const throttledScroll = (): void => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback((): void => {
    setMobileMenuOpen(false);
  }, []);

  const toggleUserMenu = useCallback((): void => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/" });
    setUserMenuOpen(false);
  };

  // Base menu items
  const baseMenuItems: MenuItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Donate", href: "/donate", icon: Heart },
  ];

  // Create menu items with role-based additions
  const getMenuItems = (): MenuItem[] => {
    const menuItems = [...baseMenuItems];

    if (isValidUserRoleId(userRoleId)) {
      if (userRoleId === 1) {
        menuItems.push({
          name: "Dashboard",
          href: "/dashboard",
          icon: Sparkles,
          featured: true,
        });
      }
      if (userRoleId === 2) {
        menuItems.push({
          name: "My Progress",
          href: "/kids",
          icon: Sparkles,
          featured: true,
        });
      }
      if (userRoleId === 6) {
        menuItems.push({
          name: "Parent dashboard",
          href: "/parent",
          icon: Sparkles,
          featured: true,
        });
      }
    } else {
      // Default case when userRoleId is not available or invalid
      menuItems.push({
        name: "Donate",
        href: "/donate",
        icon: Sparkles,
        featured: true,
      });
    }

    return menuItems;
  };

  const menuItems = getMenuItems();

  const userMenuItems: UserMenuItem[] = [
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isActiveLink = (href: string): boolean => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const hideNavBar = pathname.includes("retry");

  const isPlaying: boolean = pathname.includes("play") || hideNavBar;

  return (
    <>
      {shouldCompleteProfile && userId && userEmail && (
        <CompleteProfileModal
          isOpen={shouldCompleteProfile}
          onClose={() => setShouldCompleteProfile(false)}
          userId={userId}
          userEmail={userEmail}
        />
      )}
      {/* Enhanced Navigation Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`${
          isPlaying ? "hidden" : "fixed"
        } top-0 left-0 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2 z-40 transition-all duration-700 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/20"
            : "bg-transparent"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex justify-between items-center w-full">
          {/* Enhanced Logo Section */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              className="w-12 h-12 relative"
              whileHover={{
                scale: 1.15,
                rotate: [0, -5, 5, 0],
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                duration: 0.6,
              }}
            >
              <Image
                src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1750008049/Logo_gnwstm.png"
                alt="Ganzaa logo"
                width={56}
                height={56}
                className="object-contain"
                priority
                unoptimized
              />
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {menuItems.map((item) => {
              const isActive = isActiveLink(item.href);
              const isHovered = hoveredItem === item.name;

              return (
                <motion.div
                  key={item.name}
                  className="relative"
                  onHoverStart={() => setHoveredItem(item.name)}
                  onHoverEnd={() => setHoveredItem(null)}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-4 xl:px-5 py-2 rounded-xl font-comic font-medium text-sm transition-all duration-500 group flex items-center gap-2 ${
                      item.featured
                        ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl"
                        : isActive
                        ? "text-primary-700 bg-primary-50/80 backdrop-blur-sm"
                        : "text-primary-600 hover:text-primary-700"
                    }`}
                  >
                    {/* Background animations for non-featured items */}
                    {!item.featured && (
                      <>
                        {/* Hover background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary-100/80 to-primary-50/80 backdrop-blur-sm rounded-xl"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: isHovered ? 1 : 0,
                            scale: isHovered ? 1 : 0.8,
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />

                        {/* Active background */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary-100 to-blue-50 rounded-xl border border-primary-200/50"
                            layoutId="activeBackground"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </>
                    )}

                    {/* Featured item special effects */}
                    {item.featured && (
                      <>
                        {/* Animated gradient background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl"
                          animate={{
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ backgroundSize: "200% 100%" }}
                        />

                        {/* Pulsing glow */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl blur-md opacity-40"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.6, 0.4],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Sparkle effects */}
                        <div className="absolute inset-0 overflow-hidden rounded-xl">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                top: `${20 + i * 30}%`,
                                left: `${20 + i * 25}%`,
                              }}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                                rotate: [0, 180, 360],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Icon with enhanced animations */}
                    <motion.div
                      animate={
                        item.featured
                          ? {
                              rotate: [0, 15, -15, 0],
                              scale: [1, 1.2, 1, 1.1, 1],
                            }
                          : isHovered
                          ? {
                              scale: 1.2,
                              rotate: 10,
                              y: -2,
                            }
                          : {
                              scale: 1,
                              rotate: 0,
                              y: 0,
                            }
                      }
                      transition={
                        item.featured
                          ? {
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 3,
                              ease: "easeInOut",
                            }
                          : {
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                              duration: 0.4,
                            }
                      }
                      className="relative z-10"
                    >
                      <item.icon
                        size={18}
                        className={`transition-all duration-300 ${
                          item.featured
                            ? "text-white drop-shadow-sm"
                            : isActive
                            ? "text-primary-700"
                            : "text-primary-500"
                        }`}
                      />
                    </motion.div>

                    {/* Text with smooth animations */}
                    <motion.span
                      className="relative z-10"
                      animate={
                        isHovered ? { x: 3, scale: 1.02 } : { x: 0, scale: 1 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                        duration: 0.3,
                      }}
                    >
                      {item.name}
                    </motion.span>

                    {/* Enhanced active indicator */}
                    {!item.featured && isActive && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 w-8 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"
                        layoutId="activeIndicator"
                        initial={{ x: "-50%", opacity: 0, scale: 0 }}
                        animate={{ x: "-50%", opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          duration: 0.6,
                        }}
                      />
                    )}

                    {/* Hover indicator */}
                    {!item.featured && !isActive && isHovered && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 w-6 h-0.5 bg-primary-400 rounded-full"
                        initial={{ x: "-50%", opacity: 0, scaleX: 0 }}
                        animate={{ x: "-50%", opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}

            {/* Enhanced Separator */}
            <motion.div
              className="h-8 w-px bg-gradient-to-b from-transparent via-primary-200 to-transparent mx-3"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />

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
                      Get Started
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
          </nav>

          {/* Enhanced Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(99, 102, 241, 0.1)",
            }}
            className="lg:hidden p-3 rounded-xl text-primary-600 transition-all duration-300 relative overflow-hidden"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {/* Background ripple effect */}
            <motion.div
              className="absolute inset-0 bg-primary-100 rounded-xl"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="relative z-10"
                >
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="relative z-10"
                >
                  <Menu size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
              onClick={closeMobileMenu}
            />
            <motion.nav
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5,
              }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl z-50 lg:hidden overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-blue-50/30" />

              <div className="flex flex-col h-full relative z-10">
                {/* Enhanced Header */}
                <div className="p-6 border-b border-primary-100/50 bg-white/50">
                  <motion.div
                    className="flex justify-between items-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.h2
                      className="text-xl font-comic font-bold text-primary-600"
                      whileHover={{ scale: 1.05 }}
                    >
                      Menu
                    </motion.h2>
                    <motion.button
                      whileTap={{ scale: 0.9, rotate: 90 }}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                      }}
                      onClick={closeMobileMenu}
                      className="p-2 rounded-xl text-primary-500 transition-all duration-300"
                      aria-label="Close menu"
                    >
                      <X size={24} />
                    </motion.button>
                  </motion.div>
                </div>

                {/* Enhanced Menu Items */}
                <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                  {menuItems.map((item, index) => {
                    const isActive = isActiveLink(item.href);

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          delay: 0.1 + index * 0.08,
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        whileHover={{ x: 5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={`flex items-center gap-4 px-4 py-4 rounded-xl font-comic font-medium text-base transition-all duration-300 relative overflow-hidden group ${
                            item.featured
                              ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg"
                              : isActive
                              ? "bg-gradient-to-r from-primary-100 to-blue-50 text-primary-700 border-l-4 border-primary-500"
                              : "text-primary-700 hover:bg-primary-50/80"
                          }`}
                        >
                          {/* Background animations for non-featured items */}
                          {!item.featured && !isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-blue-50/50 rounded-xl"
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}

                          {/* Featured item sparkle background */}
                          {item.featured && (
                            <>
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl"
                                animate={{
                                  backgroundPosition: [
                                    "0% 50%",
                                    "100% 50%",
                                    "0% 50%",
                                  ],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                style={{ backgroundSize: "200% 100%" }}
                              />

                              {/* Mobile sparkles */}
                              <div className="absolute inset-0 overflow-hidden rounded-xl">
                                {[...Array(4)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    style={{
                                      top: `${15 + i * 20}%`,
                                      left: `${10 + i * 25}%`,
                                    }}
                                    animate={{
                                      scale: [0, 1, 0],
                                      opacity: [0, 1, 0],
                                      rotate: [0, 180, 360],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: i * 0.3,
                                      ease: "easeInOut",
                                    }}
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {/* Enhanced icon */}
                          <motion.div
                            animate={
                              item.featured
                                ? {
                                    rotate: [0, 15, -15, 0],
                                    scale: [1, 1.2, 1, 1.1, 1],
                                  }
                                : {}
                            }
                            transition={
                              item.featured
                                ? {
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    ease: "easeInOut",
                                  }
                                : {}
                            }
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            className="relative z-10 flex-shrink-0"
                          >
                            <item.icon
                              size={22}
                              className={`transition-all duration-300 ${
                                item.featured
                                  ? "text-white drop-shadow-sm"
                                  : isActive
                                  ? "text-primary-600"
                                  : "text-primary-500"
                              }`}
                            />
                          </motion.div>

                          <motion.span
                            className="relative z-10 flex-1"
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {item.name}
                          </motion.span>

                          {/* Active indicator for mobile */}
                          {isActive && !item.featured && (
                            <motion.div
                              className="absolute right-3 top-1/2 w-2 h-2 bg-primary-600 rounded-full"
                              initial={{ scale: 0, y: "-50%" }}
                              animate={{ scale: 1, y: "-50%" }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                delay: 0.2,
                              }}
                            />
                          )}

                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Enhanced Mobile User Menu Items */}
                  {userId && (
                    <>
                      <motion.div
                        className="border-t border-primary-100/50 my-6 pt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <motion.p
                          className="text-sm font-comic font-bold text-primary-600 mb-4 px-4"
                          whileHover={{ x: 3 }}
                        >
                          Your Account
                        </motion.p>
                        {userMenuItems.map((item, index) => (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.6 + index * 0.05,
                              type: "spring",
                              stiffness: 400,
                            }}
                            whileHover={{ x: 5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href={item.href}
                              onClick={closeMobileMenu}
                              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-comic font-medium text-base transition-all duration-300 relative overflow-hidden group ${
                                isActiveLink(item.href)
                                  ? "bg-gradient-to-r from-primary-100 to-blue-50 text-primary-700 border-l-4 border-primary-500"
                                  : "text-primary-700 hover:bg-primary-50/80"
                              }`}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-blue-50/50 rounded-xl opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                              />

                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                className="relative z-10"
                              >
                                <item.icon
                                  size={20}
                                  className="text-primary-500"
                                />
                              </motion.div>

                              <motion.span
                                className="relative z-10"
                                whileHover={{ x: 3 }}
                              >
                                {item.name}
                              </motion.span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Enhanced Footer */}
                <div className="p-6 border-t border-primary-100/50 bg-white/50">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 400 }}
                  >
                    {userId ? (
                      <div className="space-y-4">
                        {/* Enhanced User info in mobile */}
                        <motion.div
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100/50 relative overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary-100/30 to-blue-100/30"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />

                          <motion.div
                            className="relative w-10 h-10"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            {userImage ? (
                              <ProfileImage
                                imageUrl={userImage}
                                size="w-8 h-8"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center border-2 border-primary-200">
                                🦁
                              </div>
                            )}
                            <motion.div
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          <div className="flex-1 relative z-10">
                            <p className="font-comic font-bold text-primary-700 text-sm">
                              {userName || "User"}
                            </p>
                            <p className="text-xs text-primary-500 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </motion.div>

                        {/* Enhanced logout button */}
                        <motion.button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-comic font-bold text-base shadow-lg relative overflow-hidden group"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                          />

                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -10 }}
                            className="relative z-10"
                          >
                            <LogOut size={22} />
                          </motion.div>
                          <span className="relative z-10">Sign Out</span>
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href="/login"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-comic font-bold text-base shadow-lg relative overflow-hidden group"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                          />

                          <motion.div
                            animate={{
                              rotate: [0, 15, -15, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                            className="relative z-10"
                          >
                            <Rocket size={22} />
                          </motion.div>
                          <span className="relative z-10">Get Started</span>
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
