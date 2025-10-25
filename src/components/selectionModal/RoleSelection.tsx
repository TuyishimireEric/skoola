import React from "react";
import { Sparkles, Rocket, Award, Palette, Music } from "lucide-react";
import { PiStudentFill } from "react-icons/pi";
import { RiParentLine } from "react-icons/ri";

interface RoleSelectionProps {
  handleRoleSelect: (role: number) => void;
}

export const RenderRoleSelection = ({
  handleRoleSelect,
}: RoleSelectionProps) => {
  return (
    <div className=" rounded-3xl shadow-xl w-full overflow-hidden transform transition-all font-comic">
      <div className="px-8 py-10 flex flex-col items-center relative">
        {/* Decorative elements */}
        <div className="absolute top-2 left-2">
          <Palette className="h-6 w-6 text-pink-400" />
        </div>
        <div className="absolute top-2 right-2">
          <Music className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="absolute bottom-2 left-2">
          <Rocket className="h-6 w-6 text-orange-400" />
        </div>
        <div className="absolute bottom-2 right-2">
          <Award className="h-6 w-6 text-green-400" />
        </div>

        <div className="flex justify-center gap-10 w-full">
          <div
            onClick={() => handleRoleSelect(2)}
            className={`w-1/3 cursor-pointer group relative p-8 bg-white rounded-3xl border-4 border-yellow-300 shadow-lg overflow-hidden font-comic transform transition-all duration-300 hover:translate-y-2 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          >
            <div className="absolute top-0 right-0 bg-yellow-400 px-3 py-1 rounded-bl-lg text-xs font-bold text-white">
              FOR KIDS
            </div>

            <div className="flex flex-col items-center">
              <div
                className={` mb-4 text-4xl bg-yellow-100 p-4 rounded-full transition-all duration-300 hover:bg-yellow-200 hover:rotate-12`}
              >
                <PiStudentFill className="text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800 transition-colors">
                Student
              </h3>
              <p className="mt-2 text-sm text-amber-600 text-center">
                Start your learning adventure!
              </p>
            </div>
          </div>

          <div
            onClick={() => handleRoleSelect(6)}
            className={` w-1/3 cursor-pointer group relative p-8 bg-white rounded-3xl border-4 border-blue-300 shadow-lg 
                   overflow-hidden font-comic transform transition-all duration-300  hover:translate-y-2 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 `}
          >
            <div className="absolute top-0 right-0 bg-blue-400 px-3 py-1 rounded-bl-lg text-xs font-bold text-white">
              FOR PARENTS
            </div>

            <div className="flex flex-col items-center">
              <div
                className={` mb-4 text-4xl bg-blue-100 p-4 rounded-full transition-all duration-300 hover:bg-blue-200 hover:rotate-12 `}
              >
                <RiParentLine className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 transition-colors">
                Parent
              </h3>
              <p className="mt-2 text-sm text-blue-600 text-center">
                Set up your child&apos;s journey
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 border-t border-indigo-200 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500 animate-pulse" />
          <p className="text-indigo-800 font-medium">
            Begin your magical learning journey today!
          </p>
          <Sparkles size={16} className="text-indigo-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
