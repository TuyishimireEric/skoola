"use client";

import { ChevronLeft, CreditCard, Lock, Shield } from "lucide-react";
import { StepProps, formatCardNumber } from "@/types/teacher";
import { useSubscriptions } from "@/hooks/subscriptions/useSubscriptions";

export const StepPayment: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  onBack,
  isLoading,
}) => {
  const { data: plans } = useSubscriptions();
  const teacherPlans = plans?.filter((plan) => plan.SortOrder > 3);
  const selectedPlanData = teacherPlans?.find(
    (plan) => plan.Id.toString() === formData.selectedPlan
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentData.cardNumber.replace(/\s/g, "")) {
      newErrors.cardNumber = "Card number is required";
    } else if (formData.paymentData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.paymentData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    if (!formData.paymentData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (formData.paymentData.cvv.length < 3) {
      newErrors.cvv = "CVV must be at least 3 digits";
    }

    if (!formData.paymentData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // TODO: Implement payment processing
    // For now, just move to the next step
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CreditCard className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-amber-900 mb-4">
          Secure Payment
        </h2>
        <p className="text-lg text-amber-700">
          Complete your registration with our secure payment system 🔒
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Payment Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-amber-900 mb-2">
                  Cardholder Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.paymentData.cardholderName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentData: {
                        ...formData.paymentData,
                        cardholderName: e.target.value,
                      },
                    })
                  }
                  placeholder="John Doe"
                  className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                />
                {errors.cardholderName && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-900 mb-2">
                  Card Number <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.paymentData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(
                      e.target.value.slice(0, 19)
                    );
                    setFormData({
                      ...formData,
                      paymentData: {
                        ...formData.paymentData,
                        cardNumber: formatted,
                      },
                    });
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                />
                {errors.cardNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-2">
                    Expiry Date <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.paymentData.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 2) {
                        value =
                          value.substring(0, 2) + "/" + value.substring(2, 4);
                      }
                      setFormData({
                        ...formData,
                        paymentData: {
                          ...formData.paymentData,
                          expiryDate: value,
                        },
                      });
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-2">
                    CVV <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.paymentData.cvv}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setFormData({
                        ...formData,
                        paymentData: {
                          ...formData.paymentData,
                          cvv: value,
                        },
                      });
                    }}
                    placeholder="123"
                    maxLength={4}
                    className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white/80 backdrop-blur-sm text-amber-900"
                  />
                  {errors.cvv && (
                    <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-4 border-2 border-green-200">
            <div className="flex items-center text-green-800">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-lg">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Order Summary
            </h3>

            {selectedPlanData && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-amber-900">
                      {selectedPlanData.PlanName}
                    </h4>
                    <p className="text-sm text-amber-700">
                      Independent Teaching Plan
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      ${selectedPlanData.AnnualPrice}
                    </div>
                    <div className="text-sm text-amber-600">per year</div>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-4">
                  <div className="flex justify-between text-sm text-amber-800 mb-2">
                    <span>Teacher:</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-800 mb-2">
                    <span>Subjects:</span>
                    <span className="font-medium">
                      {formData.subjects.length} selected
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-800">
                    <span>Billing Cycle:</span>
                    <span className="font-medium">Annual</span>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-amber-900">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-orange-600">
                      ${selectedPlanData.AnnualPrice}
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Billed annually • Cancel anytime
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200">
            <h4 className="font-bold text-amber-900 mb-3">
              What happens next?
            </h4>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span>Instant account activation</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span>Access your teacher dashboard</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span>Start creating courses & inviting students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
        <button
          onClick={onBack}
          className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Processing Payment...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Complete Registration
              <Lock className="w-5 h-5 ml-2" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
