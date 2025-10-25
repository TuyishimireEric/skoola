"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Users,
  BookOpen,
  Shield,
  CreditCard,
  Settings,
  Heart,
  Star,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

import HeroSection from "@/components/faq/HeroSection";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      id: 1,
      category: "general",
      question: "What is Ganzaa and how does it work?",
      answer:
        "Ganzaa is an innovative educational platform designed to make learning fun and engaging for children. We provide interactive lessons, games, and activities that help children develop essential skills while having fun. Our platform uses gamification and personalized learning paths to ensure each child learns at their own pace.",
      icon: "🎓",
    },
    {
      id: 2,
      category: "general",
      question: "What age groups is Ganzaa suitable for?",
      answer:
        "Ganzaa is designed for children aged 3-12 years. We have content specifically tailored for different age groups: Early Learning (3-5 years), Primary Learning (6-8 years), and Advanced Learning (9-12 years). Each age group has age-appropriate activities and difficulty levels.",
      icon: "👶",
    },
    {
      id: 3,
      category: "account",
      question: "How do I create an account for my child?",
      answer:
        'Creating an account is simple! Click on "Sign Up" on our homepage, enter your email and create a password. Then, you can add your child\'s profile with their name, age, and learning preferences. You can manage multiple children under one parent account.',
      icon: "👤",
    },
    {
      id: 4,
      category: "account",
      question: "Can I have multiple children on one account?",
      answer:
        "Yes! You can add up to 5 children under one parent account. Each child gets their own personalized learning dashboard, progress tracking, and customized content based on their age and learning level.",
      icon: "👨‍👩‍👧‍👦",
    },
    {
      id: 5,
      category: "pricing",
      question: "What are your subscription plans?",
      answer:
        "We offer flexible subscription plans: Free Plan (limited access), Monthly Plan ($9.99/month), and Annual Plan ($79.99/year - save 33%). All paid plans include unlimited access to all content, progress tracking, and priority support.",
      icon: "💰",
    },
    {
      id: 6,
      category: "pricing",
      question: "Is there a free trial available?",
      answer:
        "Yes! We offer a 7-day free trial for all new users. You can explore all premium features during this trial period. No credit card required to start your trial.",
      icon: "🆓",
    },
    {
      id: 7,
      category: "technical",
      question: "What devices does Ganzaa work on?",
      answer:
        "Ganzaa works on all modern devices including smartphones, tablets, laptops, and desktop computers. We support iOS, Android, Windows, and Mac. Our platform is web-based, so you just need a stable internet connection and a modern browser.",
      icon: "📱",
    },
    {
      id: 8,
      category: "technical",
      question: "Do you have offline content?",
      answer:
        "Currently, Ganzaa requires an internet connection to access most content. However, we are working on offline functionality for selected activities and hope to release this feature soon.",
      icon: "📶",
    },
    {
      id: 9,
      category: "safety",
      question: "Is Ganzaa safe for my child?",
      answer:
        "Absolutely! Child safety is our top priority. We comply with COPPA and GDPR regulations, use secure encryption for all data, have no ads or external links, and provide a completely safe learning environment. We also have content moderation and parental controls.",
      icon: "🛡️",
    },
    {
      id: 10,
      category: "safety",
      question: "How do you protect my child's data?",
      answer:
        "We use industry-standard encryption to protect all user data. We never share personal information with third parties, collect only necessary information for the learning experience, and provide parents full control over their child's data.",
      icon: "🔒",
    },
    {
      id: 11,
      category: "support",
      question: "How can I contact customer support?",
      answer:
        "We offer multiple ways to get help: Email us at support@ganzaa.com, chat with us on WhatsApp, use our in-app help center, or visit our contact page. Our support team is available Monday-Friday, 9 AM - 6 PM.",
      icon: "💬",
    },
    {
      id: 12,
      category: "support",
      question: "How quickly do you respond to support requests?",
      answer:
        "We aim to respond to all support requests within 24 hours on weekdays. For urgent issues, our WhatsApp support provides faster response times, usually within a few hours.",
      icon: "⏰",
    },
  ];

  const categories = [
    {
      id: "all",
      name: "All Questions",
      icon: HelpCircle,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "general",
      name: "General",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "account",
      name: "Account",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "pricing",
      name: "Pricing",
      icon: CreditCard,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "technical",
      name: "Technical",
      icon: Settings,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "safety",
      name: "Safety",
      icon: Shield,
      color: "from-red-500 to-pink-500",
    },
    {
      id: "support",
      name: "Support",
      icon: Heart,
      color: "from-teal-500 to-cyan-500",
    },
  ];

  const filteredFAQs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const toggleItem = (id: unknown) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const router = useRouter();

  const navigateToContact = () => {
    router.push("/contact");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Main FAQ Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative bg-primary-100">
        <div className="container mx-auto max-w-6xl">
          {/* Search and Filter Section */}
          <div className="mb-12">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-primary-200 focus:border-primary-400 outline-none transition-all duration-300 font-comic bg-white bg-opacity-80 backdrop-blur-sm text-lg shadow-lg"
                />
              </div>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative overflow-hidden px-6 py-3 rounded-full font-comic font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white transform scale-105`
                      : "bg-white text-primary-600 hover:bg-primary-50 border-2 border-primary-200"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    {category.name}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            {/* Results Count */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="text-primary-600 font-comic">
                {filteredFAQs.length} question
                {filteredFAQs.length !== 1 ? "s" : ""} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </motion.div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white  backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary-100 hover:border-primary-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left focus:outline-none focus:ring-4 focus:ring-primary-200 rounded-2xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-primary-100 to-yellow-100 rounded-xl text-2xl">
                          {faq.icon}
                        </div>
                        <h3 className="font-bold font-comic text-primary-700 text-lg sm:text-xl flex-1 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: openItems.has(faq.id) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-6 h-6 text-primary-500" />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {openItems.has(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="pl-16 pr-4">
                            <div className="w-full h-px bg-gradient-to-r from-primary-200 to-transparent mb-4" />
                            <p className="text-primary-600 font-comic leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center py-16"
            >
              <div className="text-8xl mb-4">🤷‍♀️</div>
              <h3 className="text-2xl font-bold font-comic text-primary-700 mb-4">
                No questions found
              </h3>
              <p className="text-primary-600 font-comic mb-6">
                Try adjusting your search or browse different categories
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-comic font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Reset Search
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-primary-50">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-primary-200 rounded-full opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-comic text-primary-700 mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-primary-600 font-comic">
              Can&apos;t find the answer you&apos;re looking for? Our friendly
              support team is here to help!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Email Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 shadow-xl text-white cursor-pointer group"
              onClick={() =>
                (window.location.href = "mailto:contact@ganzaa.com")
              }
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-comic mb-2">
                  Email Support
                </h3>
                <p className="text-white/90 font-comic text-sm mb-4">
                  Get detailed help via email
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-comic">
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* WhatsApp Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 shadow-xl text-white cursor-pointer group"
              onClick={() =>
                window.open(
                  "https://wa.me/250780313448?text=Hi%20Ganzaa%20team!..",
                  "_blank"
                )
              }
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-comic mb-2">
                  WhatsApp Chat
                </h3>
                <p className="text-white/90 font-comic text-sm mb-4">
                  Quick responses on WhatsApp
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-comic">
                  <span>Chat Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Phone Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-xl text-white cursor-pointer group"
              onClick={() => (window.location.href = "tel:+250780313448")}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-comic mb-2">Call Us</h3>
                <p className="text-white/90 font-comic text-sm mb-4">
                  Speak directly with our team
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-comic">
                  <span>Call Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-primary-100 to-yellow-50 rounded-3xl p-8 shadow-xl"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold font-comic text-primary-700 mb-4">
                Love Our Platform?
              </h3>
              <p className="text-primary-600 font-comic mb-6">
                Help us improve by sharing your feedback or suggesting new
                features!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={navigateToContact}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-comic font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                Share Feedback
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FAQPage;
