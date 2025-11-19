"use client";

import { LoginForm } from "./LoginForm";
import { motion } from "framer-motion";
import RegisterFrom from "./RegisterForm";
import { useRouter } from "next/navigation";
import { useClientSession } from "@/hooks/user/useClientSession";

interface LoginProps {
  onClose?: () => void;
}

export const Login = ({ onClose }: LoginProps) => {
  const isLogin = true;
  const { userRoleId } = useClientSession();

  const router = useRouter();

  const handleClose = () => {
    if (onClose) onClose();
    if (!onClose) {
      if (userRoleId === 2) {
        router.push("/dashboard/kids");
      } else if (userRoleId === 6) {
        router.push("/dashboard/parent");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className=" w-full flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative min-h-[400px] lg:min-h-0">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-primary-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-300 rounded-full opacity-15 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative  z-10 w-full lg:max-w-6xl mx-auto"
      >
        <div className="backdrop-blur-xl rounded-2xl lg:rounded-3xl transition-all duration-500">
          {/* Form Content with Animation */}
          <div className="relative overflow-hidden">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLogin ? (
                <LoginForm onClose={handleClose} showForm={true} />
              ) : (
                <RegisterFrom onClose={handleClose} />
              )}
            </motion.div>
          </div>

          {/* Terms and Privacy */}
          <p className="mt-2 text-xs text-center text-primary-400 font-comic">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary-500 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Fun decoration elements */}
      </motion.div>
    </div>
  );
};
