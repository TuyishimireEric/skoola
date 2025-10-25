import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Users,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { Input } from "../form/Input";
import { getBirthdateFromAge } from "@/utils/functions";
import { useRegister } from "@/hooks/user/useRegister";
import { FormErrors, UserType } from "@/types";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { VerifiedSuccess } from "./VerifiedSuccess";

type UserTypeValue = (typeof UserType)[keyof typeof UserType];

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  userType: UserTypeValue;
  age?: number;
}

interface RegisterProps {
  onClose: () => void;
}

const RegisterForm = ({ onClose }: RegisterProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    userType: UserType.STUDENT,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordValid = formData.password.length >= 4;
  const passwordsMatch = formData.password === formData.confirmPassword;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(formData.email);
  const isUsernameValid = formData.fullName.length >= 3;

  const { onSubmit, isPending, userId, registerError, verifyEmail } =
    useRegister();

  // Auto-proceed to verification when registration succeeds
  useEffect(() => {
    if (userId && verifyEmail) {
      setIsAnimating(true);
      setIsLoading(false);
      setTimeout(() => {
        setCurrentStep(formData.userType === UserType.STUDENT ? 4 : 3);
        setIsAnimating(false);
      }, 300);
    }

    if (registerError) {
      setIsLoading(false);
    }
  }, [userId, verifyEmail, formData.userType, registerError]);

  const handleRoleSelect = (userType: UserTypeValue) => {
    setFormData({ ...formData, userType });
    setIsAnimating(true);
    setTimeout(() => {
      // For all user types, go to profile step (step 2)
      setCurrentStep(2);
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 300);
  };

  const validateProfile = () => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    // Only validate age for students
    if (formData.userType === UserType.STUDENT) {
      if (!formData.age) {
        newErrors.age = "Age is required";
      } else if (formData.age < 4 || formData.age > 100) {
        newErrors.age = "Please enter a valid age between 5 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCredentials = () => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isEmailValid) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.password = "Please confirm your password";
    } else if (!passwordsMatch) {
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = () => {
    if (validateProfile()) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(3);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (currentStep === 3 && validateCredentials()) {
      setIsLoading(true);
      if (!formData.userType) return;

      const dateOfBirth = formData.age
        ? getBirthdateFromAge(formData.age)
        : undefined;

      const data = {
        FullName: formData.fullName,
        Email: formData.email,
        Password: formData.password,
        UserRole: formData.userType,
        DateOfBirth: dateOfBirth,
      };

      await onSubmit(data);
    }
  };

  const roleCards = [
    {
      type: UserType.STUDENT,
      icon: GraduationCap,
      label: "I'm a Student",
      emoji: "",
      gradient: "from-amber-400 to-orange-500",
      borderColor: "border-amber-300",
    },
    {
      type: UserType.PARENT,
      icon: Users,
      label: "I'm a Parent",
      emoji: "",
      gradient: "from-blue-400 to-blue-500",
      borderColor: "border-blue-300",
    },
  ];

  const canSubmit =
    formData.fullName && formData.userType === UserType.STUDENT && formData.age;

  const canCreate = isEmailValid && isPasswordValid && passwordsMatch;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="text-center mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700">
                Choose Your Role
              </h2>
              <p className="text-gray-600">
                Let&apos;s get you started on your learning journey! 🚀
              </p>
            </div>

            {roleCards.map((role, index) => (
              <div
                key={role.type}
                onClick={() => handleRoleSelect(role.type)}
                className={`group relative overflow-hidden bg-white ${role.borderColor} border-2 rounded-3xl p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl transform`}
                style={{
                  boxShadow: "0px 8px 20px rgba(161, 98, 44, 0.15)",
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <role.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-2xl animate-pulse">
                      {role.emoji}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xl font-bold text-gray-700 block">
                      {role.label}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Click to continue
                    </span>
                  </div>
                  <ChevronLeft className="w-6 h-6 text-gray-400 rotate-180 group-hover:translate-x-2 transition-transform" />
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <h2 className="text-3xl font-bold text-gray-700 mb-1">
                Your Profile
              </h2>
              <p className="text-gray-600">
                {formData.userType === UserType.STUDENT
                  ? "This helps us personalize your learning experience! 🎯"
                  : "Tell us a bit about yourself"}
              </p>
            </div>

            <Input
              label="Your Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value || "",
                })
              }
              placeholder="Enter your full name"
              icon="👋"
              valid={isUsernameValid}
              errorMessage={
                !isUsernameValid && formData.fullName
                  ? "Name must be at least 3 characters"
                  : ""
              }
              required
            />

            {formData.userType === UserType.STUDENT && (
              <>
                <Input
                  label="Your Age"
                  name="age"
                  value={formData.age?.toString() || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: parseInt(e.target.value) || undefined,
                    })
                  }
                  type="number"
                  placeholder="Enter your age"
                  icon="📆"
                  valid={
                    !!formData.age && formData.age >= 5 && formData.age <= 100
                  }
                  errorMessage={errors.age}
                  required
                />

                {/* Age range suggestions */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { range: "6-8", emoji: "🐣", label: "Lower Primary" },
                    { range: "8-10", emoji: "🌱", label: "Middle Primary" },
                    { range: "10-12", emoji: "🚀", label: "Upper Primary" },
                  ].map((suggestion) => (
                    <button
                      key={suggestion.range}
                      onClick={() => {
                        const midAge =
                          suggestion.range === "6-8"
                            ? 7
                            : suggestion.range === "8-10"
                            ? 9
                            : 11;
                        setFormData({ ...formData, age: midAge });
                      }}
                      className="p-2 rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 text-center"
                    >
                      <div className="text-2xl mb-1">{suggestion.emoji}</div>
                      <div className="text-xs font-medium text-gray-700">
                        {suggestion.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.range} years
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={handleProfileSubmit}
              disabled={
                !formData.fullName ||
                (formData.userType === UserType.STUDENT && !formData.age)
              }
              className={`w-full relative py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl mt-2 font-comic text-base shadow-lg transition-all border-3 border-primary-300 flex items-center justify-center gap-2 transform animate__animated animate__pulse
                  ${
                    canSubmit
                      ? "hover:bg-primary-400 hover:opacity-80"
                      : "opacity-70 cursor-not-allowed"
                  }`}
            >
              <span className="flex items-center justify-center">
                Continue
                <Sparkles className="w-5 h-5 ml-2" />
              </span>
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-gray-700 mb-1">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Just need your email and password to get started!
              </p>
            </div>

            {/* Email Input */}
            <div className="relative group">
              <Input
                label="Your Email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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

            {/* Password Input */}
            <Input
              label="Your Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              icon="🔑"
              valid={isPasswordValid}
              errorMessage={
                !isPasswordValid && formData.password
                  ? "Password must be at least 4 characters"
                  : ""
              }
              required
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm your password"
              icon="🔒"
              valid={passwordsMatch && formData.confirmPassword.length > 0}
              errorMessage={
                !passwordsMatch && formData.confirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              required
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600">
                Show password
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                isPending ||
                !isEmailValid ||
                !isPasswordValid ||
                !passwordsMatch
              }
              className={`w-full relative py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl mt-2 font-comic text-base shadow-lg transition-all border-3 border-primary-300 flex items-center justify-center gap-2 transform animate__animated animate__pulse
                  ${
                    canCreate
                      ? "hover:bg-primary-400 hover:opacity-80"
                      : "opacity-70 cursor-not-allowed"
                  }`}
            >
              {isLoading || isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Creating your account...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  Create Account
                  <Sparkles className="w-5 h-5 ml-2" />
                </span>
              )}
            </button>
          </div>
        );

      case 4:
        return (
          <VerifyEmailForm
            userId={userId}
            email={formData.email}
            password={formData.password}
            onClose={onClose}
            setCurrentStep={setCurrentStep}
          />
        );

      case 5:
        return <VerifiedSuccess onClose={onClose} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full font-comic">
      {/* Back Button */}
      {currentStep > 1 && currentStep < 5 && !verifyEmail && (
        <div className="absolute top-0 left-0">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-primary-200 transition-colors duration-200 border-2 border-gray-200"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Step Content */}
      <div
        className={`transition-all duration-300 w-full ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
      >
        {renderStep()}
      </div>
    </div>
  );
};

export default RegisterForm;
