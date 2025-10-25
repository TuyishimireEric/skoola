import React, { useEffect, useState } from "react";
import { X, Send, UserPlus } from "lucide-react";
import { useRegisterTeacher } from "@/hooks/teacher/useRegisterTeacher";

interface InviteTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteTeacherModal: React.FC<InviteTeacherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const { isPending, onSubmit, onSuccess } = useRegisterTeacher();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      FullName: formData.name,
      Email: formData.email,
    });
  };

  useEffect(() => {
    if (onSuccess) {
      onClose();
      // Reset form data after successful submission
      setFormData({ name: "", email: "" });
    }
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-700 font-comic flex items-center">
              <UserPlus className="w-6 h-6 mr-3 text-primary-600" />
              Invite Teacher
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h3 className="font-bold text-blue-700 mb-2 font-comic">
              📧 How it works:
            </h3>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• We&apos;ll send an invitation email to the teacher</li>
              <li>• They&apos;ll complete their profile after accepting</li>
              <li>
                • Status will show &quot;Invitation Pending&quot; until then
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary-700 mb-2 font-comic">
                Teacher&apos;s Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-comic text-lg"
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-700 mb-2 font-comic">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-comic text-lg"
                placeholder="john.smith@email.com"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-comic font-bold text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors font-comic font-bold text-lg flex items-center justify-center disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteTeacherModal;
