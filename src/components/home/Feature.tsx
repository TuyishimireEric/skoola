import { Shield, BarChart3, Clock, Star, Users } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Safe & Secure Learning",
      description:
        "No ads, no social media, no unsafe content. Just pure, child-friendly education in a protected environment.",
      color: "from-green-400 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      emoji: "🛡️",
    },
    {
      icon: BarChart3,
      title: "Track Your Child's Progress",
      description:
        "Real-time reports, achievement badges, and detailed insights into your child's learning journey.",
      color: "from-orange-400 to-red-500",
      bgColor: "from-orange-50 to-red-50",
      emoji: "📊",
    },
    {
      icon: Clock,
      title: "Screen Time That Matters",
      description:
        "Transform passive screen time into active learning with engaging, educational experiences.",
      color: "from-yellow-400 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      emoji: "⏰",
    },
  ];

  return (
    <section className="relative px-8 py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-2xl animate__animated animate__pulse animate__infinite" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-2xl animate__animated animate__pulse animate__infinite animate__slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 animate__animated animate__fadeInUp">
          {/* Header Badge */}
          <div className="inline-block mb-6 animate__animated animate__zoomIn">
            <div className="bg-gradient-to-r from-orange-200 to-yellow-200 text-gray-800 px-6 py-2 rounded-full text-sm sm:text-base font-comic font-bold shadow-lg border-2 border-orange-100">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                Why Parents Choose Ganzaa
                <Star className="w-4 h-4 text-yellow-600" />
              </span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl  font-bold font-comic text-gray-800 mb-4 animate__animated animate__fadeInUp animate__delay-1s">
            Learning That{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Parents Trust
            </span>
          </h2>

          <p className="text-lg text-gray-600 font-comic max-w-3xl mx-auto animate__animated animate__fadeIn animate__delay-2s">
            <span className="hidden sm:inline">
              Ganzaa combines the best of education and technology to create
              safe, engaging learning experiences that children love and parents
              trust.
            </span>
            <span className="sm:hidden">
              Safe, engaging learning that kids love and parents trust.
            </span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;

            return (
              <div
                key={index}
                className={`group relative animate__animated animate__fadeInUp animate__delay-${
                  index + 1
                }s`}
              >
                {/* Feature Card */}
                <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50 overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-bl-2xl opacity-30" />

                  {/* Icon Container */}
                  <div className="relative z-10 mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg animate__animated animate__zoomIn`}
                    >
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    {/* Emoji Decoration */}
                    <span className="absolute -top-2 -right-2 text-2xl animate__animated animate__bounceIn animate__delay-1s">
                      {feature.emoji}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold font-comic text-gray-800 mb-3 group-hover:text-gray-900 transition-colors animate__animated animate__fadeInLeft animate__delay-1s">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 font-comic leading-relaxed text-sm sm:text-base group-hover:text-gray-700 transition-colors animate__animated animate__fadeIn animate__delay-2s">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect Line */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-12 sm:mt-16 animate__animated animate__fadeInUp animate__delay-3s">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-orange-100 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              {/* Trust Indicators */}
              <div className="flex items-center gap-4 text-sm font-comic text-gray-600 animate__animated animate__fadeIn animate__delay-4s">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="hidden sm:inline">10,000+ Families</span>
                  <span className="sm:hidden">10k+ Families</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>100% Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="hidden sm:inline">Parent Approved</span>
                  <span className="sm:hidden">Approved</span>
                </div>
              </div>

              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-300" />

              {/* Call to Action */}
              <p className="text-gray-700 font-comic font-bold text-base animate__animated animate__pulse animate__infinite">
                <span className="hidden sm:inline">
                  Ready to give your child the best?{" "}
                </span>
                <span className="text-orange-600">Join Ganzaa today!</span> 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
