import { AnalyticsFilter } from "@/types/dashboard";
import { motion } from "framer-motion";

// Filter Component
const ChartFilters = ({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: AnalyticsFilter) => void;
}) => {
  const filters = [
    { id: "7d", label: "7 Days", icon: "📅" },
    { id: "30d", label: "30 Days", icon: "📊" },
    { id: "last_month", label: "Last Month", icon: "📆" },
  ];

  return (
    <motion.div
      className="flex flex-wrap gap-3 justify-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id as AnalyticsFilter)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg border-2 ${
            activeFilter === filter.id
              ? "bg-gradient-to-r from-orange-400 to-red-400 text-white border-orange-300 shadow-orange-200"
              : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-300 hover:from-orange-50 hover:to-yellow-50 hover:border-orange-200"
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">{filter.icon}</span>
          <span>{filter.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default ChartFilters;
