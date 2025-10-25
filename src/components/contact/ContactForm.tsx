"use client";

import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { contactInfo, socialLinks } from "@/utils/Constants";
import { useContactUs } from "@/hooks/contact/useContactUs";
import { Input } from "../form/Input";
import { useClientSession } from "@/hooks/user/useClientSession";

const ContactForm = () => {
  const { userName, userEmail, userRole } = useClientSession();
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    subject: "",
    message: "",
    userType: userRole || "parent",
  });

  const contactUs = useContactUs();

  const handleInputChange = (e: {
    target: { name: string; value: string };
  }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(formData.email);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    contactUs.mutate(formData);
  };

  useEffect(() => {
    if (contactUs.isSuccess) {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        userType: "parent",
      });
    }
  }, [contactUs.isSuccess]);

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
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

      <div
        id="contact-form"
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border-3 border-primary-100 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-primary-100 rounded-bl-full opacity-50" />

              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold font-comic text-primary-700 mb-3">
                    Send Us a Message
                  </h2>
                  <p className="text-primary-600 font-comic">
                    We&apos;d love to hear from you! Fill out the form below and
                    we&apos;ll get back to you soon.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!(userName && userEmail) && (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your Name"
                        icon="👋"
                      />
                      <Input
                        label="Your Email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        icon="📧"
                        valid={isEmailValid}
                        errorMessage={
                          !isEmailValid && formData.email
                            ? "Please enter a valid email"
                            : ""
                        }
                        required
                      />
                    </div>
                  )}

                  {!userRole && (
                    <div>
                      <label className="block text-primary-700 font-comic font-semibold mb-2">
                        I am a...
                      </label>
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 rounded-2xl border-2 border-primary-200 focus:border-primary-400 outline-none transition-all duration-300 font-comic bg-white bg-opacity-80"
                      >
                        <option value="parent">Parent 👨‍👩‍👧‍👦</option>
                        <option value="teacher">Teacher 👩‍🏫</option>
                        <option value="student">Student 🎒</option>
                        <option value="other">Other 🌟</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-primary-700 font-comic font-semibold mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-primary-200 focus:border-primary-400 outline-none transition-all duration-300 font-comic bg-white bg-opacity-80"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-primary-700 font-comic font-semibold mb-2">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-primary-200 focus:border-primary-400 outline-none transition-all duration-300 font-comic resize-none bg-white bg-opacity-80"
                      placeholder="Tell us more..."
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={contactUs.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-comic font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:-rotate-1 transition-all duration-300 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {contactUs.isPending ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Contact Information & Social Media */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-comic text-primary-700 mb-6">
                Get in Touch
              </h3>
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.title}
                  href={info.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="block"
                >
                  <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary-100 hover:border-primary-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary-100 to-yellow-100 rounded-xl">
                        <info.icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-bold font-comic text-primary-700">
                          {info.title}
                        </h4>
                        <p className="text-primary-600 font-comic">
                          {info.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Social Media Section */}
            <div className="bg-gradient-to-br from-primary-100 to-yellow-50 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold font-comic text-primary-700 mb-6">
                Join Our Community
              </h3>
              <p className="text-primary-600 font-comic mb-6">
                Follow us for learning tips, updates, and fun educational
                content!
              </p>

              <div className="grid grid-cols-3 gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`${social.bgColor} p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group`}
                  >
                    <social.icon
                      className={`w-6 h-6 ${social.color} transition-colors`}
                    />
                    <span
                      className={`font-comic font-semibold text-sm ${social.color} transition-colors`}
                    >
                      {social.name}
                    </span>
                  </motion.a>
                ))}
              </div>

              {/* FAQ Link */}
              <div className="mt-8 text-center">
                <Link href="/faq">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-comic font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Have Questions? Visit our FAQ
                    <span className="text-xl">❓</span>
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* WhatsApp Quick Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 shadow-xl"
            >
              <h4 className="text-xl font-bold font-comic text-white mb-3">
                Need Quick Help?
              </h4>
              <p className="text-white/90 font-comic mb-4 text-sm">
                Chat with us on WhatsApp for instant support!
              </p>
              <motion.a
                href="https://wa.me/250780313448?text=Hi%20Ganzaa%20team!.."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-comic font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
