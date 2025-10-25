import { useState, useCallback, useEffect } from "react";
import { Input } from "../form/Input";
import { signIn } from "next-auth/react";
import { useForgotPassword } from "@/hooks/user/useForgotPassword";
import { useVerifyOTP } from "@/hooks/user/useVerifyOTP";
import { useUpdatePassword } from "@/hooks/user/useUpdatePassword";

interface ForgotPasswordProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

type ForgotPasswordStep = "email" | "otp" | "password";

interface ForgotPasswordState {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const ForgotPasswordForm = ({
  onClose,
  onBackToLogin,
}: ForgotPasswordProps) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("email");
  const [formState, setFormState] = useState<ForgotPasswordState>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const animationClass = "animate__fadeIn";

  const forgotPassword = useForgotPassword();
  const verifyOTP = useVerifyOTP();
  const updatePassword = useUpdatePassword();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const showMessage = (message: string, isError: boolean = true) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 4000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  // Step 1: Send OTP to email
  const handleEmailSubmit = async () => {
    clearMessages();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email.trim())) {
      showMessage("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    forgotPassword.mutate({ email: formState.email });
  };

  useEffect(() => {
    if (forgotPassword.isSuccess) {
      setCurrentStep("otp");
    }
  }, [forgotPassword.isSuccess]);

  // Step 2: Verify OTP
  const handleOtpSubmit = async () => {
    clearMessages();

    if (formState.otp.length < 4) {
      showMessage("Please enter a valid OTP");
      setIsLoading(false);
      return;
    }

    verifyOTP.mutate({
      Token: formState.otp,
      email: formState.email,
    });
  };

  useEffect(() => {
    if (verifyOTP.isSuccess) {
      setCurrentStep("password");
    }
  }, [verifyOTP.isSuccess]);

  // Step 3: Reset password and auto-login
  const handlePasswordSubmit = async () => {
    setIsLoading(true);
    clearMessages();

    if (formState.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      showMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      updatePassword.mutate({
        email: formState.email,
        Token: formState.otp,
        Password: formState.newPassword,
      });
    } catch (error) {
      const err = error as Error;
      console.log(err.message);
      showMessage("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (updatePassword.isSuccess) {
      // Auto-login with new credentials
      const autoLogin = async () => {
        try {
          const result = await signIn("credentials", {
            identifier: formState.email.trim(),
            password: formState.newPassword,
            authType: "regular",
            redirect: false,
          });

          if (result?.ok) {
            onClose();
          } else {
            showMessage(
              "Password reset successful! Please login with your new password."
            );
            setTimeout(() => onBackToLogin(), 2000);
          }
        } catch (error) {
          const err = error as Error;
          console.log(err.message);
          showMessage(
            "Password reset successful! Please login with your new password."
          );
          setTimeout(() => onBackToLogin(), 2000);
        }
      };
      autoLogin();
    }
  }, [updatePassword.isSuccess]);

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return "Reset Your Password";
      case "otp":
        return "Verify Your Email";
      case "password":
        return "Create New Password";
      default:
        return "Reset Password";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case "email":
        return "Enter your email to receive a reset code";
      case "otp":
        return `We sent a code to ${formState.email}`;
      case "password":
        return "Enter your new password";
      default:
        return "";
    }
  };

  const canSubmitEmail = formState.email.trim().length > 0 && !isLoading;
  const canSubmitOtp = formState.otp.trim().length >= 4 && !isLoading;
  const canSubmitPassword =
    formState.newPassword.length >= 6 &&
    formState.confirmPassword.length >= 6 &&
    formState.newPassword === formState.confirmPassword &&
    !isLoading;

  return (
    <div className="p-2 w-full rounded-lg overflow-hidden relative">
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-xl text-red-600 font-comic text-center animate__animated animate__shakeX">
          {errorMessage}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border-2 border-green-300 rounded-xl text-green-600 font-comic text-center animate__animated animate__bounceIn">
          {successMessage}
        </div>
      )}

      <div className="mb-6 transition-all duration-1000">
        <div className="text-center mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold font-comic"
            style={{
              background:
                "linear-gradient(to right, var(--primary-700), var(--primary-800))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {getStepTitle()}
          </h2>
          <p
            className="font-comic mt-2"
            style={{ color: "var(--primary-600)" }}
          >
            {getStepSubtitle()}
          </p>
        </div>
      </div>

      {/* Step Forms */}
      <div className={`animate__animated ${animationClass}`}>
        {currentStep === "email" && (
          <div className="space-y-4">
            <Input
              label="Your Email Address"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              icon="📧"
              valid={formState.email.trim().length > 0}
              errorMessage={
                formState.email.trim().length === 0 ? "Email is required" : ""
              }
              required
            />

            <button
              type="button"
              onClick={handleEmailSubmit}
              disabled={!canSubmitEmail || forgotPassword.isPending}
              className={`w-full relative py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl mt-6 font-comic text-lg shadow-lg transition-all border-3 border-primary-300 flex items-center justify-center gap-2 transform animate__animated animate__pulse
                ${
                  canSubmitEmail
                    ? "hover:bg-primary-400 hover:opacity-80"
                    : "opacity-70 cursor-not-allowed"
                }`}
            >
              {forgotPassword.isPending
                ? "Sending OTP..."
                : "Send Reset Code 📤"}
            </button>
          </div>
        )}

        {currentStep === "otp" && (
          <div className="space-y-4">
            <Input
              label="Enter OTP Code"
              name="otp"
              value={formState.otp}
              onChange={handleInputChange}
              placeholder="Enter the 6-digit code"
              icon="🔐"
              valid={formState.otp.length >= 4}
              errorMessage={
                formState.otp.length > 0 && formState.otp.length < 4
                  ? "Please enter a valid OTP"
                  : ""
              }
              required
              maxLength={6}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleOtpSubmit}
                disabled={!canSubmitOtp || verifyOTP.isPending}
                className={`flex-1 relative py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl font-comic text-lg shadow-lg transition-all border-3 border-primary-300 flex items-center justify-center gap-2 transform animate__animated animate__pulse
                  ${
                    canSubmitOtp
                      ? "hover:bg-primary-400 hover:opacity-80"
                      : "opacity-70 cursor-not-allowed"
                  }`}
              >
                {verifyOTP.isPending ? "Verifying..." : "Verify Code ✅"}
              </button>
            </div>

            <button
              disabled={forgotPassword.isPending}
              type="button"
              onClick={handleEmailSubmit}
              className="w-full text-primary-600 hover:text-primary-800 font-comic text-base py-2"
            >
              {forgotPassword.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-2"></div>
                  Resending...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  Didn&apos;t receive it? Resend Code
                  <span className="ml-2">📧</span>
                </span>
              )}
            </button>
          </div>
        )}

        {currentStep === "password" && (
          <div className="space-y-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formState.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              icon="🔑"
              valid={formState.newPassword.length >= 6}
              errorMessage={
                formState.newPassword.length > 0 &&
                formState.newPassword.length < 6
                  ? "Password must be at least 6 characters"
                  : ""
              }
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              icon="🔐"
              valid={
                formState.confirmPassword.length >= 6 &&
                formState.newPassword === formState.confirmPassword
              }
              errorMessage={
                formState.confirmPassword.length > 0 &&
                formState.newPassword !== formState.confirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              required
            />

            <button
              type="button"
              onClick={handlePasswordSubmit}
              disabled={!canSubmitPassword || updatePassword.isPending}
              className={`w-full relative py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl mt-6 font-comic text-lg shadow-lg transition-all border-3 border-primary-300 flex items-center justify-center gap-2 transform animate__animated animate__pulse
                ${
                  canSubmitPassword
                    ? "hover:bg-primary-400 hover:opacity-80"
                    : "opacity-70 cursor-not-allowed"
                }`}
            >
              {updatePassword.isPending
                ? "Resetting Password..."
                : "Reset Password 🚀"}
            </button>
          </div>
        )}
      </div>

      {/* Back to Login */}
      <div className="flex items-center justify-center mt-6">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-primary-600 hover:text-primary-800 font-comic text-base flex items-center gap-1"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};
