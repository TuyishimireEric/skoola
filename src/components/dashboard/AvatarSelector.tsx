"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Camera,
  Edit3,
  Check,
  Trash2,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";

interface AvatarData {
  avatar: string;
  avatarType: "emoji" | "custom";
  customAvatar: string | null;
  imageUrl: string | null;
}

interface AvatarSelectorProps {
  avatarData: AvatarData;
  onAvatarChange: (newAvatarData: AvatarData) => void;
  size?: "sm" | "md" | "lg" | "xl";
  showCrown?: boolean;
  level?: number;
  className?: string;
  editable?: boolean;
}

// African-themed avatar options organized by categories
const avatarCategories = {
  children: [
    { emoji: "👦🏾", name: "Boy Explorer", category: "children" },
    { emoji: "👧🏾", name: "Girl Explorer", category: "children" },
    { emoji: "🧒🏾", name: "Young Scholar", category: "children" },
    { emoji: "👶🏾", name: "Little One", category: "children" },
  ],
  animals: [
    { emoji: "🦁", name: "Lion Leader", category: "animals" },
    { emoji: "🦒", name: "Giraffe Scholar", category: "animals" },
    { emoji: "🐘", name: "Elephant Sage", category: "animals" },
    { emoji: "🦓", name: "Zebra Runner", category: "animals" },
    { emoji: "🐆", name: "Cheetah Speedster", category: "animals" },
    { emoji: "🦛", name: "Hippo Friend", category: "animals" },
    { emoji: "🦅", name: "Eagle Visionary", category: "animals" },
    { emoji: "🐒", name: "Monkey Genius", category: "animals" },
    { emoji: "🦏", name: "Rhino Protector", category: "animals" },
    { emoji: "🐫", name: "Camel Traveler", category: "animals" },
  ],
  nature: [
    { emoji: "🌴", name: "Palm Protector", category: "nature" },
    { emoji: "☀️", name: "Sun Warrior", category: "nature" },
    { emoji: "🌺", name: "Flower Guardian", category: "nature" },
    { emoji: "🌙", name: "Moon Dreamer", category: "nature" },
    { emoji: "⭐", name: "Star Seeker", category: "nature" },
    { emoji: "🌈", name: "Rainbow Bridge", category: "nature" },
  ],
  symbols: [
    { emoji: "👑", name: "Royal Crown", category: "symbols" },
    { emoji: "🎭", name: "Cultural Mask", category: "symbols" },
    { emoji: "🥁", name: "Drum Master", category: "symbols" },
    { emoji: "💎", name: "Diamond Spirit", category: "symbols" },
    { emoji: "🔥", name: "Fire Spirit", category: "symbols" },
    { emoji: "💫", name: "Magic Star", category: "symbols" },
  ],
};

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  avatarData,
  onAvatarChange,
  size = "md",
  showCrown = false,
  level,
  className = "",
  editable = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("children");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-12 h-12",
      text: "text-lg",
      crown: 12,
      level: "text-xs w-6 h-6",
    },
    md: {
      container: "w-16 h-16",
      text: "text-2xl",
      crown: 16,
      level: "text-xs w-8 h-8",
    },
    lg: {
      container: "w-24 h-24",
      text: "text-4xl",
      crown: 24,
      level: "text-sm w-10 h-10",
    },
    xl: {
      container: "w-32 h-32 sm:w-40 sm:h-40",
      text: "text-6xl sm:text-7xl",
      crown: 32,
      level: "text-base sm:text-lg w-10 h-10 sm:w-12 sm:h-12",
    },
  };

  const config = sizeConfig[size];

  const handleAvatarSelect = (avatar: string) => {
    const newAvatarData: AvatarData = {
      ...avatarData,
      avatar,
      avatarType: "emoji",
      customAvatar: null,
    };
    onAvatarChange(newAvatarData);
    setShowModal(false);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Convert to base64 for preview (in real app, upload to your backend)
      const reader = new FileReader();
      reader.onloadend = () => {
        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          const newAvatarData: AvatarData = {
            ...avatarData,
            customAvatar: reader.result as string,
            avatarType: "custom",
            imageUrl: reader.result as string, // In real app, this would be the uploaded URL
          };
          onAvatarChange(newAvatarData);
          setShowModal(false);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert("Upload failed. Please try again.");
    }
  };

  const handleRemoveCustomImage = () => {
    const newAvatarData: AvatarData = {
      ...avatarData,
      customAvatar: null,
      imageUrl: null,
      avatarType: "emoji",
      avatar: "👦🏾", // Default avatar
    };
    onAvatarChange(newAvatarData);
  };

  const renderAvatarContent = () => {
    if (
      avatarData.avatarType === "custom" &&
      (avatarData.customAvatar || avatarData.imageUrl)
    ) {
      return (
        <div className="absolute inset-1 rounded-full overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-200">
          <Image
            src={avatarData.customAvatar || avatarData.imageUrl || ""}
            alt="Profile avatar"
            fill
            className="object-cover"
            sizes={`${config.container.split(" ")[0].replace("w-", "")}px`}
            priority
            onError={() => {
              // Fallback to emoji if image fails to load
              handleRemoveCustomImage();
            }}
          />
        </div>
      );
    }

    return (
      <div className="absolute inset-1 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-yellow-300 group-hover:to-orange-400 transition-colors">
        <motion.span
          className={`${config.text}`}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {avatarData.avatar}
        </motion.span>
      </div>
    );
  };

  return (
    <>
      {/* Avatar Display */}
      <div className={`relative inline-block ${className}`}>
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {/* Decorative rotating border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Main Avatar Button */}
          <motion.button
            onClick={() => editable && setShowModal(true)}
            className={`relative ${
              config.container
            } bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl ${
              editable ? "cursor-pointer group" : "cursor-default"
            }`}
            whileHover={editable ? { scale: 1.1 } : {}}
            whileTap={editable ? { scale: 0.95 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
            disabled={!editable}
          >
            {renderAvatarContent()}

            {/* Edit overlay on hover */}
            {editable && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Edit3 className="text-white w-4 h-4" />
              </div>
            )}
          </motion.button>

          {/* Level Badge */}
          {level && (
            <motion.div
              className={`absolute bottom-0 right-0 bg-gradient-to-r from-green-500 to-yellow-500 text-white ${config.level} rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              whileHover={{ scale: 1.2 }}
            >
              {level}
            </motion.div>
          )}

          {/* Crown */}
          {showCrown && (
            <motion.div
              className="absolute -top-2 -left-2 text-yellow-500"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.2, rotate: 15 }}
            >
              <FaCrown size={config.crown} className="drop-shadow-lg" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Full Screen Avatar Selection Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-[9999]"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}
          >
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />

            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 lg:p-8">
              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl w-full h-full max-w-4xl max-h-[95vh] overflow-hidden relative shadow-2xl"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Scrollable Content Container */}
                {/* <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"> */}
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800">
                    Choose Your Avatar! 🎨
                  </h3>
                  <motion.button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                {/* Current Avatar Preview */}
                <div className="text-center mb-6">
                  <div className="inline-block relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl shadow-lg relative">
                      {avatarData.avatarType === "custom" &&
                      (avatarData.customAvatar || avatarData.imageUrl) ? (
                        <div className="absolute inset-1 rounded-full overflow-hidden">
                          <Image
                            src={
                              avatarData.customAvatar ||
                              avatarData.imageUrl ||
                              ""
                            }
                            alt="Current avatar"
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-1 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center">
                          <span className="text-3xl">{avatarData.avatar}</span>
                        </div>
                      )}
                    </div>
                    {avatarData.avatarType === "custom" && (
                      <motion.button
                        onClick={handleRemoveCustomImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remove custom image"
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    Current Avatar
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 rounded-full p-1">
                  {Object.keys(avatarCategories).map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => setActiveTab(category)}
                      className={`flex-1 py-2 px-3 rounded-full text-xs sm:text-sm font-bold transition-colors capitalize ${
                        activeTab === category
                          ? "bg-gradient-to-r from-orange-400 to-red-400 text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={() => setActiveTab("upload")}
                    className={`flex-1 py-2 px-3 rounded-full text-xs sm:text-sm font-bold transition-colors ${
                      activeTab === "upload"
                        ? "bg-gradient-to-r from-orange-400 to-red-400 text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Upload
                  </motion.button>
                </div>

                {/* Content Area */}
                <div className="min-h-[300px]">
                  {/* Emoji Categories */}
                  {Object.keys(avatarCategories).includes(activeTab) && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <p className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm capitalize">
                        Choose from our {activeTab} collection! 🌍
                      </p>

                      <motion.div
                        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.05 },
                          },
                        }}
                      >
                        {avatarCategories[
                          activeTab as keyof typeof avatarCategories
                        ].map((option, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleAvatarSelect(option.emoji)}
                            className={`bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all relative ${
                              avatarData.avatarType === "emoji" &&
                              avatarData.avatar === option.emoji
                                ? "ring-2 sm:ring-4 ring-orange-500 bg-orange-100"
                                : ""
                            }`}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">
                              {option.emoji}
                            </div>
                            <div className="text-[10px] sm:text-xs font-bold text-gray-700 leading-tight">
                              {option.name}
                            </div>
                            {avatarData.avatarType === "emoji" &&
                              avatarData.avatar === option.emoji && (
                                <motion.div
                                  className="absolute top-1 right-1 bg-green-500 text-white w-4 h-4 rounded-full flex items-center justify-center"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  <Check size={10} />
                                </motion.div>
                              )}
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Upload Tab */}
                  {activeTab === "upload" && (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6">
                        <motion.div
                          className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden border-2 border-dashed border-orange-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {avatarData.avatarType === "custom" &&
                          (avatarData.customAvatar || avatarData.imageUrl) ? (
                            <Image
                              src={
                                avatarData.customAvatar ||
                                avatarData.imageUrl ||
                                ""
                              }
                              alt="Upload preview"
                              fill
                              className="object-cover rounded-full"
                              sizes="160px"
                            />
                          ) : (
                            <Camera className="text-orange-400" size={48} />
                          )}

                          {isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <div className="text-white text-sm font-bold">
                                {uploadProgress}%
                              </div>
                            </div>
                          )}
                        </motion.div>

                        <p className="text-gray-600 mb-4 text-sm">
                          Upload your own photo to make your profile unique! 📸
                        </p>

                        <motion.label
                          className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-3 rounded-full font-bold hover:from-orange-500 hover:to-red-500 transition-colors cursor-pointer ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          whileHover={!isUploading ? { scale: 1.05 } : {}}
                          whileTap={!isUploading ? { scale: 0.95 } : {}}
                        >
                          <Upload size={20} />
                          <span>
                            {isUploading ? "Uploading..." : "Choose Photo"}
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </motion.label>

                        {isUploading && (
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-3">
                          Supports JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <motion.div
                  className="mt-4 sm:mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    🌟 Each avatar brings special powers to your learning
                    journey! 🌟
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AvatarSelector;
