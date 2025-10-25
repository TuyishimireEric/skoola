"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Phone, Volume2, Sparkles } from "lucide-react";
import Image from "next/image";
import TalkToAgentButton from "@/components/ai/TalkToAi";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ganzaa";
  timestamp: Date;
}

interface SampleQuestion {
  emoji: string;
  question: string;
  color: string;
}

const EnhancedKidsChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced sample questions with better colors and emojis
  const sampleQuestions: SampleQuestion[] = [
    {
      emoji: "🦖",
      question: "Tell me about dinosaurs!",
      color: "from-emerald-400 via-green-500 to-teal-500",
    },
    {
      emoji: "🐘",
      question: "Why are elephants big?",
      color: "from-slate-400 via-gray-500 to-zinc-500",
    },
    {
      emoji: "🔢",
      question: "Help me with math!",
      color: "from-amber-400 via-orange-500 to-red-500",
    },
    {
      emoji: "📚",
      question: "Tell me a story!",
      color: "from-purple-400 via-violet-500 to-fuchsia-500",
    },
    {
      emoji: "🎨",
      question: "How do I draw?",
      color: "from-pink-400 via-rose-500 to-red-500",
    },
    {
      emoji: "🌍",
      question: "Tell me about countries!",
      color: "from-cyan-400 via-blue-500 to-indigo-500",
    },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Enhanced send message function
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://aspiredental.app.n8n.cloud/webhook/chatbot-webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text.trim(),
            timestamp: new Date().toISOString(),
            userId: "ganzaa-kid-user",
            sessionId: Date.now().toString(),
          }),
        }
      );

      const data = await response.json();

      // Simulate realistic typing delay
      setTimeout(() => {
        const ganzaaResponse: Message = {
          id: (Date.now() + 1).toString(),
          text:
            data.response ||
            "That's a great question! Let me think... 🤔 Ask me something else too!",
          sender: "ganzaa",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, ganzaaResponse]);
        setIsTyping(false);
      }, 1200);
    } catch (error) {
      console.error("Error:", error);
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Oops! My thinking cap fell off! 🎩 Can you ask again?",
          sender: "ganzaa",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    setIsRecording(!isRecording);
  };

  const toggleCall = async () => {
    if (!isCalling) {
      setIsCalling(true);
      try {
        await fetch(
          "https://aspiredental.app.n8n.cloud/webhook/chatbot-webhook",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "voice_call",
              status: "start",
              timestamp: new Date().toISOString(),
            }),
          }
        );
      } catch (error) {
        console.error("Call error:", error);
        setIsCalling(false);
      }
    } else {
      setIsCalling(false);
    }
  };

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  // Enhanced typing indicator component
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start px-4 md:px-6"
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl mt-1"
        >
          🤖
        </motion.div>
        <div className="bg-white px-6 py-4 rounded-3xl shadow-lg border-2 border-purple-100">
          <div className="flex items-center gap-3">
            <span className="text-purple-600 font-medium">
              Ganzaa is thinking
            </span>
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                />
              ))}
            </div>
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen pt-14 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-10">
        <Image
          src="/backgroundImage.png"
          alt="Educational background"
          fill
          priority
          sizes="100vw"
          className="object-cover w-full h-full"
          style={{ objectPosition: "center" }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute z-20 inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 text-6xl opacity-20"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-32 right-16 text-5xl opacity-20"
        >
          🌈
        </motion.div>
        <motion.div
          animate={{
            y: [0, -100, 0],
            rotate: [0, -180, -360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-32 left-1/4 text-4xl opacity-20"
        >
          ✨
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 z-20 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full">
                {/* Welcome Section */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    🚀
                  </motion.div>
                  <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Ready for an Adventure?
                  </h2>
                  <p className="text-lg md:text-xl text-purple-600 font-medium">
                    Click on any topic below to start chatting!
                  </p>
                </motion.div>

                {/* Enhanced Sample Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
                  {sampleQuestions.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      whileHover={{
                        scale: 1.05,
                        rotateY: 10,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendMessage(item.question)}
                      className={`bg-gradient-to-br ${item.color} p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-3 border-white/30 backdrop-blur-sm group relative overflow-hidden`}
                    >
                      {/* Animated background shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse"></div>

                      <div className="relative z-10">
                        <motion.span
                          className="text-5xl md:text-6xl block mb-3"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: index * 0.5,
                          }}
                        >
                          {item.emoji}
                        </motion.span>
                        <span className="text-white font-bold text-sm md:text-base leading-tight block">
                          {item.question}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto w-full pb-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 30, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[75%] flex items-start gap-3 ${
                          message.sender === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex-shrink-0"
                        >
                          <div
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-2xl md:text-3xl ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-blue-400 to-purple-500"
                                : "bg-gradient-to-r from-orange-400 to-pink-500"
                            } shadow-lg`}
                          >
                            {message.sender === "user" ? "👦" : "🐵"}
                          </div>
                        </motion.div>

                        {/* Message Bubble */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                          className={`relative ${
                            message.sender === "user"
                              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                              : "bg-white text-gray-800 border-2 border-purple-100"
                          } px-5 py-4 rounded-3xl shadow-lg max-w-full`}
                        >
                          {/* Message tail */}
                          <div
                            className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                              message.sender === "user"
                                ? "bg-gradient-to-br from-blue-500 to-purple-600 -right-1"
                                : "bg-white border-r-2 border-b-2 border-purple-100 -left-1"
                            }`}
                          ></div>

                          <p className="text-sm md:text-base font-medium leading-relaxed relative z-10">
                            {message.text}
                          </p>

                          {/* Speak button for Ganzaa messages */}
                          {message.sender === "ganzaa" && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => speakMessage(message.text)}
                              className="mt-3 p-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full hover:shadow-lg transition-all inline-flex items-center gap-1 text-white text-xs font-bold"
                            >
                              <Volume2 size={14} />
                              <span>Listen</span>
                            </motion.button>
                          )}

                          {/* Timestamp */}
                          <div
                            className={`text-xs mt-2 ${
                              message.sender === "user"
                                ? "text-purple-200"
                                : "text-gray-400"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Enhanced Typing Indicator */}
                  {isTyping && <TypingIndicator />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Input Area */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions Bar */}
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
              {[
                "🎮 Play a game!",
                "🎵 Sing a song!",
                "🧮 Math help!",
                "🌟 Tell a joke!",
                "🎨 Draw with me!",
                "📖 Story time!",
              ].map((text, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(text.slice(2))}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full whitespace-nowrap font-bold text-sm text-white shadow-lg hover:shadow-xl transition-all flex-shrink-0"
                >
                  {text}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Main Input */}
          <div className="flex gap-3 items-end">
            {/* Input Field Container */}
            <div className="flex-1 relative">
              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputValue);
                    }
                  }}
                  placeholder="Type your message here... 💭"
                  disabled={isLoading}
                  className="w-full px-6 py-4 pr-16 text-base rounded-full border-3 border-purple-300 focus:border-purple-500 focus:outline-none bg-white placeholder-purple-400 disabled:opacity-50 font-medium shadow-lg focus:shadow-xl transition-all"
                />

                {/* Mic Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleRecording}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all shadow-lg ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse shadow-red-300"
                      : "bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500"
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>
              </motion.div>

              {/* Character counter */}
              {inputValue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-6 right-2 text-xs text-purple-500"
                >
                  {inputValue.length}/500
                </motion.div>
              )}
            </div>

             <TalkToAgentButton />

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05, rotateZ: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="p-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Send size={20} />
                )}
              </motion.button>

              {/* Call Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCall}
                className={`p-4 rounded-full shadow-lg text-white font-bold transition-all ${
                  isCalling
                    ? "bg-red-500 animate-pulse shadow-red-300"
                    : "bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 hover:shadow-xl"
                }`}
              >
                <Phone size={20} />
              </motion.button>
            </div>
          </div>

          {/* Loading state indicator */}
          {isLoading && !isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center text-sm text-purple-500 font-medium"
            >
              Sending your message... ✨
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedKidsChat;
