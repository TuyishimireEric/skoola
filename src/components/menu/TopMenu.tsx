import React, { useEffect, useState, Suspense, useRef } from "react";
import { Search, X, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoHome } from "react-icons/io5";
import dynamic from "next/dynamic";

// import { useCourses } from "@/hooks/courses/useCourses";
import { useClientSession } from "@/hooks/user/useClientSession";
import { getInitials } from "@/utils/functions";
import type { GameDataI } from "@/types/Course";

// Dynamically import CourseCard when needed
const CourseCard = dynamic(() => import("./SearchCourseCard"), {
  loading: () => (
    <div className="h-52 rounded-3xl bg-primary-200 animate-pulse"></div>
  ),
});

interface TopMenuProps {
  title: string;
  subTitle?: string;
  searchInput?: boolean;
  onSearch?: (searchText: string) => void;
  onClearSearch?: () => void;
}

// Mobile menu component with improved responsiveness
const MobileMenu = ({
  userName,
  userEmail,
  userRole,
  userImage,
  onClose,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
  userImage: string;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-4/5 max-w-xs h-full right-0 absolute p-4 sm:p-6 shadow-lg animate-slideInRight overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-primary-500 hover:text-primary-700 transition-colors p-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-primary-400 shadow-md">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName || "Profile"}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 64px, 80px"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-comic text-2xl sm:text-3xl font-bold">
                {getInitials(userName || "")}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="font-comic text-lg sm:text-xl font-bold text-primary-700 text-center">
              {userName || "User"}
            </span>

            <span className="text-xs sm:text-sm text-primary-500 font-comic text-center break-words max-w-full">
              {userEmail || ""}
            </span>

            <div className="mt-2">
              {userRole === "Student" ? (
                <span className="px-3 py-1 text-xs sm:text-sm font-comic font-bold rounded-full bg-primary-200 text-primary-600 border-2 border-primary-200">
                  {" Student"}
                </span>
              ) : (
                <span className="px-3 py-1 text-xs sm:text-sm font-comic font-bold rounded-full bg-primary-200 text-primary-600 border-2 border-primary-200">
                  {userRole || "Guest"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-primary-200 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-100 transition-colors"
            onClick={onClose}
          >
            <IoHome size={24} className="text-primary-500" />
            <span className="font-comic text-primary-600">Home</span>
          </Link>

          {/* Add more menu items as needed */}
        </div>
      </div>
    </div>
  );
};

// SearchResults component with improved responsive design
const SearchResults = ({
  searchText,
  courses,
  isLoading,
  onSelectCourse,
  windowWidth,
}: {
  searchText: string;
  courses?: GameDataI[];
  isLoading: boolean;
  onSelectCourse: (course: GameDataI) => void;
  windowWidth: number;
}) => {
  const searchResultsZIndex = "z-40";

  if (!searchText) return null;

  // Adjust column count based on screen width
  const getGridColumns = () => {
    if (windowWidth < 640) return "grid-cols-1";
    if (windowWidth < 1024) return "grid-cols-2";
    return "grid-cols-3";
  };

  // Adjust position based on screen size
  const topPosition = windowWidth < 640 ? "top-16" : "top-20 sm:top-24";

  return (
    <div
      className={`fixed bg-primary-100 flex flex-col items-center gap-3 sm:gap-4 w-[95%] sm:w-11/12 md:w-5/6 overflow-y-auto max-h-[70vh] ${searchResultsZIndex} ${topPosition} animate-fadeInUp border-4 sm:border-8 border-primary-300 rounded-2xl sm:rounded-3xl shadow-xl mx-auto left-0 right-0 transition-all duration-200 p-2 sm:p-3 md:p-4`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-28 sm:h-32">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : courses && courses.length === 0 ? (
        <div className="flex items-center justify-center h-28 sm:h-32">
          <p className="text-primary-500 font-comic text-base sm:text-lg font-bold text-center px-4">
            No results found for &quot;{searchText}&quot;
          </p>
        </div>
      ) : (
        <div className={`grid ${getGridColumns()} gap-2 sm:gap-4 w-full`}>
          {courses?.map((course) => (
            <CourseCard
              key={course.Id}
              course={course}
              onSelect={() => onSelectCourse(course)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// This ensures SearchResults is only loaded when needed
const DynamicSearchResults = dynamic(() => Promise.resolve(SearchResults), {
  ssr: false,
  loading: () => (
    <div className="fixed z-40 top-16 sm:top-20 md:top-24 bg-primary-100 w-[95%] sm:w-11/12 md:w-5/6 mx-auto left-0 right-0 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-primary-300">
      <div className="flex justify-center p-4 sm:p-8">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    </div>
  ),
});

const TopMenu = ({
  title,
  subTitle,
  searchInput = false,
  onSearch,
}: TopMenuProps) => {
  const {
    userName,
    userEmail,
    userImage,
    userRole,
  } = useClientSession();

  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // Automatically collapse expanded search on larger screens
      if (window.innerWidth >= 640 && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    // Set initial width
    setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSearchExpanded]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        searchText === "" &&
        isSearchExpanded
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchText, isSearchExpanded]);

  // Search handling
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    setIsSearchExpanded(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSelectCourse = (course: GameDataI) => {
    setSearchText("");
    setIsSearchExpanded(false);
    router.push(`/courses?selected=${course.Id}`);
  };

  const expandSearch = () => {
    setIsSearchExpanded(true);
    // Allow time for the DOM to update before focusing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  };

  const overlayZIndex = "z-30";
  const isMobile = windowWidth < 640;

  return (
    <>
      {/* Backdrop overlay when search is active */}
      {searchText && (
        <div
          className={`fixed inset-0 ${overlayZIndex} backdrop-blur bg-black/10`}
          onClick={handleClearSearch}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <MobileMenu
          userName={userName || "User"}
          userEmail={userEmail || ""}
          userRole={userRole || "Guest"}
          userImage={userImage || ""}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`flex flex-col sm:flex-row h-min items-start sm:items-center justify-between w-full px-2 mb-2 relative ${
          searchText ? "z-50" : ""
        }`}
      >
        {/* Title section - always visible unless search expanded on mobile */}
        <div
          className={`flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0 ${
            isSearchExpanded && isMobile ? "hidden" : "flex"
          }`}
        >
          <div className="animate-fadeIn">
            <h1 className="text-xl sm:text-2xl font-extrabold font-comic truncate max-w-[180px] sm:max-w-[220px] md:max-w-none bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {subTitle && (
              <p className="text-xs sm:text-sm md:text-base font-comic text-primary-600 animate-slideIn truncate max-w-[200px] sm:max-w-none">
                {subTitle}
              </p>
            )}
          </div>

          {/* Mobile menu button and mobile search button */}
          <div className="flex sm:hidden items-center gap-2">
            {searchInput && !isSearchExpanded && (
              <button
                onClick={expandSearch}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 text-primary-500 hover:bg-primary-200 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 text-primary-500 hover:bg-primary-200 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Search input - conditional rendering for mobile */}
        {searchInput && (isSearchExpanded || !isMobile) && (
          <div
            ref={searchInputRef}
            className={`relative group w-full sm:w-80 md:w-96 h-10 sm:h-12 md:h-14 rounded-full border-3 sm:border-4 border-primary-400 bg-white transition-all duration-300 ease-in-out
              ${
                isSearchFocused
                  ? "shadow-lg border-primary-400 scale-[1.02]"
                  : "hover:border-primary-400"
              }
              ${isSearchExpanded ? "order-3 mt-1 sm:mt-0 sm:order-none" : ""}
              ${isSearchExpanded && isMobile ? "mx-1" : ""}
            `}
          >
            {isSearchExpanded && isMobile && (
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 p-1"
                aria-label="Back"
              >
                <X size={16} />
              </button>
            )}

            <div
              className={`absolute ${
                isSearchExpanded && isMobile ? "left-9 sm:left-3" : "left-3"
              } top-1/2 -translate-y-1/2 text-primary-400 group-hover:text-primary-300 transition-colors`}
            >
              <Search size={16} className="sm:hidden" />
              <Search size={20} className="hidden sm:block" />
            </div>

            <input
              ref={searchInputRef}
              value={searchText}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={isMobile ? "Search..." : "Find something awesome..."}
              className={`w-full h-full ${
                isSearchExpanded && isMobile
                  ? "pl-14 sm:pl-12"
                  : "pl-10 sm:pl-12"
              } pr-8 sm:pr-10 bg-transparent text-primary-700 placeholder:text-primary-300 font-comic text-sm sm:text-base md:text-lg outline-none rounded-full`}
              aria-label="Search courses"
              autoFocus={isSearchExpanded}
            />

            {searchText && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Clear search"
                type="button"
              >
                <X size={16} className="sm:hidden" />
                <X size={18} className="hidden sm:block" />
              </button>
            )}
          </div>
        )}

        {/* User profile section - hidden on mobile when search is expanded */}
        <div
          className={`${
            isSearchExpanded && isMobile ? "hidden sm:flex" : "flex"
          } gap-2 sm:gap-3 md:gap-4 items-center ml-auto sm:ml-0`}
        >
          {/* Only show on tablet and larger screens */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="font-comic text-sm md:text-base font-bold text-primary-700 truncate max-w-24 md:max-w-32 lg:max-w-44">
                  {userName || "User"}
                </span>
                {userRole !== "Student" && (
                  <span className="px-2 py-0.5 text-[10px] md:text-xs font-comic font-bold rounded-full bg-primary-200 text-primary-600 border border-primary-200 animate-bounce-gentle">
                    {userRole || "Guest"}
                  </span>
                )}
              </div>
              {userRole === "Student" ? (
                <span className="px-1 md:px-2 py-0.5 text-[10px] md:text-xs font-comic font-bold rounded-full bg-primary-200 text-primary-600 border border-primary-200 animate-bounce-gentle">
                  {" Student"}
                </span>
              ) : (
                <span className="text-[10px] sm:text-xs lg:text-sm text-primary-500 font-comic truncate max-w-24 sm:max-w-32 lg:max-w-full">
                  {userEmail || ""}
                </span>
              )}
            </div>

            <div
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 md:border-3 lg:border-4 border-primary-400 hover:border-primary-500 transition-all duration-300 hover:scale-105 shadow-md"
              aria-label="User profile"
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName || "Profile"}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 40px, (max-width: 1024px) 48px, 56px"
                  priority={false}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-comic text-lg md:text-xl font-bold">
                  {getInitials(userName || "")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamically load search results only when needed */}
      {searchText && (
        <Suspense
          fallback={
            <div className="fixed z-40 top-16 sm:top-20 md:top-24 bg-primary-100 w-[95%] sm:w-11/12 md:w-5/6 mx-auto left-0 right-0 p-4 sm:p-8 flex justify-center rounded-2xl sm:rounded-3xl">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          }
        >
          <DynamicSearchResults
            searchText={searchText}
            courses={[]}
            isLoading={false}
            onSelectCourse={handleSelectCourse}
            windowWidth={windowWidth}
          />
        </Suspense>
      )}
    </>
  );
};

export default TopMenu;
