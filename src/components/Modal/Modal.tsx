import { X } from "lucide-react";
import React, { ReactNode, MouseEvent } from "react";

type ModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  position?: "center" | "top" | "bottom";
  showCloseButton?: boolean;
  overlayColor?: string;
  animation?: boolean;
  closeOnOverlayClick?: boolean;
  title?: string;
  subTitle?: string;
  customHeader?: ReactNode;
  logo?: boolean;
  theme?: "default" | "playful" | "professional";
  headerIcon?: string;
  confetti?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  isOpen = false,
  onClose = () => {},
  children,
  size = "md",
  position = "center",
  showCloseButton = true,
  overlayColor = "rgba(0, 0, 0, 0.3)",
  animation = true,
  closeOnOverlayClick = true,
  title = "",
  customHeader,
  theme = "default",
  confetti = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: "max-w-[400px]",
    md: "max-w-[600px]",
    lg: "max-w-[800px]",
    xl: "max-w-[1000px]",
    "2xl": "max-w-[1200px]",
    full: "max-w-full",
  };

  const positionClasses: Record<string, string> = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-20",
    bottom: "items-end justify-center pb-20",
  };

  const themeClasses: Record<string, { header: string; border: string }> = {
    default: {
      header: "bg-gradient-to-r from-primary-200 to-primary-300",
      border: "border-primary-100",
    },
    playful: {
      header: "bg-gradient-to-r from-orange-100 to-amber-200",
      border: "border-amber-200",
    },
    professional: {
      header: "bg-gradient-to-r from-gray-100 to-gray-200",
      border: "border-gray-100",
    },
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const renderEmoji = () => {
    const emojis = ["✨", "🎊", "☁️", "🎨", "🚀", "🌟", "🎭", "🎮"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div
      className={`fixed inset-0 flex ${
        positionClasses[position]
      } z-[100] backdrop-blur-sm ${animation ? "animate-fadeIn" : ""}`}
      onClick={handleOverlayClick}
      style={{ backgroundColor: overlayColor }}
    >
      <div
        className={`relative bg-background border-[12px] ${
          themeClasses[theme].border
        } rounded-[32px] shadow-xl mx-4 transition-all duration-200 ${
          size === "2xl" ? "w-full md:w-[90vw] lg:w-[80vw]" : "w-full"
        } ${sizeClasses[size]} ${
          animation ? "animate-scaleIn" : ""
        } max-h-[100vh] flex flex-col overflow-hidden z-[110]`}
        role="dialog"
        aria-modal="true"
      >
        {customHeader ? (
          <div className="relative pt-14 pb-4 px-8 header-soft">
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute z-[120] hover:scale-105 cursor-pointer top-4 right-4 w-10 h-10 bg-white hover:bg-primary-50 rounded-full flex items-center justify-center text-primary-400 transition-all duration-300 shadow-md border-2 border-primary-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="header-pattern-soft"></div>
            </div>
            {customHeader}
          </div>
        ) : (
          <div
            className={`relative pt-14 pb-6 px-8 ${themeClasses[theme].header}`}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute z-[120] hover:scale-105 cursor-pointer top-4 right-4 w-10 h-10 bg-white hover:bg-primary-50 rounded-full flex items-center justify-center text-primary-400 transition-all duration-300 shadow-md border-2 border-primary-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="header-pattern-enhanced"></div>

              {/* Add subtle animated shapes */}
              <div className="absolute left-[10%] top-[30%] w-12 h-12 rounded-full bg-white opacity-20 animate-float-gentle"></div>
              <div className="absolute right-[15%] top-[40%] w-8 h-8 rounded-full bg-white opacity-20 animate-float-gentle-delay"></div>
              <div className="absolute left-[30%] bottom-[20%] w-10 h-10 rounded-full bg-white opacity-20 animate-float-gentle-delay-2"></div>
            </div>

            <div className="z-[115] relative">
              {/* Logo positioned at the top center */}

              <div className="text-center relative">
                <h2 className="text-2xl font-comic font-bold text-primary-700 mb-2">
                  {confetti && (
                    <span className="inline-block mr-2 animate-bounce">🎉</span>
                  )}
                  {title}
                  {confetti && (
                    <span className="inline-block ml-2 animate-bounce delay-100">
                      🎉
                    </span>
                  )}
                </h2>

                {/* Header decoration - enhanced wavy border */}
                <div className="absolute -bottom-8 left-0 w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 120"
                    className="w-full h-6"
                  >
                    <path
                      fill="#FFFFFF"
                      d="M0,64 C180,32 360,16 540,16 C720,16 900,32 1080,48 C1260,64 1350,64 1440,64 L1440,120 L0,120 Z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white h-max flex-grow p-4 overflow-x-hidden rounded-b-3xl relative z-[115]">
          {children}
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute -bottom-2 -left-2 text-4xl rotate-6 animate-float-gentle opacity-80">
          {renderEmoji()}
        </div>
        <div className="absolute -bottom-2 -right-2 text-4xl -rotate-6 animate-float-gentle-delay opacity-80">
          {renderEmoji()}
        </div>
      </div>
    </div>
  );
};

export default Modal;