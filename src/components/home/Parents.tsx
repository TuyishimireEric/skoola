// app/components/SchoolsTeachersSection.tsx
import {
  School,
  Users,
  BookOpen,
  BarChart3,
  MessageCircle,
  Library,
  UserPlus,
  Gamepad2,
  Heart,
  Shield,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export const SchoolsTeachersSection = () => {
  const schoolFeatures = [
    {
      icon: School,
      title: "Register Your School",
      description:
        "Get your entire school on Ganzaa with easy institutional setup and management.",
    },
    {
      icon: UserPlus,
      title: "Enroll Students Easily",
      description:
        "Bulk student enrollment with class management and automated parent notifications.",
    },
    {
      icon: BookOpen,
      title: "Create Custom Content",
      description:
        "Build activities, lessons, and games tailored to your curriculum and students.",
    },
    {
      icon: BarChart3,
      title: "Monitor Student Growth",
      description:
        "Real-time analytics and progress tracking for every student in your school.",
    },
    {
      icon: MessageCircle,
      title: "Connect with Families",
      description:
        "Built-in messaging system to communicate with students and parents instantly.",
    },
    {
      icon: Library,
      title: "Digital School Library",
      description:
        "Upload and manage your school's digital resources and learning materials.",
    },
  ];

  const teacherFeatures = [
    {
      icon: Users,
      title: "Manage Your Students",
      description:
        "Upload student lists, create class groups, and organize learning communities.",
    },
    {
      icon: Gamepad2,
      title: "Create Custom Games",
      description:
        "Design your own educational games and interactive content for your classes.",
    },
    {
      icon: Heart,
      title: "Build Learning Groups",
      description:
        "Create study groups, project teams, and collaborative learning spaces.",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description:
        "Monitor individual and class performance with detailed analytics and insights.",
    },
    {
      icon: MessageCircle,
      title: "Chat with Parents",
      description:
        "Direct communication channel with parents for updates and collaboration.",
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description:
        "All communications and content are moderated and completely child-safe.",
    },
  ];

  return (
    <section className="relative px-8 py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-green-200 rounded-full opacity-20 blur-2xl animate-pulse" />

        {/* Floating School Emojis */}
        <div className="absolute top-32 left-1/4 text-4xl opacity-10 animate-bounce">
          🏫
        </div>
        <div className="absolute bottom-40 right-1/3 text-3xl opacity-15 animate-bounce">
          👩‍🏫
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate__animated animate__fadeInUp">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-green-300 to-yellow-300 text-gray-800 px-6 py-3 rounded-full text-sm sm:text-base font-comic font-bold shadow-lg border-2 border-green-200 transform -rotate-1">
              <span className="flex items-center gap-2">
                <School className="w-5 h-5" />
                Empowering Educators
                <Star className="w-5 h-5 text-yellow-600" />
              </span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-comic text-gray-800 mb-4 animate__animated animate__fadeInUp animate__delay-1s">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-yellow-500">
              Schools & Teachers
            </span>
          </h2>

          <p className="text-lg text-gray-700 font-comic max-w-3xl mx-auto animate__animated animate__fadeInUp animate__delay-2s">
            <span className="hidden sm:inline">
              Powerful tools for educators to create engaging learning
              experiences, manage students, and connect with families - all in
              one platform.
            </span>
            <span className="sm:hidden">
              Complete educational platform for schools and teachers.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Schools Section */}
          <div className="relative animate__animated animate__fadeInLeft">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-green-200 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
              <div className="absolute -top-8 left-1/4 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base sm:text-lg font-comic font-bold py-3 px-6 rounded-full shadow-lg border-4 border-white">
                🏫 For Schools
              </div>

              <div className="relative z-10 mt-8">
                <p className="text-center mb-6 text-gray-700 font-comic text-base sm:text-lg">
                  Transform your entire school with Ganzaa&apos;s comprehensive
                  educational platform
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {schoolFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 group hover:animate__animated hover:animate__pulse"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-comic font-bold text-gray-800 text-sm mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-gray-600 font-comic text-xs leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold font-comic text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400"
                  >
                    <School className="w-5 h-5" />
                    <span className="hidden sm:inline">
                      Register Your School
                    </span>
                    <span className="sm:hidden">Register School</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Teachers Section */}
          <div className="relative animate__animated animate__fadeInRight">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-yellow-200 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50" />
              <div className="absolute -top-8 left-1/4 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-base font-comic font-bold py-3 px-6 rounded-full shadow-lg border-4 border-white">
                👩‍🏫 For Teachers
              </div>

              <div className="relative z-10 mt-8">
                <p className="text-center mb-6 text-gray-700 font-comic text-base sm:text-lg">
                  Create, manage, and inspire with tools designed specifically
                  for educators
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {teacherFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-yellow-100 hover:border-yellow-300 transition-all duration-300 group hover:animate__animated hover:animate__pulse"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-comic font-bold text-gray-800 text-sm mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-gray-600 font-comic text-xs leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-bold font-comic text-base  shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-yellow-400"
                  >
                    <Users className="w-5 h-5" />
                    <span className="hidden sm:inline">Join as Teacher</span>
                    <span className="sm:hidden">Join Now</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Section */}
        <div className="text-center mt-12 sm:mt-16 animate__animated animate__fadeInUp animate__delay-1s">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gray-200 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-base font-comic text-gray-600">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-green-500" />
                  <span>200+ Schools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <span>5,000+ Teachers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>100% Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Curriculum Aligned</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 font-comic font-bold text-base mt-2">
              <span className="hidden sm:inline">
                Ready to transform education at your institution?{" "}
              </span>
              <span className="text-green-600">
                Join the Ganzaa community today!
              </span>{" "}
              🚀
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
