import Image from "next/image";
import { Users } from "lucide-react";
import { StudentStatsI } from "@/types/dashboard";
import { getAge, shortDate } from "@/utils/functions";
import { useClasses } from "@/hooks/classes/useClasses";

interface AdditionalSupportProps {
  studentStats: StudentStatsI[];
}

export const AdditionalSupport = ({ studentStats }: AdditionalSupportProps) => {
  const { data: classes } = useClasses();

  const getUrgency = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore < 50) return "high";
    if (numScore < 70) return "medium";
    return "low";
  };

  const getCurrentClass = (classId: number) => {
    const currentClass = classes?.find((cls) => cls.Id === classId);
    return currentClass ? currentClass.Name : "No Class";
  };

  const sortedStudents = [...studentStats].sort((a, b) => {
    const scoreA = parseFloat(a.averageScore);
    const scoreB = parseFloat(b.averageScore);
    return scoreA - scoreB; 
  });

  return (
    <div className="w-full font-comic">
      <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-primary-600" />
        Additional Support Needed!
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedStudents.map((student, index) => {
          const urgency = getUrgency(student.averageScore);

          return (
            <div
              key={index}
              className="bg-primary-50 rounded-3xl p-4 shadow-md border-2 border-primary-300 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500">
                  {student.imageUrl ? (
                    <Image
                      src={student.imageUrl}
                      alt={student.fullName}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {student.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-bold text-primary-700">
                    {student.fullName}
                  </div>
                  <div className="text-xs text-gray-600">
                    Age {getAge(student.dateOfBirth)} •{" "}
                    {getCurrentClass(student.currentClass)}
                  </div>
                  <div className="flex items-center mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        urgency === "high"
                          ? "bg-red-500"
                          : urgency === "medium"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      } mr-1`}
                    ></div>
                    <span className="text-xs font-medium capitalize">
                      {urgency} Priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-xs font-bold text-primary-600 mb-1">
                  Recent Performance:
                </h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      parseFloat(student.averageScore) < 50
                        ? "bg-red-400"
                        : parseFloat(student.averageScore) < 70
                        ? "bg-orange-400"
                        : "bg-green-400"
                    }`}
                    style={{
                      width: `${student.averageScore}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{Number(student.averageScore || 0).toFixed(1)}%</span>
                  <span className="text-gray-500">
                    Last activity:
                    <span className="font-bold">
                      {shortDate(student.lastCourseDate)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mb-2 text-xs">
                <span className="font-semibold text-primary-600">Parent: </span>
                <span className="text-gray-600">{student.parentName}</span>
              </div>

              <div className="flex justify-between mt-2">
                <button className="bg-primary-400 hover:bg-primary-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                  View Details
                </button>
                <button className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                  Contact Parent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
