"use client";

import React, { useState } from "react";
import { Target } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import KidsProfile from "@/components/dashboard/KidsProfile";
import LearningPath from "@/components/dashboard/LearningPath";
import { useClientSession } from "@/hooks/user/useClientSession";
import { GoalCalendar } from "@/components/dashboard/GoalCalendar";
import { useKidsProfile } from "@/hooks/profile/useKidsProfile";
import StudentSwitcher from "@/components/dashboard/StudentSwitcher";
import MissedQuestions from "@/components/games/MissedQuestions";

const KidsDashboard = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Existing code...
  const { userId: currentUserId, userRoleId } = useClientSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get studentId from URL or fallback to current user's ID
  const studentIdFromUrl = searchParams.get("studentId");
  const userId = studentIdFromUrl || currentUserId;

  // Fetch all students data (for the switcher)
  const { data: allStudents } = useKidsProfile();

  // Handler for changing active student
  const handleStudentChange = (newStudentId: string) => {
    if (newStudentId == userId) return;
    router.push(`/kids?studentId=${newStudentId}`);
  };

  const studentId = userRoleId == 2 ? currentUserId : studentIdFromUrl;

  if (selectedLevel) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🚀</div>
            <h3 className="text-2xl sm:text-3xl font-black text-orange-600 mb-2">
              Ready for Adventure?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              Starting:{" "}
              <span className="text-orange-600 font-bold">{selectedLevel}</span>
            </p>
          </div>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-base sm:text-lg hover:shadow-lg transition-all">
              Let&apos;s Go! 🎮
            </button>
            <button
              onClick={() => setSelectedLevel(null)}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-4 rounded-2xl font-black text-base sm:text-lg hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-3 sm:p-4 pt-20 sm:pt-28">
        <div className="max-w-7xl mx-auto ">
          {studentIdFromUrl && allStudents && allStudents.length > 0 && (
            <div className="relative z-50">
              <StudentSwitcher
                students={allStudents}
                currentStudentId={studentIdFromUrl}
                onStudentChange={handleStudentChange}
              />
            </div>
          )}
          {/* Mobile-first: KidsProfile first, then Learning Path */}
          <div className=" z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:items-stretch">
            {/* Kids Profile */}
            <div className="lg:col-span-1 lg:order-2 flex">
              <div className="flex flex-col flex-1 pt-8 border-2 border-primary-200 bg-primary-100 backdrop-blur-xl p-6 shadow-xl rounded-3xl">
                <KidsProfile userId={userId} />
              </div>
            </div>

            {/* Learning Path */}
            <div className="lg:col-span-2 lg:order-1 flex">
              <div className="flex flex-col flex-1 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl p-4 shadow-xl min-h-[600px] pb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-br from-orange-400 to-pink-500 text-white p-2 sm:p-3 rounded-xl">
                      <Target size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800">
                        {studentIdFromUrl ? "Today's" : "Your "} Learning
                        Journey
                      </h2>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Click a level to start your adventure!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content fills remaining height */}
                <div className="flex-1 relative">
                  <LearningPath studentId={userId} />
                </div>
              </div>
            </div>
          </div>

          <GoalCalendar studentId={userId} />
          {studentId && <MissedQuestions studentId={studentId} userRoleId={userRoleId} />}
        </div>
      </div>
    </>
  );
};

export default KidsDashboard;
