import React, { useState, useEffect } from "react";
import {
  Book,
  Star,
  Trophy,
  Clock,
  Users,
  ChevronRight,
  BookOpen,
  Heart,
  Sparkles,
  Calendar,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  studentsCount: number;
  duration: string;
  instructor: string;
  thumbnailColor: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  isRecommendedForToday?: boolean;
  progress?: number;
  completionRate?: number;
  lastUpdated?: string;
  chapters?: number;
  completedChapters?: number;
}

interface CoursesComponentProps {
  userName?: string;
  primaryColor?: string;
}

const CoursesComponent: React.FC<CoursesComponentProps> = ({
  primaryColor = "primary",
}) => {
  const [activeTab, setActiveTab] = useState<"recommended" | "all">(
    "recommended"
  );
  const [animateElements, setAnimateElements] = useState<boolean>(false);

  const coursesData: Course[] = [
    {
      id: "c1",
      title: "Mathematics Fundamentals",
      category: "Mathematics",
      level: "Beginner",
      rating: 4.8,
      studentsCount: 1243,
      duration: "8 weeks",
      instructor: "Prof. Melissa Chen",
      thumbnailColor: "bg-blue-500",
      isRecommended: true,
      isRecommendedForToday: true,
      isPopular: true,
      progress: 68,
      completionRate: 65,
      lastUpdated: "2 days ago",
      chapters: 24,
      completedChapters: 16,
    },
    {
      id: "c2",
      title: "Introduction to Science",
      category: "Science",
      level: "Beginner",
      rating: 4.7,
      studentsCount: 987,
      duration: "6 weeks",
      instructor: "Dr. Robert Johnson",
      thumbnailColor: "bg-green-500",
      isRecommended: true,
      isRecommendedForToday: true,
      progress: 42,
      completionRate: 40,
      lastUpdated: "Yesterday",
      chapters: 18,
      completedChapters: 7,
    },
    {
      id: "c3",
      title: "World History: Ancient Civilizations",
      category: "History",
      level: "Intermediate",
      rating: 4.9,
      studentsCount: 756,
      duration: "10 weeks",
      instructor: "Dr. Emma Wilson",
      thumbnailColor: "bg-yellow-500",
      isRecommended: true,
      progress: 22,
      completionRate: 35,
      lastUpdated: "3 days ago",
      chapters: 30,
      completedChapters: 6,
    },
    {
      id: "c4",
      title: "English Language Arts",
      category: "Language",
      level: "Beginner",
      rating: 4.6,
      studentsCount: 1532,
      duration: "12 weeks",
      instructor: "Sarah Thompson",
      thumbnailColor: "bg-purple-500",
      isPopular: true,
      completionRate: 58,
    },
    {
      id: "c5",
      title: "Coding for Kids",
      category: "Computer Science",
      level: "Beginner",
      rating: 4.9,
      studentsCount: 674,
      duration: "8 weeks",
      instructor: "Alex Martinez",
      thumbnailColor: "bg-pink-500",
      isRecommended: true,
      isRecommendedForToday: true,
      isPopular: true,
      progress: 85,
      completionRate: 72,
      lastUpdated: "Today",
      chapters: 20,
      completedChapters: 17,
    },
    {
      id: "c6",
      title: "Art & Creative Expression",
      category: "Arts",
      level: "Beginner",
      rating: 4.8,
      studentsCount: 423,
      duration: "6 weeks",
      instructor: "Lisa Wong",
      thumbnailColor: "bg-red-500",
      completionRate: 44,
    },
    {
      id: "c7",
      title: "Geography: Our World",
      category: "Geography",
      level: "Intermediate",
      rating: 4.7,
      studentsCount: 521,
      duration: "7 weeks",
      instructor: "James Peterson",
      thumbnailColor: "bg-teal-500",
      completionRate: 62,
    },
    {
      id: "c8",
      title: "Music Appreciation",
      category: "Music",
      level: "Beginner",
      rating: 4.9,
      studentsCount: 398,
      duration: "5 weeks",
      instructor: "Michael Brown",
      thumbnailColor: "bg-indigo-500",
      completionRate: 78,
    },
  ];

  const filteredCourses =
    activeTab === "recommended"
      ? coursesData.filter((course) => course.isRecommended)
      : coursesData;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateElements(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-600";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-600";
      case "Advanced":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return `bg-green-500`;
    if (progress >= 50) return `bg-yellow-500`;
    if (progress >= 25) return `bg-orange-500`;
    return `bg-red-500`;
  };

  return (
    <div className={`px-4 font-comic`}>
      {/* Today's Recommendations Section */}

      {/* Section Title for All Courses */}
      <div
        className={`flex items-center mb-4 w-full justify-between ${
          animateElements
            ? "animate__animated animate__fadeIn animate__delay-1s"
            : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <Book className={`w-5 h-5 text-${primaryColor}-700 mr-2`} />
          <h2 className={`text-xl font-bold text-${primaryColor}-800`}>
            {activeTab === "recommended"
              ? "Recommended Courses"
              : "All Courses"}
          </h2>
        </div>

        <div
          className={`mt-4 md:mt-0 flex space-x-2 bg-${primaryColor}-100 rounded-full p-1 border border-${primaryColor}-200 shadow-sm`}
        >
          {["recommended", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "recommended" | "all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? `bg-${primaryColor}-500 text-white animate__animated animate__pulse animate__infinite animate__slow`
                  : `bg-transparent text-${primaryColor}-700 hover:bg-${primaryColor}-200`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
        {filteredCourses.map((course, index) => (
          <div
            key={index}
            className={`bg-primary-50 rounded-2xl shadow-md border border-${primaryColor}-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${
              animateElements
                ? "animate__animated animate__fadeInUp"
                : "opacity-0"
            }`}
          >
            {/* Course Thumbnail */}
            <div className={`${course.thumbnailColor} h-32 relative`}>
              {/* Badge Indicators */}
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                {course.isRecommendedForToday && (
                  <div className="bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-sm">
                    <Calendar className="w-3 h-3 text-green-500" />
                    <span>Today</span>
                  </div>
                )}

                {course.isPopular && (
                  <div className="bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-sm">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span>Popular</span>
                  </div>
                )}
              </div>

              {/* Course Category Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <BookOpen className="w-16 h-16 text-white opacity-70" />
              </div>

              {/* Progress Bar */}
              {course.progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="relative h-4 bg-gray-200 bg-opacity-50">
                    <div
                      className={`h-full ${getProgressColor(
                        course.progress
                      )} transition-all duration-500`}
                      style={{ width: `${course.progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getLevelBadgeColor(
                    course.level
                  )}`}
                >
                  {course.level}
                </span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium ml-1">
                    {course.rating}
                  </span>
                </div>
              </div>

              <h3
                className={`font-bold text-${primaryColor}-800 line-clamp-1 h-8`}
              >
                {course.title}
              </h3>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mb-3">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{course.studentsCount.toLocaleString()} students</span>
                </div>

                {course.chapters && (
                  <div className="flex items-center">
                    <Book className="w-3 h-3 mr-1" />
                    <span>{course.chapters} chapters</span>
                  </div>
                )}
              </div>

              <div className="flex items-center mb-4">
                <div
                  className={`w-5 h-5 rounded-full bg-${primaryColor}-100 flex items-center justify-center mr-2`}
                >
                  <span className="text-xs font-bold text-primary-600">
                    {course.instructor.charAt(0)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">By {course.instructor}</p>
              </div>

              {/* Action Buttons */}
              <div
                className={`flex items-center justify-between transition-opacity duration-300 opacity-70`}
              >
                <button
                  className={`bg-${primaryColor}-100 text-${primaryColor}-600 p-2 rounded-full hover:bg-${primaryColor}-200 transition-colors`}
                >
                  <Heart className="w-4 h-4" />
                </button>

                <button
                  className={`bg-${primaryColor}-500 hover:bg-${primaryColor}-600 text-white px-4 py-2 rounded-xl flex items-center space-x-1 text-sm font-medium transition-all`}
                >
                  <span>{course.progress ? "Continue" : "Enroll Now"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Courses Section */}
      {activeTab === "recommended" && (
        <div
          className={`mt-8 bg-gradient-to-r from-${primaryColor}-100 to-${primaryColor}-200 rounded-3xl p-6 shadow-md border border-${primaryColor}-300 text-center ${
            animateElements
              ? "animate__animated animate__fadeIn animate__delay-1s"
              : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center">
            <Sparkles className={`w-10 h-10 text-${primaryColor}-500 mb-3`} />
            <h3 className={`text-xl font-bold text-${primaryColor}-800 mb-2`}>
              Discover More Courses
            </h3>
            <p className={`text-${primaryColor}-600 max-w-xl mx-auto mb-5`}>
              Explore our full catalog of courses designed to help you achieve
              your learning goals
            </p>
            <button
              className={`bg-gradient-to-r from-${primaryColor}-500 to-${primaryColor}-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-base font-medium animate__animated animate__pulse animate__infinite animate__slower`}
              onClick={() => setActiveTab("all")}
            >
              View All Courses
            </button>
          </div>
        </div>
      )}

      {/* Empty State When No Results */}
      {filteredCourses.length === 0 && (
        <div className={`text-center py-12`}>
          <Book className={`w-12 h-12 text-${primaryColor}-400 mx-auto mb-4`} />
          <h3 className={`text-lg font-bold text-${primaryColor}-800 mb-2`}>
            No courses found
          </h3>
          <p className={`text-${primaryColor}-600 max-w-md mx-auto`}>
            We couldn&apos;t find any courses that match your criteria. Try
            changing your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoursesComponent;
