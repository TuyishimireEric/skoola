import { UserDataI } from "@/types";
import showToast from "@/utils/showToast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ProfileImage from "../dashboard/ProfileImage";

const ParentInviteSection = ({ student }: { student: UserDataI | null }) => {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Get parent data from dbUserData
  const connectedParent = student?.ParentName
    ? {
        name: student.ParentName,
        email: student.ParentEmail || "No email provided",
        imageUrl: student.ParentImage || "👨‍👩‍👧‍👦",
      }
    : null;

  const generateInviteCode = async () => {
    // Don't generate if parent already connected
    if (connectedParent) {
      showToast("You already have a parent connected!", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/user/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate invite code");
      }

      const data = await response.json();

      if (data.status === "Success") {
        setInviteCode(data.data.inviteCode);
        setExpiresAt(new Date(data.data.expiresAt));
        setShowCode(true);
        showToast("Parent invite code generated successfully!", "success");
      } else {
        showToast(data.message || "Failed to generate invite code", "error");
      }
    } catch (error) {
      console.error("Error generating invite code:", error);
      showToast("Failed to generate invite code. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteCode);
    showToast("Code copied to clipboard!", "success");
  };

  const formatTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) return "Expired";

    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  // Timer effect for countdown
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= expiresAt) {
        setShowCode(false);
        setInviteCode("");
        setExpiresAt(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (connectedParent != null) {
    // Show connected parent info
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg relative"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-1 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl flex items-center justify-center overflow-hidden">
                  <ProfileImage
                    imageUrl={connectedParent.imageUrl || "🦁"}
                    size="w-9 h-9"
                  />
                </div>
              </motion.div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-800 text-lg">
                {connectedParent.name}
              </h4>
              <p className="text-green-600 text-sm font-medium">
                Parent/Guardian
              </p>
              <p className="text-green-600 text-sm"> {connectedParent.email}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Your parent is connected to your account. They can view your
            progress and activities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showCode ? (
        // Show generate button
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
            <h4 className="font-bold text-gray-800 mb-2">
              Connect Your Parent
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Generate a code for your parent to connect to your account and
              track your progress.
            </p>

            <motion.button
              onClick={generateInviteCode}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="text-lg">🔗</span>
                  Get Parent Code
                </>
              )}
            </motion.button>
          </div>
        </div>
      ) : (
        // Show generated code
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-bold text-amber-800 mb-2">
              Parent Invite Code Generated!
            </h4>
            <p className="text-sm text-amber-700 mb-4">
              Share this code with your parent to connect your accounts.
            </p>

            {/* Display the code */}
            <div className="bg-white rounded-xl p-4 mb-4 border-2 border-amber-300">
              <div className="text-3xl font-black text-amber-600 tracking-widest mb-2">
                {inviteCode}
              </div>
              <button
                onClick={copyToClipboard}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 mx-auto"
              >
                <span>📋</span>
                Copy Code
              </button>
            </div>

            {/* Countdown timer */}
            {expiresAt && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-semibold">
                  ⏰ Expires in: {formatTimeLeft(expiresAt)}
                </p>
                <p className="text-red-500 text-xs mt-1">
                  Code will expire automatically for security
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              How to connect:
            </h5>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Share this code with your parent</li>
              <li>Parent logs into their account</li>
              <li>Parent goes to &quot;Add Student&quot; and enters this code</li>
              <li>Your accounts will be connected!</li>
            </ol>
          </div>

          <button
            onClick={() => {
              setShowCode(false);
              setInviteCode("");
              setExpiresAt(null);
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ParentInviteSection;
