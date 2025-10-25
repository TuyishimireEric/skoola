"use client";

import { DailyStarProgress } from "@/types/dashboard";
import { KidProfileDataI } from "@/types/Student";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressDataPoint {
  date: string;
  fullDate: string;
  [studentName: string]: number | string;
}

const processProgressData = (
  dailyProgress: DailyStarProgress,
  students: KidProfileDataI[],
  filter: string
) => {
  const getDaysFromFilter = (filter: string) => {
    switch (filter) {
      case "7d":
        return 7;
      case "30d":
      case "last_month":
        return 30;
      default:
        return 7;
    }
  };

  const days = getDaysFromFilter(filter);
  const today = new Date();
  const dates = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }

  return dates.map((date) => {
    const dateKey = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dataPoint: ProgressDataPoint = {
      date: displayDate,
      fullDate: dateKey,
    };

    students.forEach((student) => {
      dataPoint[student.name] = dailyProgress[dateKey]?.[student.name] || 0;
    });

    return dataPoint;
  });
};

const calculateYAxisDomain = (
  data: ProgressDataPoint[],
  students: KidProfileDataI[]
) => {
  let maxStars = 0;
  data.forEach((dataPoint) => {
    students.forEach((student) => {
      const stars = Number(dataPoint[student.name]) || 0;
      maxStars = Math.max(maxStars, stars);
    });
  });

  if (maxStars === 0) return [0, 12];

  const paddedMax = Math.ceil(maxStars * 1.2);

  let finalMax;

  if (paddedMax <= 12) {
    finalMax = 12;
  } else if (paddedMax <= 40) {
    finalMax = Math.ceil(paddedMax / 10) * 10;
  } else if (paddedMax <= 60) {
    finalMax = Math.ceil(paddedMax / 15) * 15;
  } else if (paddedMax <= 80) {
    finalMax = Math.ceil(paddedMax / 20) * 20;
  } else {
    finalMax = Math.ceil(paddedMax / 25) * 25;
  }

  return [0, finalMax];
};

const chartColors = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"];

const SkeletonChart = () => {
  const days = 7;
  const yLabels = [12, 9, 6, 3, 0];
  const width = 100 / (days - 1);

  return (
    <div className="relative w-full h-80 overflow-hidden px-2 pt-2">
      {/* Grid lines and Y labels */}
      {yLabels.map((label, index) => (
        <div
          key={index}
          className="absolute w-full border-t border-dashed border-gray-300 text-gray-400 text-xs"
          style={{ top: `${(index / (yLabels.length - 1)) * 100}%` }}
        >
          <span className="absolute left-0 -translate-y-1/2">{label}</span>
        </div>
      ))}

      {/* X-axis dots and lines */}
      {[...Array(days)].map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 text-center text-gray-400 text-xs"
          style={{ left: `${i * width}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mb-1" />
          <div className="w-12 h-2 bg-gray-200 rounded" />
        </div>
      ))}

      {/* Wavy skeleton lines mimicking chart data */}
      {[...Array(3)].map((_, lineIndex) => (
        <motion.svg
          key={lineIndex}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d={`M0,${50 + lineIndex * 5} C25,${40 + lineIndex * 5} 75,${
              60 - lineIndex * 5
            } 100,${50 + lineIndex * 5}`}
            stroke={chartColors[lineIndex]}
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            animate={{
              strokeDashoffset: [0, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              strokeDashoffset: {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                delay: lineIndex * 0.3,
              },
            }}
          />
        </motion.svg>
      ))}
    </div>
  );
};

const StudentsProgressChart = ({
  dailyProgress,
  students,
  filter,
  isLoading = false,
}: {
  dailyProgress: DailyStarProgress | null;
  students: KidProfileDataI[];
  filter: string;
  isLoading?: boolean;
}) => {
  const progressData = dailyProgress
    ? processProgressData(dailyProgress, students, filter)
    : [];
  const yAxisDomain = dailyProgress
    ? calculateYAxisDomain(progressData, students)
    : [0, 12];

  const hasNoData = !dailyProgress || students.length === 0;

  return (
    <motion.div
      className={`bg-gradient-to-br ${
        hasNoData ? "from-gray-50 to-gray-100" : "from-blue-50 to-indigo-50"
      } border-2 rounded-2xl p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div
          className="absolute top-4 right-4 text-4xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ⭐
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${
              hasNoData
                ? "bg-gradient-to-br from-gray-400 to-gray-500"
                : "bg-gradient-to-br from-blue-500 to-indigo-500"
            }`}
          >
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800">
              Daily Stars Progress
            </h3>
            <p
              className={`text-sm font-bold ${
                hasNoData ? "text-gray-600" : "text-blue-600"
              }`}
            >
              {hasNoData
                ? `No progress data available (${filter})`
                : `Stars earned daily over the selected period (${filter})`}
            </p>
          </div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <SkeletonChart />
          ) : hasNoData ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📊
                </motion.div>
                <h4 className="text-lg font-bold text-gray-700 mb-2">
                  No Data Available
                </h4>
                <p className="text-gray-500 text-sm">
                  {!dailyProgress
                    ? "Progress data is not yet available"
                    : "No students found to display progress"}
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fontWeight: "bold" }}
                  axisLine={{ stroke: "#9ca3af" }}
                />
                <YAxis
                  domain={yAxisDomain}
                  tick={{ fontSize: 12, fontWeight: "bold" }}
                  axisLine={{ stroke: "#9ca3af" }}
                  label={{
                    value: "Stars Earned",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontWeight: "bold",
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value, name) => [`${value} stars`, name]}
                />
                <Legend />
                {students.map((student, index) => (
                  <Line
                    key={student.id}
                    type="monotone"
                    dataKey={student.name}
                    stroke={chartColors[index % chartColors.length]}
                    strokeWidth={3}
                    dot={{
                      fill: chartColors[index % chartColors.length],
                      strokeWidth: 2,
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                      stroke: chartColors[index % chartColors.length],
                      strokeWidth: 2,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentsProgressChart;
