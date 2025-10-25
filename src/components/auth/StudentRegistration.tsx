import {
  ChevronLeft,
  GraduationCap,
  Lock,
  Sparkles,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../form/Input";
import { motion } from "framer-motion";
import { useRegisterStudent } from "@/hooks/user/useRegisterStudent";
import { NewUserInterface } from "@/types";
import { DateOfBirthInput } from "../form/DateOfBirthInput";

interface StudentFormData {
  fullName: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

interface StudentRegistrationProps {
  onClose: () => void;
}

const StudentRegistrationForm = ({ onClose }: StudentRegistrationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { onSubmit, isPending, student } = useRegisterStudent();

  const [formData, setFormData] = useState<StudentFormData>({
    fullName: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const isNameValid = formData.fullName.trim().length >= 3;
  const isPasswordValid = formData.password.length >= 6;
  const passwordsMatch = formData.password === formData.confirmPassword;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const isDateValid = () => {
    if (!formData.dateOfBirth) return false;
    const age = calculateAge(formData.dateOfBirth);
    return age >= 5 && age <= 13;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Student's full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 5 || age > 13) {
        newErrors.dateOfBirth = "Student age must be between 5 and 13 years";
      }
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm the password";
    } else if (!passwordsMatch) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // Validate step 1 before proceeding
    const stepErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      stepErrors.fullName = "Student's full name is required";
    } else if (formData.fullName.trim().length < 3) {
      stepErrors.fullName = "Name must be at least 3 characters";
    }

    if (!formData.dateOfBirth) {
      stepErrors.dateOfBirth = "Date of birth is required";
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 5 || age > 13) {
        stepErrors.dateOfBirth = "Student age must be between 5 and 13 years";
      }
    }

    setErrors(stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const studentData: NewUserInterface = {
        FullName: formData.fullName,
        DateOfBirth: formData.dateOfBirth,
        Password: formData.password,
      };

      onSubmit(studentData);
    }
  };

  useEffect(() => {
    if (student) {
      setCurrentStep(3);
    }
  }, [student]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3 p-1">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-2">
                Add New Student
              </h2>
              <p className="text-gray-600">
                Please provide your child&apos;s information 👨‍👩‍👧‍👦
              </p>
            </div>

            <Input
              label="Student's Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Enter student's full name"
              icon="👋"
              valid={formData.fullName ? isNameValid : undefined}
              errorMessage={errors.fullName}
              required
            />

            {/* Custom Date Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>

              <DateOfBirthInput
                dateOfBirth={formData.dateOfBirth}
                setDateOfBirth={(date: string) =>
                  setFormData({ ...formData, dateOfBirth: date })
                }
              />

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

              {/* Error message */}
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm font-medium mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {formData.dateOfBirth && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                <p className="text-sm text-amber-700 font-medium">
                  <strong>Age:</strong> {calculateAge(formData.dateOfBirth)}{" "}
                  years old
                </p>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!isNameValid || !isDateValid()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-amber-600 hover:to-orange-600 transform hover:scale-95 transition-all duration-300 border-3 border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              style={{
                boxShadow:
                  !isNameValid || !isDateValid()
                    ? "none"
                    : "0px 8px 20px rgba(245, 158, 11, 0.3)",
              }}
            >
              <span className="flex items-center justify-center">
                Continue
                <Sparkles className="w-5 h-5 ml-2" />
              </span>
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 p-1">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-2">
                Set Student Password
              </h2>
              <p className="text-gray-600">
                Create a secure password for {formData.fullName} 🔐
              </p>
            </div>

            <Input
              label="Student Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password (minimum 6 characters)"
              icon="🔑"
              valid={formData.password ? isPasswordValid : undefined}
              errorMessage={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm password"
              icon="🔒"
              valid={formData.confirmPassword ? passwordsMatch : undefined}
              errorMessage={errors.confirmPassword}
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

            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-700 font-medium">
                  {errors.submit}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isPending || !isPasswordValid || !passwordsMatch}
              className="w-full bg-gradient-to-r from-yellow-500 to-primary-400 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-yellow-400 hover:to-primary-500 transform hover:scale-95 transition-all duration-300 border-3 border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              style={{
                boxShadow:
                  isPending || !isPasswordValid || !passwordsMatch
                    ? "none"
                    : "0px 8px 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Creating Student Account...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  Create Student Account
                  <Sparkles className="w-5 h-5 ml-2" />
                </span>
              )}
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 p-1">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-2">
                Student Account Created! 🎉
              </h2>
              <p className="text-gray-600">
                Save these login credentials for {formData?.fullName}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-3 border-amber-300 rounded-3xl p-6 space-y-3">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Login Credentials
                </h3>
                <p className="text-sm text-gray-600">
                  Please save this information securely
                </p>
              </div>

              {/* Username */}
              <div className="bg-white rounded-2xl p-4 border-3 border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Username
                    </label>
                    <p className="text-lg font-bold text-gray-800">
                      {student
                        ? formData.fullName.split(" ")[0] + student.UserNumber
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        student
                          ? formData.fullName.split(" ")[0] + student.UserNumber
                          : "",
                        "username"
                      )
                    }
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    {copiedField === "username" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-white rounded-2xl p-4 border-3 border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Password
                    </label>
                    <p className="text-lg font-bold text-gray-800">
                      {showPassword ? formData?.password : "••••••••"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(formData?.password || "", "password")
                      }
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      {copiedField === "password" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-3 border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-700 font-medium">
                <strong>📝 Important:</strong> Please save these credentials!
                Your child will need them to log in to Ganzaa.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-95 transition-all duration-300 border-3 border-emerald-400 shadow-lg"
              style={{
                boxShadow: "0px 8px 20px rgba(16, 185, 129, 0.3)",
              }}
            >
              <span className="flex items-center justify-center">
                Complete Registration
                <CheckCircle className="w-5 h-5 ml-2" />
              </span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative min-h-[500px] lg:min-h-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-primary-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-300 rounded-full opacity-15 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] mx-auto"
      >
        <X
          onClick={onClose}
          className="absolute right-5 top-5 bg-primary-50 text-primary-400 hover:text-red-300 cursor-pointer rounded-full z-30"
        />

        <div className="bg-primary-100 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border-2 border-primary-100 hover:shadow-3xl transition-all duration-500">
          {/* Form Content with Animation */}
          <div className="relative overflow-hidden">
            {/* Back Button */}

            {currentStep > 1 && currentStep < 3 && (
              <div className="absolute top-4 left-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 border-2 border-gray-200"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            )}

            {/* Progress indicator */}
            <div className="w-full mb-6">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step <= currentStep ? "bg-amber-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div
              className={`transition-all duration-300 w-full ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              {renderStep()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegistrationForm;
