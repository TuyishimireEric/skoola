import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const KidsTimer = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  return (
    <div className="bg-gradient-to-r from-primary-300 to-primary-400 rounded-3xl p-6 border-4 border-primary-100 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white bg-opacity-30">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Clock className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        <div>
          <p className="text-lg text-white font-bold">Current Time</p>
          <p className="text-3xl font-extrabold text-white">
            {hours.toString().padStart(2, "0")}:
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KidsTimer;
