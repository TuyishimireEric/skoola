import { ChevronRight, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import ProfileImage from "./ProfileImage";

// Admin Dashboard Types
interface TopStudent {
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

interface TopStudentsCardProps {
  students: TopStudent[];
}

const TopStudentsCard: React.FC<TopStudentsCardProps> = ({ students }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("Week");

  return (
    <div className="col-span-2 bg-primary-50 rounded-3xl p-4 shadow-lg border-2 border-primary-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary-700 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-primary-600" />
          Student Ranking
        </h2>
        <div>
          <select
            className="bg-white border-2 border-primary-300 text-primary-700 rounded-full px-2 py-1 text-sm font-medium focus:outline-none focus:border-primary-500"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
            <option value="Year">This Year</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {students.map((student, index) => (
          <div
            key={index}
            className={`flex items-center p-2 rounded-xl ${
              student.isCurrentUser
                ? "bg-primary-100 border-2 border-primary-400"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-300 text-white font-bold text-sm mr-2">
              {index + 1}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
              <div className="relative w-8 h-8 bg-white border border-green-400 via-green-500 to-green-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl mb-3 shadow-2xl cursor-pointer group">
                <ProfileImage imageUrl={student.avatar ?? ""} size="w-8 h-8" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-primary-700">
                {student.name}
                {student.isCurrentUser && (
                  <span className="ml-2 text-xs bg-yellow-200 px-2 py-0.5 rounded-full font-bold">
                    You
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm font-bold text-primary-700">
              {student.points} pts
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href={"/students"}
          className="bg-primary-400 hover:bg-primary-500 w-max text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold mx-auto transition-all border-2 border-primary-400 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>See All Students</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default TopStudentsCard;
