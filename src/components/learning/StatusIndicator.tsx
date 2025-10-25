import { motion } from "framer-motion";

interface StatusIndicatorProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  total?: number;
  borderColor: string;
}

const StatusIndicator = ({
  icon: Icon,
  value,
  label,
  color,
  borderColor,
  total,
}: StatusIndicatorProps) => (
  <motion.div
    initial={{ scale: 0.9, rotate: -3 }}
    animate={{
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    }}
    whileHover={{
      scale: 1.05,
      rotate: 2,
      transition: { duration: 0.2 },
    }}
  >
    <div
      className={`
        flex items-center bg-white 
        border-2 sm:border-3 md:border-8 ${borderColor} 
        px-2 sm:px-4 md:px-4 py-1 sm:py-2 md:py-2 rounded-full 
        backdrop-blur-sm 
        bg-opacity-95
        hover:shadow-[0_12px_20px_-6px_rgba(0,0,0,0.12),0_8px_12px_-3px_rgba(0,0,0,0.08)]
        transition-shadow duration-300
      `}
    >
      <div className="relative group bg-primary-100 rounded-full p-2 sm:p-3 md:p-4">
        <div className="absolute inset-0 animate-pulse opacity-75" />
        <Icon
          className={`${color} text-sm  relative transform group-hover:rotate-12 transition-transform duration-300`}
        />
      </div>
      <div className="mx-2 sm:mx-3 md:mx-4 flex flex-col -gap-1"> 
        <span className="hidden md:block text-xs sm:text-sm text-primary-400 uppercase tracking-wider font-bold ">
          {label}
        </span>
        <span className="text-lg sm:text-2xl md:text-2xl font-black text-primary-500 tracking-tight">
          {value}{total ? `/${total}` : ""}
        </span>
      </div>
    </div>
  </motion.div>
);

export default StatusIndicator;