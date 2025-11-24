"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Types
interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

// Reusable SideNav Component 
const SideNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Students",
      path: "/students",
    },
    {
      icon: <CalendarCheck className="w-5 h-5" />,
      label: "Attendance",
      path: "/attendance",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Courses",
      path: "/courses",
    }
  ];

  // Efficient active state check
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/login");
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Close mobile menu when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileOpen) {
        const sidebar = document.getElementById('sidebar');
        const mobileMenuButton = document.getElementById('mobile-menu-button');

        if (sidebar && !sidebar.contains(event.target as Node) &&
          mobileMenuButton && !mobileMenuButton.contains(event.target as Node)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  // Desktop sidebar component
  const DesktopSidebar = () => (
    <aside
      className={`hidden lg:flex flex-col shadow-lg border-r border-gray-200 overflow-hidden min-h-screen transition-all duration-300 ${isCollapsed ? "w-20 min-w-20" : "min-w-64"
        }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                <motion.div
                  className="w-8 h-8 relative"
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
                    className="object-contain"
                    priority
                    unoptimized
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              </Link>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                SkoolaSync
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                  ? "bg-gradient-to-r from-green-500 to-amber-500 text-white shadow-lg shadow-green-500/30"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={active ? "text-white" : "text-gray-500"}>
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  // Mobile sidebar component
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Sidebar */}
          <motion.aside
            id="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r border-gray-200 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                    <motion.div
                      className="w-8 h-8 relative"
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
                        className="object-contain"
                        priority
                        unoptimized
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.4 }}
                      />
                    </motion.div>
                  </Link>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                    SkoolaSync
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                        ? "bg-gradient-to-r from-green-500 to-amber-500 text-white shadow-lg shadow-green-500/30"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={active ? "text-white" : "text-gray-500"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  // Mobile header with hamburger menu
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-button"
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1763116382/logo_gc6c0r.png"
              alt="logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              SkoolaSync
            </span>
          </div>
        </div>

        {/* Current page indicator */}
        <div className="text-sm font-medium text-gray-600">
          {navItems.find(item => isActive(item.path))?.label || "Dashboard"}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Content padding for mobile header */}
      <div className="lg:hidden pt-16"></div>
    </>
  );
};

export default SideNav;