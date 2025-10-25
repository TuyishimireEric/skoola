"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useClientSession } from "@/hooks/user/useClientSession";
import { FormData } from "@/types/teacher";

import { StepUserRegistration } from "@/components/teachers/registration/StepUserRegistration";
import { StepBasicInfo } from "@/components/teachers/registration/StepBasicInfo";
import { StepAddress } from "@/components/teachers/registration/StepAddress";
import { StepTeachingMode } from "@/components/teachers/registration/StepTeacherMode";
import { StepPlanSelection } from "@/components/teachers/registration/StepPlanSelection";
import { StepPayment } from "@/components/teachers/registration/StepPayment";
import { StepSchoolApproval } from "@/components/teachers/registration/StepSchoolApproval";

const TeacherRegistrationForm: React.FC = () => {
  const { userName, userEmail, userId } = useClientSession();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [schoolCodeFromUrl, setSchoolCodeFromUrl] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    aboutMe: "",
    subjects: [],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    teachingMode: "",
    schoolCode: "",
    selectedPlan: "",
    paymentData: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is already logged in
  useEffect(() => {
    if (userId) {
      // User is already logged in, skip registration step
      setCurrentStep(1);

      // Pre-fill form data with user info
      if (userName) {
        setFormData((prev) => ({ ...prev, fullName: userName }));
      }
      if (userEmail) {
        setFormData((prev) => ({ ...prev, email: userEmail }));
      }
    }
  }, [userId, userName, userEmail]);

  // Check URL for school code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("schoolCode");
    if (code) {
      setSchoolCodeFromUrl(code);
      setFormData((prev) => ({ ...prev, schoolCode: code }));
    }
  }, []);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      setIsAnimating(false);
    }, 100);
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSchoolApprovalWait = () => {
    setCurrentStep(6);
  };

  // Determine which steps to show based on teaching mode
  const getVisibleSteps = () => {
    const steps = userId ? [1, 2, 3] : [0, 1, 2, 3];

    if (formData.teachingMode === "independent") {
      return [...steps, 4, 5];
    } else if (formData.teachingMode === "school") {
      return [...steps, 6];
    }

    return steps;
  };

  const visibleSteps = getVisibleSteps();

  const renderStep = () => {
    const stepProps = {
      formData,
      setFormData,
      errors,
      setErrors,
      onNext: handleNext,
      onBack: handleBack,
      isLoading: false,
    };

    switch (currentStep) {
      case 0:
        return <StepUserRegistration {...stepProps} />;
      case 1:
        return <StepBasicInfo {...stepProps} />;
      case 2:
        return <StepAddress {...stepProps} />;
      case 3:
        return (
          <StepTeachingMode
            {...stepProps}
            schoolCodeFromUrl={schoolCodeFromUrl}
            onSchoolApprovalWait={handleSchoolApprovalWait}
          />
        );
      case 4:
        return <StepPlanSelection {...stepProps} />;
      case 5:
        return <StepPayment {...stepProps} />;
      case 6:
        return <StepSchoolApproval formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden font-comic">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-amber-200 rounded-full opacity-20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-200 rounded-full opacity-15 blur-2xl animate-pulse delay-500" />
        <div className="absolute top-1/3 left-1/3 text-8xl opacity-5">🎓</div>
        <div className="absolute bottom-1/4 right-1/3 text-6xl opacity-5">
          📚
        </div>
        <div className="absolute top-1/4 right-1/4 text-5xl opacity-5">✨</div>
        <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-5">
          🌟
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border-4 border-amber-200 p-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -top-8 left-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base sm:text-xl font-comic font-bold py-3 px-6 rounded-full shadow-lg border-4 border-white"
            >
              🎓 Teacher Registration
            </motion.div>

            <div
              className={`transition-all duration-500 ${
                isAnimating
                  ? "opacity-0 transform translate-y-8"
                  : "opacity-100 transform translate-y-0"
              }`}
            >
              {/* Progress Bar */}
              <div className="flex justify-center mb-12">
                <div className="flex space-x-3 mt-5">
                  {visibleSteps.map((step, index) => {
                    const isActive = index <= visibleSteps.indexOf(currentStep);
                    const isCurrent = step === currentStep;

                    return (
                      <div
                        key={step}
                        className={`relative transition-all duration-500 ${
                          isActive
                            ? "w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-lg"
                            : "w-4 h-4 bg-amber-300 rounded-full"
                        } ${
                          isCurrent ? "scale-125 ring-4 ring-orange-200" : ""
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegistrationForm;
