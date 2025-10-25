"use client";

import { Clock, Sparkles } from "lucide-react";
import { FormData } from "@/types/teacher";

interface StepSchoolApprovalProps {
  formData: FormData;
}

export const StepSchoolApproval: React.FC<StepSchoolApprovalProps> = ({
  formData,
}) => {
  return (
    <div className="text-center space-y-10 max-w-4xl mx-auto">
      <div className="relative">
        <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
          <Clock className="w-20 h-20 text-white" />
        </div>
        <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
          ⏳
        </div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce delay-200">
          📧
        </div>
      </div>

      <div>
        <h1 className="text-6xl font-bold text-amber-900 mb-6 leading-tight">
          Waiting for School Approval
        </h1>
        <p className="text-2xl text-amber-700 mb-4">
          🎓 Your teacher account has been created!
        </p>
        <p className="text-lg text-amber-600">
          We&apos;ve notified the school administrator. You&apos;ll receive an email once
          approved.
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-10 border-2 border-orange-200">
        <h3 className="text-2xl font-bold text-amber-900 mb-6">
          📨 Check Your Email
        </h3>
        <p className="text-amber-700 mb-4">
          We&apos;ve sent account verification instructions to:
        </p>
        <p className="text-xl font-bold text-orange-600 mb-6">
          {formData.email}
        </p>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-5xl mb-3">✅</div>
            <h4 className="font-bold text-amber-900 mb-2">Account Created</h4>
            <p className="text-sm text-amber-700">Your profile is ready</p>
          </div>
          <div>
            <div className="text-5xl mb-3">⏳</div>
            <h4 className="font-bold text-amber-900 mb-2">Pending Approval</h4>
            <p className="text-sm text-amber-700">School admin will review</p>
          </div>
          <div>
            <div className="text-5xl mb-3">🚀</div>
            <h4 className="font-bold text-amber-900 mb-2">Get Ready</h4>
            <p className="text-sm text-amber-700">
              Start planning your classes
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-lg text-amber-700">
          💡 <strong>Tip:</strong> While you wait, why not explore our teaching
          resources?
        </p>
        <button
          onClick={() => (window.location.href = "/resources")}
          className="w-full max-w-md mx-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-amber-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl"
        >
          <span className="flex items-center justify-center">
            📚 Explore Teaching Resources
            <Sparkles className="w-5 h-5 ml-2" />
          </span>
        </button>

        <p className="text-sm text-amber-600">
          Need help? Contact support at support@ganzaa.org
        </p>
      </div>
    </div>
  );
};
