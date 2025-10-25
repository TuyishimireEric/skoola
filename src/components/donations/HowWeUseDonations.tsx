import { motion } from "framer-motion";
import { Users, BookOpen, Globe, Shield, Zap, Award } from "lucide-react";

const HowWeUseDonations = () => {
  const impactAreas = [
    {
      icon: Shield,
      title: "Platform Security & Reliability",
      description:
        "Maintaining secure servers and ensuring 99.9% uptime for uninterrupted learning",
      color: "from-blue-500 to-blue-600",
      percentage: "30%",
    },
    {
      icon: BookOpen,
      title: "Content Development",
      description:
        "Creating new courses, updating materials, and expanding our curriculum library",
      color: "from-green-500 to-green-600",
      percentage: "25%",
    },
    {
      icon: Zap,
      title: "Technology Innovation",
      description:
        "Developing new features, AI-powered learning tools, and mobile applications",
      color: "from-purple-500 to-purple-600",
      percentage: "20%",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Supporting teachers, moderating content, and providing student assistance",
      color: "from-orange-500 to-orange-600",
      percentage: "15%",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description:
        "Translation services, local partnerships, and reaching underserved communities",
      color: "from-teal-500 to-teal-600",
      percentage: "10%",
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-comic text-primary-800 mb-4">
            How Your Donation Makes an Impact
          </h2>
          <p className="text-lg text-primary-600 font-comic max-w-3xl mx-auto">
            Every dollar donated goes directly toward keeping education free and
            accessible. Here&apos;s exactly how we use your generous contributions:
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {impactAreas.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white bg-opacity-70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border-2 border-primary-100 hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${area.color} rounded-2xl flex items-center justify-center mb-4`}
              >
                <area.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold font-comic text-primary-700 text-lg">
                  {area.title}
                </h3>
                <span
                  className={`px-3 py-1 bg-gradient-to-r ${area.color} text-white text-sm font-bold rounded-full`}
                >
                  {area.percentage}
                </span>
              </div>
              <p className="text-primary-600 font-comic">{area.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Transparency Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-100 to-yellow-50 rounded-3xl p-8 text-center"
        >
          <Award className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold font-comic text-primary-700 mb-3">
            100% Transparency Commitment
          </h3>
          <p className="text-primary-600 font-comic max-w-2xl mx-auto">
            We publish detailed financial reports quarterly, showing exactly how
            every donation is used. Your trust is important to us, and we&apos;re
            committed to complete transparency in our operations.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowWeUseDonations;
