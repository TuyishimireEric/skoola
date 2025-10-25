import { useState } from "react";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { FormErrors } from "@/types";
import { useVerify } from "@/hooks/user/useVerify";
import { useSendVerification } from "@/hooks/user/useSendVerification";

interface FormData {
  verificationCode: string;
}

interface VarifyEmailFormProps {
  userId: string | null;
  email: string;
  password: string;
  onClose: () => void;
  setCurrentStep: (st: number) => void;
}

export const VerifyEmailForm = ({
  userId,
  email,
  password,
  onClose,
  setCurrentStep,
}: VarifyEmailFormProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormData>({
    verificationCode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const resendVerification = useSendVerification();

  const { onVerify, isPending: isVerifying } = useVerify({
    email,
    password,
    onClose,
    setCurrentStep,
  });

  const validateVerification = () => {
    const newErrors: FormErrors = {};
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = "Verification code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateVerification()) {
      if (!userId) return;
      try {
        await onVerify({ Token: formData.verificationCode, UserId: userId });
      } catch (e) {
        const error = e as Error;
        console.log(error.message);
      }
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");

    if (userId) {
      resendVerification.mutate({ UserId: userId });
    }
  };

  return (
    <div className="space-y-6 font-comic">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-primary-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-700 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">We&apos;ve sent a verification code to:</p>
        <p className="font-bold text-gray-700 text-lg mt-1">{email}</p>
      </div>

      <div className="relative group">
        <label className="block text-lg font-bold text-gray-700 mb-2">
          <Lock className="inline w-5 h-5 mr-2" />
          Verification Code
        </label>
        <input
          name="verificationCode"
          value={formData.verificationCode}
          onChange={(e) =>
            setFormData({ ...formData, verificationCode: e.target.value })
          }
          placeholder="Enter 6-digit code"
          maxLength={6}
          className={`w-full px-5 py-4 text-center text-2xl tracking-wider rounded-2xl border-2 transition-all duration-300 ${
            errors.verificationCode
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-primary-300 bg-white focus:border-primary-500 focus:bg-green-50"
          } focus:outline-none focus:ring-4 focus:ring-primary-200 font-mono`}
        />
        {errors.verificationCode && (
          <p className="mt-2 text-red-500 text-sm flex items-center justify-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.verificationCode}
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center p-4 bg-red-100 rounded-2xl border-2 border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isVerifying}
        className="w-full bg-gradient-to-br from-yellow-400 to-primary-400 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-primary-400 hover:to-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-3 border-primary-400"
        style={{
          boxShadow: isVerifying
            ? "none"
            : "0px 8px 20px rgba(147, 51, 234, 0.3)",
        }}
      >
        {isVerifying ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Verifying...
          </div>
        ) : (
          "Verify & Continue ✨"
        )}
      </button>

      <button
        onClick={handleResendCode}
        disabled={resendVerification.isPending}
        className="w-full text-primary-600 py-3 px-6 rounded-2xl text-lg hover:bg-primary-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resendVerification.isPending ? (
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
  );
};
