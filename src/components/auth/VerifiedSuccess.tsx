import { CheckCircle } from "lucide-react";

interface VerifiedSuccessProps {
  onClose: () => void;
}

export const VerifiedSuccess = ({ onClose }: VerifiedSuccessProps) => {
  return (
    <div className="text-center space-y-6 font-comic">
      <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse ">
        <CheckCircle className="w-20 h-20 text-white" />
      </div>
      <h3 className="text-3xl font-bold text-green-600">Welcome Aboard! �</h3>
      <p className="text-gray-600 text-lg">
        Your account has been Verified successfully.
        Let&apos;s start your amazing learning journey!
      </p>

      <div className="grid grid-cols-3 gap-4 mt-8 mb-8">
        <div className="text-center">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-sm text-gray-600">Rich Content</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">🎮</div>
          <p className="text-sm text-gray-600">Fun Learning</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm text-gray-600">Achievements</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-green-600 hover:to-green-700 transform transition-all duration-300 border-3 border-green-400 shadow-lg"
        style={{
          boxShadow: "0px 8px 20px rgba(34, 197, 94, 0.3)",
        }}
      >
        Continue 🚀
      </button>
    </div>
  );
};
