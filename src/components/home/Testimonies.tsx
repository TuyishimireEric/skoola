import React from "react";
import { Star, Heart, Sparkles, Quote } from "lucide-react";
import "animate.css";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Mwiza Winner B.",
      age: 11,
      location: "Kigali, Rwanda",
      quote:
        "I love the math games! I used to not like numbers but now I can't wait for math time! My favorite is the treasure hunt game.",
      avatar: "👦🏾",
      subject: "Mathematics",
      achievement: "Math Champion",
      emoji: "🔢",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      name: "Liam Thompson",
      age: 10,
      location: "Kampala, Uganda",
      quote:
        "The science experiments are so cool! I showed my parents what I learned and they were super impressed! I want to be a scientist now.",
      avatar: "👧🏾",
      subject: "Science",
      achievement: "Young Scientist",
      emoji: "🔬",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      name: "Sophie Kim",
      age: 7,
      location: "Seoul, Korea",
      quote:
        "I love earning badges and watching my tree grow when I read books. It makes me want to read more stories every day!",
      avatar: "👶🏾",
      subject: "Reading",
      achievement: "Story Explorer",
      emoji: "📚",
      gradient: "from-red-400 to-pink-500",
    },
  ];

  return (
    <section className="relative px-8 py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate__animated animate__pulse animate__infinite">
          🎓
        </div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-15 animate__animated animate__swing animate__infinite">
          💝
        </div>
        <div className="absolute top-40 right-1/4 text-2xl opacity-10 animate__animated animate__bounce animate__infinite">
          ⭐
        </div>

        {/* Background Circles */}
        <div className="absolute top-10 right-1/3 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate__animated animate__fadeInUp">
          <div className="inline-block mb-6 animate__animated animate__bounceIn">
            <div className="bg-gradient-to-r from-yellow-300 to-orange-400 text-gray-800 px-6 py-3 rounded-full text-sm sm:text-base font-comic font-bold shadow-lg border-2 border-yellow-200 transform -rotate-1">
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Student Success Stories
                <Sparkles className="w-5 h-5 text-yellow-600" />
              </span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-comic text-gray-800 mb-4 animate__animated animate__fadeInUp animate__delay-1s">
            Our Happy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
              Adventurers
            </span>
          </h2>

          <p className="text-lg text-gray-700 font-comic max-w-3xl mx-auto animate__animated animate__fadeIn animate__delay-2s">
            <span className="hidden sm:inline">
              Join thousands of smiling kids from around the world who are
              learning, growing, and having amazing adventures with Ganzaa every
              day!
            </span>
            <span className="sm:hidden">
              Join thousands of happy kids learning with Ganzaa!
            </span>
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group relative h-full animate__animated animate__fadeInUp animate__delay-${
                index + 1
              }s`}
            >
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-white/50 relative h-full overflow-hidden transition-all duration-300 group-hover:shadow-2xl">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Quote className="w-8 h-8 text-gray-400" />
                </div>

                <div className="relative z-10">
                  {/* Student Profile */}
                  <div className="flex items-center gap-4 mb-4 animate__animated animate__fadeInLeft animate__delay-1s">
                    <div className="relative w-16 h-16 bg-white border-4 border-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group">
                      <div
                        className={`w-6 h-6 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center`}
                      >
                        <span className="text-4xl leading-none flex items-center justify-center h-full">
                          {testimonial.avatar}
                        </span>
                      </div>
                      {/* Achievement Badge */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center border-2 border-white text-xs`}
                      >
                        {testimonial.emoji}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 font-comic group-hover:text-gray-900 transition-colors">
                        {testimonial.name}
                      </h3>
                      <p className="text-xs text-gray-600 font-comic">
                        Age {testimonial.age} • {testimonial.location}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 mt-1 px-2 py-1 bg-gradient-to-r ${testimonial.gradient} rounded-full text-xs text-white font-comic font-bold animate__animated animate__pulse animate__infinite`}
                      >
                        <span>{testimonial.emoji}</span>
                        <span>{testimonial.achievement}</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-gray-700 font-comic text-base leading-relaxed group-hover:text-gray-800 transition-colors animate__animated animate__fadeIn animate__delay-2s">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-between mt-4 animate__animated animate__fadeInUp animate__delay-3s">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className="fill-yellow-400 text-yellow-400 animate__animated animate__zoomIn animate__delay-3s"
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 font-comic animate__animated animate__fadeInRight">
                      {testimonial.subject}
                    </div>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 animate__animated animate__fadeInUp animate__delay-2s">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-white/50 max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 font-comic font-bold">
              <span className="hidden sm:inline">
                Ready to create your own success story?
              </span>{" "}
              <span className="text-orange-600">
                Join our happy community today!
              </span>{" "}
              <span className="ml-2 animate__animated animate__heartBeat animate__infinite">
                🌟
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
