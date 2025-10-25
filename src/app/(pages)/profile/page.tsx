"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Building,
  Upload,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useUserProfile } from "@/hooks/profile/useUserProfile";
import { useClientSession } from "@/hooks/user/useClientSession";
import { uploadImage } from "@/server/actions";
import showToast from "@/utils/showToast";
import { useUpdateUser } from "@/hooks/user/useUpdateRole";
import ProfileImage from "@/components/dashboard/ProfileImage";
import { UserDataI } from "@/types";
import AfricanLoader from "@/components/loader/AfricanLoader";
import ParentInviteSection from "@/components/parent/ParentInviteSection";

interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

interface FormData {
  fullName: string;
  email: string;
  parentName: string;
  parentEmail: string;
  phone: string;
  gender: string;
  imageUrl: string;
  dateOfBirth: string;
  address: Address;
  role: string;
}

// Input Component Props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: string;
  disabled?: boolean;
  required?: boolean;
}

// Avatar options
const avatarCategories = {
  children: [
    { emoji: "👦🏾", name: "Boy Explorer" },
    { emoji: "👧🏾", name: "Girl Explorer" },
    { emoji: "🧒🏾", name: "Young " },
    { emoji: "👶🏾", name: "Little One" },
    { emoji: "🦁", name: "Lion " },
    { emoji: "🦒", name: "Giraffe" },
    { emoji: "🐘", name: "Elephant" },
    { emoji: "🦓", name: "Zebra " },
    { emoji: "🦛", name: "Hippo " },
    { emoji: "🐒", name: "Monkey " },
    { emoji: "☀️", name: "Sun " },
    { emoji: "🌙", name: "Moon " },
    { emoji: "⭐", name: "Star " },
    { emoji: "👑", name: "Royal " },
    { emoji: "🥁", name: "Drum " },
    { emoji: "🔥", name: "Fire " },
    { emoji: "💫", name: "Magic" },
  ],
};

// Input Component
const Input: React.FC<InputProps> = ({
  label,
  icon,
  disabled = false,
  required = false,
  ...props
}) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
        {icon}
      </div>
      <input
        {...props}
        disabled={disabled}
        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-500"
            : "border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        }`}
      />
    </div>
  </div>
);

// Helper function to parse address from string
const parseAddress = (addressString: string): Address => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(addressString);
    return {
      street: parsed.street || "",
      city: parsed.city || "",
      country: parsed.country || "",
      zipCode: parsed.zipCode || "",
    };
  } catch {
    // If not JSON, treat as a simple string and put it in street
    return {
      street: addressString || "",
      city: "",
      country: "",
      zipCode: "",
    };
  }
};

// Helper function to calculate age
const calculateAge = (dateOfBirth: string) => {
  if (!dateOfBirth) return null;

  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getChangedFields = (
  originalData: UserDataI,
  formData: FormData
): Partial<UserDataI> => {
  const changes: Partial<UserDataI> = {};

  // Parse original address
  const originalAddress = parseAddress(originalData.Address || "");

  // Check each field for changes
  if (formData.fullName !== originalData.FullName) {
    changes.FullName = formData.fullName;
  }

  if (formData.phone !== originalData.Phone) {
    changes.Phone = formData.phone;
  }

  if (formData.imageUrl !== originalData.ImageUrl) {
    changes.ImageUrl = formData.imageUrl;
  }

  // Check gender changes
  const originalGender = originalData.Gender || "";
  const newGender = formData.gender || "";

  if (originalGender !== newGender) {
    changes.Gender = newGender;
  }

  // Check date of birth changes - only update if both have values or both are different
  const originalDateOfBirth = originalData.DateOfBirth || "";
  const newDateOfBirth = formData.dateOfBirth || "";

  // Only consider it changed if:
  // 1. Both have values and they're different
  // 2. Original has value and new is empty (clearing the date)
  // 3. Original is empty and new has value (setting new date)
  if (originalDateOfBirth !== newDateOfBirth) {
    // Don't update if both are empty/null
    if (originalDateOfBirth || newDateOfBirth) {
      changes.DateOfBirth = newDateOfBirth;
    }
  }

  // Check address changes
  const addressChanged =
    formData.address.street !== originalAddress.street ||
    formData.address.city !== originalAddress.city ||
    formData.address.country !== originalAddress.country ||
    formData.address.zipCode !== originalAddress.zipCode;

  if (addressChanged) {
    changes.Address = JSON.stringify(formData.address);
  }

  return changes;
};

const UserProfile: React.FC = () => {
  const { userId, userRole } = useClientSession();
  const { data: dbUserData, isLoading, error } = useUserProfile(userId);
  const updateUserMutation = useUpdateUser();

  // State for form data
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    parentName: "",
    parentEmail: "",
    phone: "",
    gender: "",
    imageUrl: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      country: "",
      zipCode: "",
    },
    role: "",
  });

  // Date parts state for the custom date selector
  const [dateParts, setDateParts] = useState({
    day: "",
    month: "",
    year: "",
  });

  // Store original data for comparison
  const [originalData, setOriginalData] = useState<UserDataI | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"avatar" | "upload">("avatar");

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when DB data changes
  useEffect(() => {
    if (dbUserData) {
      const parsedAddress = parseAddress(dbUserData.Address || "");

      const newFormData = {
        fullName: dbUserData.FullName || "",
        email: dbUserData.Email || "",
        parentName: dbUserData.ParentName || "",
        parentEmail: dbUserData.ParentEmail || "",
        phone: dbUserData.Phone || "",
        gender: dbUserData.Gender || "",
        imageUrl: dbUserData.ImageUrl || "",
        dateOfBirth: dbUserData.DateOfBirth || "",
        address: parsedAddress,
        role: dbUserData.Role || "",
      };

      setFormData(newFormData);
      setOriginalData(dbUserData);
    }
  }, [dbUserData]);

  // Update dateParts when formData.dateOfBirth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const [year, month, day] = formData.dateOfBirth.split("-");
      setDateParts({
        day: day || "",
        month: month || "",
        year: year || "",
      });
    } else {
      setDateParts({
        day: "",
        month: "",
        year: "",
      });
    }
  }, [formData.dateOfBirth]);

  // Handle date change from custom selector
  const handleDateChange = (part: "day" | "month" | "year", value: string) => {
    const newDateParts = { ...dateParts, [part]: value };
    setDateParts(newDateParts);

    // Only update formData.dateOfBirth if all parts are selected
    if (newDateParts.day && newDateParts.month && newDateParts.year) {
      const formattedDate = `${newDateParts.year}-${newDateParts.month}-${newDateParts.day}`;
      setFormData({ ...formData, dateOfBirth: formattedDate });
    } else {
      setFormData({ ...formData, dateOfBirth: "" });
    }
  };

  // Validation for date
  const isDateValid = () => {
    if (!formData.dateOfBirth) return true; // Allow empty date
    const age = calculateAge(formData.dateOfBirth);
    return age !== null && age >= 5 && age <= 100; // Reasonable age range
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const handleInputChange = (field: string, value: string): void => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Address),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!originalData || !userId) {
      showToast("Unable to save changes. Please try again.", "error");
      return;
    }

    try {
      // Get only the changed fields
      const changedFields = getChangedFields(originalData, formData);

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      // Add the user ID to the payload
      const updatePayload = {
        Id: userId,
        ...changedFields,
      };

      await updateUserMutation.mutateAsync(updatePayload);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      // The error toast is handled in the mutation hook
    }
  };

  const handleCancel = (): void => {
    // Reset form data to original DB data
    if (dbUserData) {
      const parsedAddress = parseAddress(dbUserData.Address || "");
      setFormData({
        fullName: dbUserData.FullName || "",
        email: dbUserData.Email || "",
        parentName: dbUserData.ParentName || "",
        parentEmail: dbUserData.ParentEmail || "",
        phone: dbUserData.Phone || "",
        gender: dbUserData.Gender || "",
        imageUrl: dbUserData.ImageUrl || "",
        dateOfBirth: dbUserData.DateOfBirth || "",
        address: parsedAddress,
        role: dbUserData.Role || "",
      });
    }
    setIsEditing(false);
  };

  const handleImageClick = (): void => {
    setShowImageModal(true);
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");
    setActiveTab("avatar");
  };

  const handleAvatarSelect = async (emoji: string): Promise<void> => {
    // Update form data immediately
    setFormData((prev) => ({
      ...prev,
      imageUrl: emoji,
    }));

    // If we have original data and user ID, save the image change to database
    if (originalData && userId && emoji !== originalData.ImageUrl) {
      try {
        await updateUserMutation.mutateAsync({
          Id: userId,
          ImageUrl: emoji,
        });
      } catch (error) {
        console.error("Error updating profile image:", error);
      }
    }

    setShowImageModal(false);
  };

  // Handle file selection
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file (PNG, JPG, GIF, etc.)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadError("");

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // Handle image upload
  const handleImageUpload = async (): Promise<void> => {
    if (!selectedFile || !userId || !originalData) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", selectedFile);

      const result = await uploadImage(formDataToUpload);

      if (result.success && result.image && result.image.secure_url) {
        const newImageUrl = result.image.secure_url;

        // Update form data
        setFormData((prev) => ({
          ...prev,
          imageUrl: newImageUrl,
        }));

        // Update in database
        await updateUserMutation.mutateAsync({
          Id: userId,
          ImageUrl: newImageUrl,
        });

        setShowImageModal(false);
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }

      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (): Promise<void> => {
    // Update form data
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));

    // If we have original data and user ID, save the change to database
    if (originalData && userId && originalData.ImageUrl) {
      try {
        await updateUserMutation.mutateAsync({
          Id: userId,
          ImageUrl: "",
        });
      } catch (error) {
        console.error("Error removing profile image:", error);
      }
    }

    setShowImageModal(false);
  };

  // Clear image upload states
  const clearImage = (): void => {
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <AfricanLoader
        Title="Loading ! 🎮"
        Description="Preparing your  user profile Details ... 🌟"
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen p-4 pt-36 font-comic flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-xl font-bold text-red-600 mb-2">
            Error loading profile
          </p>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!dbUserData && !isLoading) {
    return (
      <div className="min-h-screen p-4 pt-36 font-comic flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <p className="text-xl font-bold text-gray-600 mb-2">
            No profile data found
          </p>
          <p className="text-gray-500">
            Please contact support if this persists
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-36 font-comic">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Display Section */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <motion.div
                  className="relative inline-block mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative">
                    <motion.button
                      className="relative w-32 h-32 bg-white border-4 border-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ProfileImage imageUrl={formData.imageUrl} />
                    </motion.button>
                    <motion.button
                      onClick={handleImageClick}
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera size={16} />
                    </motion.button>
                  </div>
                </motion.div>

                <h2 className="text-2xl font-black text-gray-800 mb-1">
                  {dbUserData?.FullName}
                </h2>
                <p className="text-amber-600 font-bold mb-2">
                  {dbUserData?.Role}
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    Active
                  </span>
                  {dbUserData?.IsVerified && (
                    <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Shield size={12} />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="text-amber-600" size={20} />
                    <span className="font-bold text-gray-700">Role</span>
                  </div>
                  <p className="text-amber-700 font-semibold">{userRole}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-blue-600" size={20} />
                    <span className="font-bold text-gray-700">
                      Member Since
                    </span>
                  </div>
                  <p className="text-blue-700 font-semibold">
                    {dbUserData &&
                      new Date(dbUserData.CreatedOn).toLocaleDateString()}
                  </p>
                </div>

                {/* Age display if date of birth is available */}
                {dbUserData?.DateOfBirth && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="text-green-600" size={20} />
                      <span className="font-bold text-gray-700">Age</span>
                    </div>
                    <p className="text-green-700 font-semibold">
                      {calculateAge(dbUserData?.DateOfBirth)} years old
                    </p>
                  </div>
                )}
              </div>
            </div>

            {userRole === "Student" && (
              <motion.div className="mt-6" variants={itemVariants}>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    👨‍👩‍👧‍👦 Parent Connection
                  </h3>

                  <ParentInviteSection student={dbUserData ?? null} />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Edit Form Section */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-800">
                  Personal Information
                </h3>
                <motion.button
                  onClick={() =>
                    isEditing ? handleCancel() : setIsEditing(true)
                  }
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isEditing
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isEditing ? (
                    <X size={16} />
                  ) : (
                    <Edit3 size={16} />
                  )}
                  {updateUserMutation.isPending
                    ? "Saving..."
                    : isEditing
                    ? "Cancel"
                    : "Edit"}
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-black text-gray-700 mb-4 flex items-center gap-2">
                    <User size={20} className="text-amber-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      icon="👋"
                      disabled={!isEditing}
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                      icon="📧"
                      disabled={true}
                      required
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                      icon="📱"
                      disabled={!isEditing}
                    />
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          handleInputChange("gender", e.target.value)
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all disabled:bg-gray-50"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Custom Date Selector */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="flex space-x-2">
                        {/* Day Selector */}
                        <div className="flex-1">
                          <select
                            value={dateParts.day}
                            onChange={(e) =>
                              handleDateChange("day", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.7rem center",
                              backgroundSize: "1rem",
                            }}
                          >
                            <option value="">Day</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option
                                  key={day}
                                  value={day.toString().padStart(2, "0")}
                                >
                                  {day}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Month Selector */}
                        <div className="flex-1">
                          <select
                            value={dateParts.month}
                            onChange={(e) =>
                              handleDateChange("month", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.7rem center",
                              backgroundSize: "1rem",
                            }}
                          >
                            <option value="">Month</option>
                            {[
                              "January",
                              "February",
                              "March",
                              "April",
                              "May",
                              "June",
                              "July",
                              "August",
                              "September",
                              "October",
                              "November",
                              "December",
                            ].map((month, index) => (
                              <option
                                key={month}
                                value={(index + 1).toString().padStart(2, "0")}
                              >
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Year Selector */}
                        <div className="flex-1">
                          <select
                            value={dateParts.year}
                            onChange={(e) =>
                              handleDateChange("year", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-gray-700 bg-white appearance-none cursor-pointer text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.7rem center",
                              backgroundSize: "1rem",
                            }}
                          >
                            <option value="">Year</option>
                            {(() => {
                              const currentYear = new Date().getFullYear();
                              const minYear = currentYear - 100; // 100 years old (oldest allowed)
                              const maxYear = currentYear - 5; // 5 years old (youngest allowed)
                              const years = [];
                              for (
                                let year = maxYear;
                                year >= minYear;
                                year--
                              ) {
                                years.push(year);
                              }
                              return years.map((year) => (
                                <option key={year} value={year.toString()}>
                                  {year}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>

                      {/* Date validation indicator */}
                      {formData.dateOfBirth && (
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              isDateValid() ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isDateValid() ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isDateValid() ? "Valid date" : "Invalid date"}
                          </span>
                        </div>
                      )}

                      {/* Age display */}
                      {formData.dateOfBirth && isDateValid() && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                          <p className="text-sm text-amber-700 font-medium">
                            <strong>Age:</strong>{" "}
                            {calculateAge(formData.dateOfBirth)} years old
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-lg font-black text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-red-600" />
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.address?.city || ""}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      placeholder="Enter your city"
                      icon="🏙️"
                      disabled={!isEditing}
                    />
                    <Input
                      label="Country"
                      name="country"
                      value={formData.address?.country || ""}
                      onChange={(e) =>
                        handleInputChange("address.country", e.target.value)
                      }
                      placeholder="Enter your country"
                      icon="🌍"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <motion.div
                    className="flex justify-end gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {updateUserMutation.isPending
                        ? "Saving Changes..."
                        : "Save Changes"}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImageModal(false)}
            >
              <motion.div
                className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-800">
                    Update Profile Picture
                  </h3>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={updateUserMutation.isPending || isUploading}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Current Image Preview */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-1 mx-auto">
                      <div className="w-full h-full bg-white rounded-full p-1">
                        <ProfileImage imageUrl={formData.imageUrl} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Current Profile Picture
                    </p>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setActiveTab("avatar")}
                      className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-colors ${
                        activeTab === "avatar"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      disabled={updateUserMutation.isPending || isUploading}
                    >
                      🎭 Avatar
                    </button>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-colors ${
                        activeTab === "upload"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      disabled={updateUserMutation.isPending || isUploading}
                    >
                      📸 Upload
                    </button>
                  </div>

                  {/* Avatar Selection Tab */}
                  {activeTab === "avatar" && (
                    <div className="max-h-72 p-2 overflow-y-auto">
                      {Object.entries(avatarCategories).map(
                        ([category, avatars]) => (
                          <div key={category} className="">
                            <div className="grid grid-cols-5 gap-2">
                              {avatars.map((avatar, index) => (
                                <button
                                  key={index}
                                  onClick={() =>
                                    handleAvatarSelect(avatar.emoji)
                                  }
                                  className={`bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 rounded-xl p-3 transition-all relative ${
                                    formData.imageUrl === avatar.emoji
                                      ? "ring-4 ring-orange-500 bg-orange-100"
                                      : ""
                                  }`}
                                  disabled={updateUserMutation.isPending}
                                >
                                  <div className="text-2xl mb-1">
                                    {avatar.emoji}
                                  </div>
                                  <div className="text-xs font-bold text-gray-700 leading-tight">
                                    {avatar.name}
                                  </div>
                                  {formData.imageUrl === avatar.emoji && (
                                    <div className="absolute top-1 right-1 bg-green-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                                      <Check size={10} />
                                    </div>
                                  )}
                                  {updateUserMutation.isPending && (
                                    <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                                      <Loader2
                                        size={16}
                                        className="animate-spin text-amber-500"
                                      />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Upload Tab */}
                  {activeTab === "upload" && (
                    <div className="text-center">
                      {previewUrl ? (
                        <div className="mb-4">
                          <div className="h-48 w-48 mx-auto bg-gray-100 rounded-2xl overflow-hidden border-4 border-amber-200">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                              width={500}
                              height={500}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            New image preview
                          </p>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full max-w-md mx-auto h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300"
                        >
                          <div className="text-center">
                            <Camera
                              size={48}
                              className="text-gray-400 mx-auto mb-2"
                            />
                            <p className="text-gray-500 text-sm">
                              Click to upload an image
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading || updateUserMutation.isPending}
                        />

                        {selectedFile ? (
                          <button
                            onClick={handleImageUpload}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              isUploading || updateUserMutation.isPending
                            }
                          >
                            {isUploading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Upload Image
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              isUploading || updateUserMutation.isPending
                            }
                          >
                            <Upload size={16} />
                            Choose Image
                          </button>
                        )}

                        {/* Clear/Replace options */}
                        {(selectedFile || previewUrl) && (
                          <div className="flex gap-3">
                            <button
                              onClick={clearImage}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={
                                isUploading || updateUserMutation.isPending
                              }
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        {/* Remove current image option */}
                        {formData.imageUrl && (
                          <button
                            onClick={handleRemoveImage}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              isUploading || updateUserMutation.isPending
                            }
                          >
                            {updateUserMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            {updateUserMutation.isPending
                              ? "Removing..."
                              : "Remove Current Image"}
                          </button>
                        )}
                      </div>

                      {/* Upload Status/Error */}
                      {uploadError && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-red-600 text-sm font-semibold">
                            {uploadError}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserProfile;
