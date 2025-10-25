import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, UserPlus, Loader2, Check } from "lucide-react";
import { useState } from "react";
import showToast from "@/utils/showToast";

interface AddStudentCardProps {
  onClick: () => void;
}

const AddStudentCard = ({ onClick }: AddStudentCardProps) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const handleInviteCodeSubmit = async () => {
    if (!inviteCode.trim()) {
      showToast("Please enter an invite code", "error");
      return;
    }

    // Validate format (1 letter + 4 digits)
    const codeRegex = /^[A-Z][0-9]{4}$/;
    if (!codeRegex.test(inviteCode.toUpperCase())) {
      showToast("Invalid code format. Use format: A1234", "error");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/user/invitations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: inviteCode.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to validate invite code");
      }

      if (data.status === "Success") {
        setValidationSuccess(true);
        showToast(
          `Successfully connected to ${data.data.studentName}!`,
          "success"
        );

        // Auto close modal after success
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteCode("");
          setValidationSuccess(false);
          // You might want to refresh the student list here
          window.location.reload(); // Simple refresh, or use your state management
        }, 2000);
      } else {
        showToast(data.message || "Failed to validate invite code", "error");
      }
    } catch (error) {
      console.error("Error validating invite code:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to validate invite code",
        "error"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeInput = (value: string) => {
    // Auto format: convert to uppercase and limit to 5 characters
    const formatted = value.toUpperCase().slice(0, 5);
    setInviteCode(formatted);
  };

  return (
    <>
      <motion.div
        className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] cursor-pointer hover:border-orange-400 hover:from-orange-50 hover:to-yellow-50 transition-all group relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <motion.div
            className="absolute top-4 right-4 text-4xl"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌟
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4 text-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🎓
          </motion.div>
        </div>

        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative z-10"
          whileHover={{ rotate: 90 }}
        >
          <Plus className="w-10 h-10 text-white" />
        </motion.div>

        <h3 className="font-black text-xl text-gray-700 mb-2 relative z-10">
          Add Student
        </h3>
        <p className="text-sm font-bold text-gray-600 text-center mb-6 relative z-10">
          Register a new child or connect to an existing student
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs relative z-10">
          <motion.button
            onClick={onClick}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus size={16} />
            Create New Account
          </motion.button>

          <motion.button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={16} />
            Use Invite Code
          </motion.button>
        </div>
      </motion.div>

      {/* Invite Code Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isValidating && setShowInviteModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-800">
                  Connect with Student
                </h3>
                <button
                  onClick={() => !isValidating && setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  disabled={isValidating}
                >
                  <X size={20} />
                </button>
              </div>

              {!validationSuccess ? (
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <span>ℹ️</span>
                      How it works:
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Ask your child to generate a parent code</li>
                      <li>Enter the 5-character code below</li>
                      <li>Your accounts will be connected instantly!</li>
                    </ol>
                  </div>

                  {/* Code Input */}
                  <div className="text-center">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Enter Student&apos;s Invite Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => handleCodeInput(e.target.value)}
                        placeholder="A1234"
                        className="w-full text-center text-2xl font-black tracking-widest px-4 py-4 rounded-xl border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all uppercase"
                        maxLength={5}
                        disabled={isValidating}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Format: One letter followed by four numbers (e.g., A1234)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleInviteCodeSubmit}
                    disabled={isValidating || inviteCode.length !== 5}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isValidating ? 1 : 1.02 }}
                    whileTap={{ scale: isValidating ? 1 : 0.98 }}
                  >
                    {isValidating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Users size={16} />
                        Connect to Student
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                // Success State
                <div className="text-center space-y-4">
                  <motion.div
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check size={40} className="text-white" />
                  </motion.div>

                  <div>
                    <h4 className="text-xl font-bold text-green-600 mb-2">
                      Successfully Connected!
                    </h4>
                    <p className="text-gray-600">
                      You can now view your child&apos;s progress and activities.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700">
                      🎉 The page will refresh automatically to show your
                      connected student.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddStudentCard;
