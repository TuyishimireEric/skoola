"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  BookOpen,
  Award,
  Download,
  Smartphone,
  Monitor,
  Share,
} from "lucide-react";

// Define the PWA install prompt event interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const MascotSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop">("desktop");

  useEffect(() => {
    setIsVisible(true);

    // Detect device type
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setDeviceType(isMobile ? "mobile" : "desktop");

    // Cycle through features every 3 seconds
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallInstructions(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
    } else {
      // Show install instructions instead of alert
      setShowInstallInstructions(true);
    }
  };

  const features = [
    {
      icon: <Users className="w-6 h-6 text-yellow-500" />,
      text: "Find study buddies with similar learning goals",
      color: "bg-yellow-100 border-yellow-300",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-500" />,
      text: "Join fun virtual study rooms for group adventures",
      color: "bg-green-100 border-green-300",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      text: "Share cool notes and magical resources with friends",
      color: "bg-purple-100 border-purple-300",
    },
    {
      icon: <Award className="w-6 h-6 text-blue-500" />,
      text: "Challenge pals to friendly brain-boosting competitions",
      color: "bg-blue-100 border-blue-300",
    },
  ];

  const InstallInstructions = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-primary-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {deviceType === "mobile" ? (
              <Smartphone className="w-8 h-8 text-primary-500" />
            ) : (
              <Monitor className="w-8 h-8 text-primary-500" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-primary-500 font-comic mb-2">
            Install Ganzaa App
          </h3>
          <p className="text-primary-600 font-comic">
            Follow these simple steps to add Ganzaa to your device!
          </p>
        </div>

        {deviceType === "mobile" ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="font-bold text-blue-700">
                  iOS (iPhone/iPad)
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Share className="w-4 h-4" />
                <span className="text-sm">
                  Tap Share button → &quot;Add to Home Screen&quot;
                </span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="font-bold text-green-700">Android</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-4 h-4 flex justify-center">⋮</div>
                <span className="text-sm">
                  Tap Menu (3 dots) → &quot;Add to Home Screen&quot;
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="font-bold text-purple-700">
                  Browser Install
                </span>
              </div>
              <p className="text-sm text-purple-600">
                Look for the install icon (⊕) in your browser&apos;s address bar
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="font-bold text-indigo-700">Menu Option</span>
              </div>
              <p className="text-sm text-indigo-600">
                Or use your browser Menu → &quot;Install Ganzaa&quot;
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowInstallInstructions(false)}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-comic"
          >
            Maybe Later
          </button>
          <button
            onClick={() => setShowInstallInstructions(false)}
            className="flex-1 bg-primary-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors font-comic"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="py-16 px-8 md:py-24 md:px-16 bg-gradient-to-br from-primary-50 to-primary-200 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-16 h-16 rounded-full bg-yellow-200 opacity-40"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full bg-green-200 opacity-40"></div>
          <div className="absolute top-1/3 right-16 w-20 h-20 rounded-full bg-purple-200 opacity-40"></div>
          <div className="absolute bottom-16 right-32 w-16 h-16 rounded-full bg-blue-200 opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div
            className={`flex flex-col lg:flex-row items-center gap-8 md:gap-12 transition-opacity duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Content Section */}
            <div className="lg:w-1/2 order-2 lg:order-1 z-10">
              <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-xl border-4 border-primary-300 transform hover:scale-[1.02] transition-transform duration-300">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary-500 font-comic mb-4 md:mb-6 leading-tight">
                  Learn Better{" "}
                  <span className="text-primary-400 relative">
                    Together!
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="6"
                      viewBox="0 0 100 6"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0,5 Q25,0 50,5 T100,5"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                    </svg>
                  </span>
                </h2>

                <p className="text-lg text-primary-600 font-comic mb-8">
                  Connect with awesome classmates, form super study groups, and
                  learn together like never before! Make learning fun with
                  friends who help you grow!
                </p>

                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-300 ${
                        activeFeature === index
                          ? "transform scale-105 " + feature.color
                          : "bg-white bg-opacity-60 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                        {feature.icon}
                      </div>
                      <p className="text-primary-700 font-comic">
                        {feature.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Install Button */}
                {!isInstalled && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full md:w-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <Download className="w-6 h-6 group-hover:animate-bounce" />
                    <span className="text-base font-comic">
                      Download Ganzaa App
                    </span>
                  </button>
                )}

                {isInstalled && (
                  <div className="bg-green-100 border-2 border-green-300 text-green-700 font-comic py-3 px-6 rounded-full inline-flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ganzaa is installed on your device!
                  </div>
                )}
              </div>
            </div>

            {/* Image Section with Character */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="relative">
                {/* Chat bubbles */}
                <div className="absolute -top-6 left-4 md:left-16 z-20 transform -translate-y-full opacity-80 hidden md:block">
                  <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-primary-300 text-primary-600 font-comic">
                    Let&apos;s learn together! 🧠✨
                  </div>
                  <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-primary-300 transform rotate-45 absolute -bottom-2 left-6"></div>
                </div>

                {/* Main character image */}
                <div className="relative w-full h-64 sm:h-80 md:h-96 xl:h-[450px] transform hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-primary-300 rounded-full opacity-20 scale-90 animate-pulse"></div>
                  <Image
                    src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1746114672/Leonardo_Phoenix_10_Create_a_vibrant_and_colorful_3D_cartoon_i_0_ygzl7e.jpg"
                    alt="Cartoon Kids Learning Together"
                    fill
                    className="object-contain z-10 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Install Instructions Modal */}
      {showInstallInstructions && <InstallInstructions />}
    </>
  );
};
