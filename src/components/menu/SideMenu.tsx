"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  Activity,
  TrendingUp,
  MessageSquare,
  School,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";

// Types
interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

// Reusable SideNav Component 
const SideNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/login");
  };

  return (
    <aside
      className={`flex flex-col shadow-lg border-r border-gray-200 overflow-hidden min-h-screen transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-amber-500 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
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
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
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

      {/* Chat Section */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={() => handleNavigation("/dashboard/chat")}
          className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            isActive("/dashboard/chat")
              ? "bg-gradient-to-r from-green-500 to-amber-500 text-white shadow-lg shadow-green-500/30"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-current={isActive("/dashboard/chat") ? "page" : undefined}
        >
          <MessageSquare className="w-5 h-5" />
          {!isCollapsed && <span>Chat</span>}
          {!isCollapsed && isActive("/dashboard/chat") && (
            <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

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
};

export default SideNav;