"use client";

import { useState } from "react";
import { Mail, Lock, Shield, User, Sparkles } from "lucide-react";
import { Input } from "@/components/form/Input";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { useRegister } from "@/hooks/user/useRegister";
import { UserType } from "@/types";
import {
  StepProps,
  validateEmail,
  validatePassword,
  validateFullName,
} from "@/types/teacher";

export const StepUserRegistration: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  onNext,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const { onSubmit, isPending, userId, verifyEmail } = useRegister();

  const isNameValid = validateFullName(formData.fullName);
  const isEmailValid = validateEmail(formData.email);
  const isPasswordValid = validatePassword(formData.password);
  const isPasswordMatch =
    formData.password === formData.confirmPassword && formData.password !== "";

  const handleSendVerification = async () => {
    const data = {
      FullName: formData.fullName,
      Email: formData.email,
      Password: formData.password,
      UserRole: UserType.USER,
    };

    await onSubmit(data);
  };

  return (
    <div className="space-y-8">
      {!verifyEmail && (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-2 leading-tight">
            Create Your Teacher Account
          </h1>
          <p className="text-lg text-amber-700 leading-relaxed">
            Join thousands of educators transforming learning experiences
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-4">
        {!verifyEmail && (
          <>
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value || "" })
              }
              placeholder="Enter your full name"
              icon={<User className="w-5 h-5 text-amber-600" />}
              valid={isNameValid}
              errorMessage={errors.fullName}
              required
            />

            <div className="relative">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="teacher@email.com"
                icon={<Mail className="w-5 h-5 text-amber-600" />}
                valid={isEmailValid}
                errorMessage={errors.email}
                showValidIcon={false}
                required
                disabled={verifyEmail}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 relative">
              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create a strong password"
                  icon={<Lock className="w-5 h-5 text-amber-600" />}
                  valid={isPasswordValid}
                  errorMessage={errors.password}
                  required
                />
              </div>

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Re-enter your password"
                icon={<Shield className="w-5 h-5 text-amber-600" />}
                valid={isPasswordMatch}
                errorMessage={errors.confirmPassword}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1 text-sm text-amber-600 hover:text-amber-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </>
        )}

        {!verifyEmail && isEmailValid && isPasswordValid && isPasswordMatch && (
          <button
            onClick={handleSendVerification}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 mt-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Sending verification...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Send Verification Email
                <Sparkles className="w-5 h-5 ml-2" />
              </span>
            )}
          </button>
        )}

        {verifyEmail && (
          <VerifyEmailForm
            userId={userId}
            email={formData.email}
            password={formData.password}
            onClose={() => {}}
            setCurrentStep={(step) => {
              console.log(step);
              setEmailVerified(true);
              setTimeout(() => onNext(), 500);
            }}
          />
        )}

        {emailVerified && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-green-800 text-sm font-medium flex items-center">
              ✅ Email verified successfully! Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
