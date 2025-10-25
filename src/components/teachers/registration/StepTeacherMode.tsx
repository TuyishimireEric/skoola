"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Users,
  School,
  Check,
  X,
  Star,
  Sparkles,
  Building2,
  Mail,
  Phone,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { StepProps } from "@/types/teacher";
import { useTeacherInvitation } from "@/hooks/teacher/useTeacherInvitation";
import { useSearchParams, useRouter } from "next/navigation";
import { useActivateTeacher } from "@/hooks/teacher/useActivateTeacher";
import { useClientSession } from "@/hooks/user/useClientSession";

interface StepTeachingModeProps extends StepProps {
  schoolCodeFromUrl?: string;
  onSchoolApprovalWait?: () => void;
}

export const StepTeachingMode: React.FC<StepTeachingModeProps> = ({
  errors,
  setErrors,
  onBack,
}) => {
  const { userId } = useClientSession();
  const router = useRouter();
  const activateTeacher = useActivateTeacher();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;
  const [invitationCode, setInvitationCode] = useState("");

  const {
    data: invitation,
    isLoading: invitationLoading,
    error,
  } = useTeacherInvitation({ token });

  // Handle activation success
  useEffect(() => {
    if (activateTeacher.isSuccess) {
      router.push("/dashboard/teacher");
    }
  }, [activateTeacher.isSuccess, router]);

  // Handle activation error
  useEffect(() => {
    if (activateTeacher.isError) {
      setErrors({
        general: "Failed to join organization. Please try again.",
      });
    }
  }, [activateTeacher.isError, setErrors]);

  const handleJoinOrganization = async () => {
    if (!userId || !invitation?.organization?.id || !token) {
      setErrors({
        general: "Missing required information. Please try again.",
      });
      return;
    }

    const formData = {
      Id: userId,
      OrganizationId: invitation.organization.id,
      Token: token,
    };

    activateTeacher.mutate(formData);
  };

  const handleInvitationCodeSubmit = () => {
    if (!invitationCode.trim()) {
      setErrors({
        general: "Please enter a valid invitation code.",
      });
      return;
    }

    // Redirect to the same page with the token as a query parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("token", invitationCode.trim());
    router.push(currentUrl.toString());
  };

  const getOrganizationTypeIcon = (type: string) => {
    switch (type) {
      case "School":
        return <School className="w-6 h-6" />;
      case "NGO":
        return <Users className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  const getOrganizationTypeColor = (type: string) => {
    switch (type) {
      case "School":
        return "from-blue-500 to-indigo-600";
      case "NGO":
        return "from-green-500 to-emerald-600";
      default:
        return "from-purple-500 to-violet-600";
    }
  };

  // If no token, show invitation code input
  if (!token) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <School className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            Join Your School
          </h2>
          <p className="text-xl text-amber-700 leading-relaxed">
            Please enter the school invitation code to continue
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border-3 border-amber-200">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="invitationCode"
                className="block text-lg font-bold text-amber-900 mb-3"
              >
                School Invitation Code
              </label>
              <input
                id="invitationCode"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Enter your invitation code"
                className="w-full px-6 py-4 text-lg border-2 border-amber-200 rounded-2xl focus:border-amber-500 focus:outline-none transition-colors duration-300"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleInvitationCodeSubmit();
                  }
                }}
              />
            </div>

            {errors.general && (
              <div className="text-center">
                <p className="text-red-600 font-medium flex items-center justify-center bg-red-50 rounded-xl p-4 border border-red-200">
                  <X className="w-5 h-5 mr-2" />
                  {errors.general}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="px-8 py-4 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>

              <button
                onClick={handleInvitationCodeSubmit}
                disabled={!invitationCode.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-8 rounded-2xl text-lg font-bold hover:from-amber-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error loading the invitation, show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
          <X className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-red-900">Invalid Invitation</h2>
        <p className="text-red-700">
          This invitation link is invalid or has expired. Please contact your
          school administrator for a new invitation.
        </p>
        <button
          onClick={onBack}
          className="px-8 py-4 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center mx-auto"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  // Show loading state while fetching invitation
  if (invitationLoading || !invitation) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-bold text-amber-900">
          Loading Invitation...
        </h2>
        <p className="text-amber-700">
          Please wait while we verify your invitation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-amber-900 mb-4">
          You&apos;re Invited! 🎉
        </h2>
        <p className="text-xl text-amber-700 max-w-2xl mx-auto leading-relaxed">
          You&apos;ve been invited to join an amazing educational organization
        </p>
      </div>

      {/* Organization Card */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border-3 border-amber-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Organization Logo/Icon */}
          <div className="flex-shrink-0">
            {invitation.organization?.logo ? (
              <img
                src={invitation.organization.logo}
                alt={`${invitation.organization.name} logo`}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div
                className={`w-24 h-24 bg-gradient-to-br ${getOrganizationTypeColor(
                  invitation.organization?.type || "Public"
                )} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <div className="text-white">
                  {getOrganizationTypeIcon(
                    invitation.organization?.type || "Public"
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Organization Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-3xl font-bold text-amber-900 mb-2">
                {invitation.organization?.name}
              </h3>
              <div className="flex items-center text-amber-700 mb-3">
                <div
                  className={`px-3 py-1 bg-gradient-to-r ${getOrganizationTypeColor(
                    invitation.organization?.type || "Public"
                  )} text-white rounded-full text-sm font-medium`}
                >
                  {invitation.organization?.type}
                </div>
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid md:grid-cols-2 gap-4">
              {invitation.organization?.email && (
                <div className="flex items-center text-amber-800">
                  <Mail className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {invitation.organization.email}
                  </span>
                </div>
              )}

              {invitation.organization?.phone && (
                <div className="flex items-center text-amber-800">
                  <Phone className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
                  <span className="text-sm">
                    {invitation.organization.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invitation Details */}
        <div className="mt-8 border-t border-amber-200 pt-6">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-amber-600" />
              What You&apos;ll Get
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center text-amber-800">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm">
                  Full access to teaching platform
                </span>
              </div>
              <div className="flex items-center text-amber-800">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm">
                  Organization resources & curriculum
                </span>
              </div>
              <div className="flex items-center text-amber-800">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm">Collaborate with team members</span>
              </div>
              <div className="flex items-center text-amber-800">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm">No subscription fees required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invitation Metadata */}
        <div className="mt-6 flex items-center justify-between text-sm text-amber-600 bg-amber-50 rounded-xl p-4">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span>Invited: {invitation.email}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(errors.general || activateTeacher.isError) && (
        <div className="text-center">
          <p className="text-red-600 font-medium flex items-center justify-center bg-red-50 rounded-xl p-4 border border-red-200">
            <X className="w-5 h-5 mr-2" />
            {errors.general || "Failed to join organization. Please try again."}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 max-w-md mx-auto">
        <button
          onClick={onBack}
          disabled={activateTeacher.isPending}
          className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl font-bold hover:bg-amber-200 transition-all duration-300 flex items-center disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <button
          onClick={handleJoinOrganization}
          disabled={
            activateTeacher.isPending ||
            !userId ||
            !invitation?.organization?.id
          }
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 px-8 rounded-2xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {activateTeacher.isPending ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Joining Organization...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Join {invitation.organization?.name}
              <Sparkles className="w-5 h-5 ml-2" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
