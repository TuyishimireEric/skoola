import { motion } from "framer-motion";

// Quick Stats Card Component
type QuickStatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: number;
};

const QuickStatCard = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  trend,
}: QuickStatCardProps) => (
  <motion.div
    className={`${bgColor} border-2 ${color} rounded-2xl p-4 relative overflow-hidden`}
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    {/* Background decoration */}
    <div className="absolute top-0 right-0 opacity-10">
      <Icon className="w-16 h-16" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 ${bgColor} rounded-xl`}>
          <Icon className={`w-5 h-5 ${color.replace("border-", "text-")}`} />
        </div>
        <span
          className={`text-xs font-black ${color.replace("border-", "text-")}`}
        >
          {label}
        </span>
      </div>

      <motion.p
        className="text-2xl font-black text-gray-800 mb-1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {value}
      </motion.p>

      {trend && (
        <div
          className={`text-xs font-bold ${
            trend > 0
              ? "text-green-600 bg-green-100"
              : "text-red-600 bg-red-100"
          } px-2 py-1 rounded-full inline-block`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </div>
      )}
    </div>
  </motion.div>
);

export default QuickStatCard;
