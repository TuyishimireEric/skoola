"use client";

import {
  ChevronLeft,
  Crown,
  Check,
  X,
  Star,
  Zap,
  Users,
  BookOpen,
  Video,
  FileText,
  TrendingUp,
  MessageSquare,
  Calendar,
  Brain,
  Award,
  Sparkles,
} from "lucide-react";
import { StepProps } from "@/types/teacher";
import { useSubscriptions } from "@/hooks/subscriptions/useSubscriptions";

export const StepPlanSelection: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  onBack,
}) => {
  const { data: plans } = useSubscriptions();
  const teacherPlans = plans?.filter((plan) => plan.SortOrder > 3);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.selectedPlan) {
      newErrors.selectedPlan = "Please select a subscription plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-amber-900 mb-4">
          Choose Your Teaching Plan
        </h2>
        <p className="text-xl text-amber-700 max-w-2xl mx-auto leading-relaxed">
          Select the perfect plan to power your independent teaching journey 🚀
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid lg:grid-cols-3 gap-8 px-8">
        {teacherPlans?.map((plan) => {
          const isSelected = formData.selectedPlan === plan.Id.toString();
          const isPopular = plan.PlanName.toLowerCase().includes("pro");
          const isPremium = plan.PlanName.toLowerCase().includes("premium");

          return (
            <div
              key={plan.Id}
              className={`relative rounded-3xl p-8 pt-16 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                isSelected
                  ? "bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-400 shadow-xl"
                  : "bg-white border-2 border-amber-200 hover:border-orange-300 shadow-lg hover:shadow-xl"
              } ${isPremium ? "lg:transform lg:hover:scale-110" : ""}`}
              onClick={() =>
                setFormData({ ...formData, selectedPlan: plan.Id.toString() })
              }
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Premium
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900 mb-2">
                  {plan.PlanName}
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed mb-4">
                  {plan.Description}
                </p>
                <div className="text-6xl my-4 font-bold text-orange-600 mb-1">
                  ${plan.AnnualPrice}
                  <span className="text-lg text-amber-600 font-normal">
                    /month
                  </span>
                </div>
                <p className="text-sm text-amber-500">
                  or ${plan.AnnualPrice}/year (save 10%)
                </p>
              </div>

              {/* Plan Features */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex-1 border-t border-amber-200"></div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Features
                  </span>
                  <div className="flex-1 border-t border-amber-200"></div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-sm text-amber-800">
                      Up to {plan.MaxStudents || "Unlimited"} Students
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-sm text-amber-800">
                      Unlimited Courses
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-sm text-amber-800">
                      Live Classes Support
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-sm text-amber-800">
                      Assignment Management
                    </span>
                  </div>
                  {plan.PlanFeatures && (
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-sm text-amber-800">
                        Advanced Analytics
                      </span>
                    </div>
                  )}
                  {plan.PlanFeatures?.parent_portal && (
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-sm text-amber-800">
                        Parent Communication
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                >
                  {isSelected ? (
                    <span className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Selected
                    </span>
                  ) : (
                    "Select Plan"
                  )}
                </button>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Why Choose Independent Teaching */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 border-2 border-orange-200 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">
          🌟 Why Teach Independently on Ganzaa?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-amber-900 mb-2">Flexible Schedule</h4>
            <p className="text-sm text-amber-700">
              Teach when you want, how you want
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-amber-900 mb-2">AI-Powered Tools</h4>
            <p className="text-sm text-amber-700">
              Smart content creation and grading
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-amber-900 mb-2">Build Your Brand</h4>
            <p className="text-sm text-amber-700">
              Grow your teaching reputation
            </p>
          </div>
        </div>
      </div>

      {errors.selectedPlan && (
        <div className="text-center">
          <p className="text-red-600 font-medium flex items-center justify-center">
            <X className="w-5 h-5 mr-2" />
            {errors.selectedPlan}
          </p>
        </div>
      )}

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
          disabled={!formData.selectedPlan}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-orange-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="flex items-center justify-center">
            Continue to Payment
            <Sparkles className="w-5 h-5 ml-2" />
          </span>
        </button>
      </div>
    </div>
  );
};
