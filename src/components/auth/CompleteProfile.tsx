import { useState } from "react";
import {
  ChevronLeft,
  Users,
  GraduationCap,
  Sparkles,
  User,
  X,
  Heart,
} from "lucide-react";
import { useUpdateUserProfile } from "@/hooks/user/useUpdateRole";

// Mock UserType enum (replace with your actual enum)
const UserType = {
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

type UserTypeValue = (typeof UserType)[keyof typeof UserType];

interface FormData {
  userType: UserTypeValue;
  age?: number;
}

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName?: string;
}

// Mock function - replace with your actual function
const getBirthdateFromAge = (age: number) => {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return new Date(birthYear, today.getMonth(), today.getDate()).toISOString();
};

const CompleteProfileModal = ({
  isOpen,
  onClose,
  userName,
}: CompleteProfileModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    userType: UserType.STUDENT,
  });
  const [errors, setErrors] = useState<{ age?: string }>({});

  const updateUserMutation = useUpdateUserProfile(onClose);

  if (!isOpen) return null;

  const handleRoleSelect = (userType: UserTypeValue) => {
    setFormData({ ...formData, userType });
    setIsAnimating(true);
    setTimeout(() => {
      // Always go to step 2 now (for both student and parent)
      setCurrentStep(2);
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(1);
      setIsAnimating(false);
    }, 300);
  };

  const validateAge = () => {
    const newErrors: { age?: string } = {};

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (formData.age < 4 || formData.age > 100) {
      newErrors.age = "Please enter a valid age between 5 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteProfile = async () => {
    // Validate age only for students
    if (formData.userType === UserType.STUDENT && !validateAge()) {
      return;
    }

    // For parents, we don't need age validation
    const updateData = {
      RoleId: formData.userType === UserType.STUDENT ? 2 : 6,
      ...(formData.userType === UserType.STUDENT && formData.age && {
        DateOfBirth: getBirthdateFromAge(formData.age),
      }),
    };

    updateUserMutation.mutate(updateData);
  };

  const roleCards = [
    {
      type: UserType.STUDENT,
      icon: GraduationCap,
      label: "I'm a Student",
      description: "Access learning materials and track progress",
      gradient: "from-amber-400 to-orange-500",
      borderColor: "border-amber-300",
    },
    {
      type: UserType.PARENT,
      icon: Users,
      label: "I'm a Parent",
      description: "Monitor your child's learning journey",
      gradient: "from-blue-400 to-blue-500",
      borderColor: "border-blue-300",
    },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600">
                Let&apos;s personalize your Ganzaa experience! 🚀
              </p>
              {userName && (
                <p className="text-sm text-gray-500 mt-2">
                  Welcome, {userName}!
                </p>
              )}
            </div>

            {roleCards.map((role, index) => (
              <div
                key={role.type}
                onClick={() => handleRoleSelect(role.type)}
                className={`group relative overflow-hidden bg-white ${role.borderColor} border-2 rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg transform`}
                style={{
                  boxShadow: "0px 4px 12px rgba(161, 98, 44, 0.1)",
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <role.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-bold text-gray-700 block">
                      {role.label}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {role.description}
                    </span>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
              </div>
            ))}
          </div>
        );

      case 2:
        // Different content based on user type
        if (formData.userType === UserType.STUDENT) {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  Tell us your age
                </h2>
                <p className="text-gray-600">
                  This helps us personalize your learning experience! 🎯
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Age
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                      📆
                    </span>
                    <input
                      type="number"
                      value={formData.age?.toString() || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="Enter your age"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-lg ${
                        errors.age ? "border-red-300" : "border-gray-200"
                      }`}
                      min="5"
                      max="100"
                    />
                  </div>
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </div>

                {/* Age range suggestions */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { range: "5-8", emoji: "🐣", label: "Early Years" },
                    { range: "9-12", emoji: "🌱", label: "Primary" },
                    { range: "13-16", emoji: "🚀", label: "Secondary" },
                  ].map((suggestion) => (
                    <button
                      key={suggestion.range}
                      onClick={() => {
                        const midAge =
                          suggestion.range === "5-8"
                            ? 7
                            : suggestion.range === "9-12"
                            ? 10
                            : 14;
                        setFormData({ ...formData, age: midAge });
                      }}
                      className="p-3 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 text-center"
                    >
                      <div className="text-2xl mb-1">{suggestion.emoji}</div>
                      <div className="text-sm font-medium text-gray-700">
                        {suggestion.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.range} years
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCompleteProfile}
                disabled={updateUserMutation.isPending || !formData.age}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {updateUserMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting up your profile...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    Complete Profile
                    <Sparkles className="w-5 h-5 ml-2" />
                  </span>
                )}
              </button>
            </div>
          );
        } else {
          // Parent welcome step
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  Welcome, Parent!
                </h2>
                <p className="text-gray-600 text-lg">
                  Thank you for choosing Ganzaa to support your child&apos;s learning journey! 👨‍👩‍👧‍👦
                </p>
              </div>

              {/* Welcome message with features */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3">
                  As a parent, you&apos;ll be able to:
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Monitor your child&apos;s learning progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    View detailed performance reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Set learning goals and track achievements
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">
                  Click continue to complete your profile setup
                </p>
                <button
                  onClick={handleCompleteProfile}
                  disabled={updateUserMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {updateUserMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Setting up your parent account...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Continue
                      <Heart className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            disabled={updateUserMutation.isPending}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Back Button */}
          {currentStep === 2 && (
            <button
              onClick={handleBack}
              disabled={updateUserMutation.isPending}
              className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep 
                      ? formData.userType === UserType.STUDENT 
                        ? "bg-amber-400" 
                        : "bg-blue-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div
            className={`transition-all duration-300 ${
              isAnimating
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            {renderStep()}
          </div>
        </div>

        {/* Error display */}
        {updateUserMutation.isError && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Something went wrong. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteProfileModal;