import React, { useState } from "react";
import {
  Mail,
  Phone,
  Users,
  Edit,
  Trash2,
  Star,
  Clock,
  Eye,
  MoreVertical,
} from "lucide-react";
import { TeacherData } from "@/types/teacher";
import { timeFromNow } from "@/utils/functions";
import ProfileImage from "../dashboard/ProfileImage";

interface TeacherCardProps {
  teacher: TeacherData;
  onView: (teacher: TeacherData) => void;
  onEdit: (teacher: TeacherData) => void;
  onDelete: (id: string) => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  onView,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Invitation Pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isPending = teacher.status === "Invitation Pending";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border-2 border-primary-200 hover:shadow-xl transition-all duration-300 font-comic">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 bg-white border-4 border-green-400 via-green-500 to-green-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group">
            <ProfileImage imageUrl={teacher.image ?? ""} size="w-11 h-11" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-primary-700 truncate">
              {teacher.fullName}
            </h3>
            {!isPending && (
              <>
                <p className="text-sm text-primary-600 truncate">
                  {teacher.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {teacher.grade}
                </p>
              </>
            )}
            {isPending && (
              <p className="text-sm text-gray-500">
                Profile pending completion
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2 flex-shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
              teacher.status
            )}`}
          >
            {teacher.status}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-primary-300 rounded-xl shadow-xl z-20 w-36">
                  <button
                    onClick={() => {
                      onView(teacher);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium text-primary-700 first:rounded-t-xl flex items-center transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </button>
                  {!isPending && (
                    <button
                      onClick={() => {
                        onEdit(teacher);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium text-primary-700 flex items-center transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(teacher.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-700 last:rounded-b-xl flex items-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isPending ? "Cancel Invite" : "Remove"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
          <span className="truncate">{teacher.email}</span>
        </div>
        {!isPending && (
          <>
            {teacher.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                <span>{teacher.phone}</span>
              </div>
            )}
            {teacher.joinDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                <span>{timeFromNow(teacher.joinDate)} with us</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        {!isPending ? (
          <>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-primary-500" />
                <span className="text-sm font-medium text-primary-700">
                  {teacher.studentsCount}
                </span>
              </div>
              {teacher.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-primary-700">
                    {teacher.rating}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => onView(teacher)}
              className="bg-primary-400 text-white px-4 py-2 rounded-full hover:bg-primary-500 transition-colors text-sm font-bold"
            >
              View Profile
            </button>
          </>
        ) : (
          <div className="w-full">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-700 font-medium text-center">
                ⏳ Waiting for {teacher.fullName.split(" ")[0]} to complete
                their profile
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCard;
