import { SubjectPerformance } from "@/types/dashboard";
import { KidProfileDataI } from "@/types/Student";
import { motion } from "framer-motion";
import { Beaker, BookOpen, Calculator } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Calculate dynamic Y-axis domain with equal intervals for percentage data
const calculateYAxisDomain = (data: SubjectPerformance[] | null) => {
  if (!data || data.length === 0) return [0, 100];

  let maxScore = 0;

  // Find the maximum score across all subjects and students
  data.forEach((student) => {
    maxScore = Math.max(
      maxScore,
      student.mathematics,
      student.english,
      student.sciences
    );
  });

  // Auto-adjust the maximum with some padding
  const paddedMax = Math.ceil(maxScore * 1.1); // Add 10% padding

  // Determine the best interval and maximum
  let finalMax;

  if (paddedMax <= 50) {
    finalMax = 50; // 0, 10, 20, 30, 40, 50
  } else if (paddedMax <= 80) {
    finalMax = 80; // 0, 20, 40, 60, 80
  } else {
    finalMax = 100; // 0, 25, 50, 75, 100
  }

  return [0, finalMax];
};

// Process subject performance data for chart
const processSubjectData = (
  subjectPerformance: SubjectPerformance[] | null
) => {
  if (!subjectPerformance || subjectPerformance.length === 0) return [];

  // Transform data for bar chart
  const chartData = [
    {
      subject: "Mathematics",
      ...Object.fromEntries(
        subjectPerformance.map((s) => [s.studentName, s.mathematics])
      ),
    },
    {
      subject: "English",
      ...Object.fromEntries(
        subjectPerformance.map((s) => [s.studentName, s.english])
      ),
    },
    {
      subject: "Sciences",
      ...Object.fromEntries(
        subjectPerformance.map((s) => [s.studentName, s.sciences])
      ),
    },
  ];

  return chartData;
};

// Subject Performance Comparison Component
const SubjectPerformanceChart = ({
  subjectPerformance,
  students,
  filter,
  isLoading = false,
}: {
  subjectPerformance: SubjectPerformance[] | null;
  students: KidProfileDataI[];
  filter: string;
  isLoading?: boolean;
}) => {
  const chartData = processSubjectData(subjectPerformance);
  const yAxisDomain = calculateYAxisDomain(subjectPerformance);
  const colors = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"];

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <motion.div
            className="absolute top-4 right-4 text-4xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            📚
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800">
                Subject Performance Comparison
              </h3>
              <p className="text-purple-600 font-bold text-sm">
                Loading performance data...
              </p>
            </div>
          </div>

          {/* Subject Icons Legend Skeleton */}
          <div className="flex justify-center gap-6 mb-6">
            {[Calculator, BookOpen, Beaker].map((Icon, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-400" />
                <motion.div
                  className="w-16 h-4 bg-gray-200 rounded"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="h-80">
            <div className="w-full h-full flex flex-col justify-between p-4">
              {/* Chart skeleton */}
              <div className="flex justify-between h-full">
                <div className="flex flex-col justify-between">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-8 h-3 bg-gray-200 rounded"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>

                <div className="flex-1 ml-4 flex items-end justify-around gap-4 pb-8">
                  {/* Bar skeleton */}
                  {[...Array(3)].map((_, subjectIndex) => (
                    <div key={subjectIndex} className="flex gap-2">
                      {[...Array(3)].map((_, studentIndex) => (
                        <motion.div
                          key={studentIndex}
                          className="w-8 bg-gray-200 rounded-t"
                          style={{ height: `${60 + studentIndex * 20}px` }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: subjectIndex * 0.3 + studentIndex * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* X-axis skeleton */}
              <div className="flex justify-around mt-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-16 h-3 bg-gray-200 rounded"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Performance cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-white border-2 border-gray-200 rounded-xl p-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                <div className="w-20 h-4 bg-gray-200 rounded mx-auto mb-3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="w-12 h-3 bg-gray-200 rounded" />
                      <div className="w-8 h-3 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Show empty state if no data or no students
  if (!subjectPerformance || students.length === 0) {
    return (
      <motion.div
        className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800">
                Subject Performance Comparison
              </h3>
              <p className="text-gray-600 font-bold text-sm">
                No performance data available ({filter})
              </p>
            </div>
          </div>

          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                📊
              </motion.div>
              <h4 className="text-lg font-bold text-gray-700 mb-2">
                No Performance Data Available
              </h4>
              <p className="text-gray-500 text-sm">
                {!subjectPerformance
                  ? "Subject performance data is not yet available"
                  : "No students found to display performance"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div
          className="absolute top-4 right-4 text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          📚
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800">
              Subject Performance Comparison
            </h3>
            <p className="text-purple-600 font-bold text-sm">
              Performance across core subjects for the selected period ({filter}
              )
            </p>
          </div>
        </div>

        {/* Subject Icons Legend */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-700">Mathematics</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-gray-700">English</span>
          </div>
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-gray-700">Sciences</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 12, fontWeight: "bold" }}
                axisLine={{ stroke: "#9ca3af" }}
              />
              <YAxis
                domain={yAxisDomain}
                tick={{ fontSize: 12, fontWeight: "bold" }}
                axisLine={{ stroke: "#9ca3af" }}
                label={{ value: "Score %", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
              <Legend />

              {students.map((student, index) => (
                <Bar
                  key={student.id}
                  dataKey={student.name}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Performance Cards */}
        {subjectPerformance && subjectPerformance.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {subjectPerformance.map((student) => (
              <motion.div
                key={student.studentId}
                className="bg-white border-2 border-gray-200 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="font-black text-gray-800 mb-3 text-center">
                  {student.studentName}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold">Math</span>
                    </div>
                    <span className="text-sm font-black text-gray-800">
                      {student.mathematics}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold">English</span>
                    </div>
                    <span className="text-sm font-black text-gray-800">
                      {student.english}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Beaker className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-bold">Science</span>
                    </div>
                    <span className="text-sm font-black text-gray-800">
                      {student.sciences}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubjectPerformanceChart;
