import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Login } from "./Login";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginModal = ({
  isOpen,
  onClose,
}: LoginModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className=" absolute z-20  w-full sm:max-w-2xl md:max-w-2xl mx-auto">
            <Login onClose={onClose} />
          </div>
          {/* Modal */}
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
