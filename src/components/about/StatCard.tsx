import { motion } from "framer-motion";

// Optimized stats component
type HeroStat = {
  value: string;
  label: string;
  icon: string;
};

interface StatCardProps {
  stat: HeroStat;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          delay: 1.6 + index * 0.1,
          type: "spring",
        },
      },
    }}
    className="text-center"
  >
    <motion.div
      whileHover={{ scale: 1.2, rotate: 5 }}
      className="text-3xl sm:text-4xl mb-1"
      role="img"
      aria-label={stat.label}
    >
      {stat.icon}
    </motion.div>
    <p className="text-2xl sm:text-3xl font-black text-primary-700 font-comic">
      {stat.value}
    </p>
    <p className="text-xs sm:text-sm text-primary-500 font-comic font-medium">
      {stat.label}
    </p>
  </motion.div>
);

export default StatCard;
