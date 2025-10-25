import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Users,
  Star,
  Trophy,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
// Note: Import useRouter from next/navigation in your actual project

// Student interface matching your existing data structure
interface Student {
  id: string;
  name: string;
  age: number;
  level: number;
  totalStars: number;
  coursesCompleted: number;
  currentStreak: number;
  avatar: string;
  avatarType: "emoji" | "custom";
  imageUrl: string | null;
  rank: string;
}

interface StudentSwitcherProps {
  students: Student[];
  currentStudentId: string;
  onStudentChange: (studentId: string) => void;
}

const StudentSwitcher: React.FC<StudentSwitcherProps> = ({
  students,
  currentStudentId,
  onStudentChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const currentStudent = students.find((s) => s.id === currentStudentId);

  const handleBackToParent = () => {
    router.push("/parent");
  };

  const handleStudentSelect = (studentId: string) => {
    onStudentChange(studentId);
    setIsOpen(false);
  };

  if (!currentStudent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-primary-200 p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        {/* Back to Parent Dashboard */}
        <motion.button
          onClick={handleBackToParent}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-50 hover:from-primary-200 hover:to-primary-100 text-primary-700 rounded-xl font-bold transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Parent Dashboard</span>
        </motion.button>

        {/* Current Student Display */}
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-primary-600 hidden sm:inline">
            Viewing:
          </span>

          {/* Student Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 rounded-xl transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Current Student Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-lg shadow-sm">
                {currentStudent.avatarType === "custom" &&
                currentStudent.imageUrl ? (
                  <img
                    src={currentStudent.imageUrl}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span>{currentStudent.avatar}</span>
                )}
              </div>

              {/* Student Info */}
              <div className="text-left">
                <p className="font-black text-primary-700 text-sm">
                  {currentStudent.name}
                </p>
                <p className="text-xs text-primary-600">
                  Age {currentStudent.age} • Level {currentStudent.level}
                </p>
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-primary-600" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border-2 border-primary-100 p-2 z-50"
                >
                  <div className="p-2 border-b border-primary-100 mb-2">
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                      Switch Student ({students.length})
                    </p>
                  </div>

                  {students.map((student) => (
                    <motion.button
                      key={student.id}
                      onClick={() => handleStudentSelect(student.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        student.id === currentStudentId
                          ? "bg-gradient-to-r from-yellow-100 to-orange-100 ring-2 ring-primary-300"
                          : "hover:bg-primary-50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Student Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-xl shadow-sm relative">
                        {student.avatarType === "custom" && student.imageUrl ? (
                          <img
                            src={student.imageUrl}
                            alt={student.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <span>{student.avatar}</span>
                        )}
                        {student.id === currentStudentId && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Student Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-primary-700">
                            {student.name}
                          </h4>
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-bold">
                            {student.rank}
                          </span>
                        </div>
                        <p className="text-xs text-primary-600 mb-2">
                          Age {student.age} • Level {student.level}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-3 h-3" />
                            <span>{student.totalStars}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <Trophy className="w-3 h-3" />
                            <span>{student.coursesCompleted}</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-600">
                            <Flame className="w-3 h-3" />
                            <span>{student.currentStreak}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentSwitcher;
