"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import dynamic from "next/dynamic";
import Alert, { AlertType } from "@/components/alerts/Alert";
import { useRouter } from "next/navigation";
import Loading from "@/components/loader/Loading";
import showToast from "@/utils/showToast";
import Link from "next/link";
import Image from "next/image";

const FcGoogle = dynamic(() =>
  import("react-icons/fc").then((mod) => mod.FcGoogle)
);

export default function AuthModal() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loginCredential, setLoginCredential] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setError] = useState<{
    target: string;
    msg: string;
  } | null>(null);

  const handleOAuthLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { redirect: true, callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google login failed:", error);
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (name.trim().length === 0) {
      setError({ target: "name", msg: "Please add your name!" });
      return;
    }

    if (loginCredential.trim().length === 0) {
      setError({
        target: "credential",
        msg: "Please enter your magic code or password!",
      });
      return;
    }

    setIsLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      UserName: name,
      Password: loginCredential,
    });

    if (res?.ok) {
      showToast("Let's start learning!", "success");
      router.push("/dashboard");
    } else {
      showToast("Oops! Try again", "error");
      setError({
        target: "login",
        msg: "That didn't work. Check your code or password!",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-b from-amber-50 to-green-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 animate__animated animate__bounceIn">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 relative mb-2">
            <Image
              src="/Logo.png"
              alt="Ganzaa logo"
              width={80}
              height={80}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-3xl font-bold text-primary-500 font-comic text-center">
            Welcome to Ganzaa!
          </h1>
          <p className="text-lg text-gray-600 font-comic text-center mt-2">
            Let&apos;s go on a learning adventure!
          </p>
        </div>

        {/* Form Fields with Fun Design */}
        <div className="space-y-5">
          {/* Name Input */}
          <div className="relative">
            <label
              htmlFor="nameInput"
              className="text-xl font-comic font-bold text-primary-500 mb-2 flex items-center"
            >
              <span className="mr-2">👋</span> Your Name:
            </label>
            <input
              id="nameInput"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="What should we call you?"
              className="w-full px-5 py-3 text-lg border-4 border-primary-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500 placeholder:text-gray-400 font-comic"
            />
            {errorMessage?.target === "name" && (
              <div className="mt-2">
                <Alert
                  alertType={AlertType.DANGER}
                  title={errorMessage.msg}
                  close={() => setError(null)}
                  timeOut={2000}
                />
              </div>
            )}
          </div>

          {/* Credential Input (Magic Code or Password) */}
          <div className="relative">
            <label
              htmlFor="credentialInput"
              className="text-xl font-comic font-bold text-primary-500 mb-2 flex items-center"
            >
              <span className="mr-2">🔑</span> Your Magic Code:
            </label>
            <input
              id="credentialInput"
              type={loginCredential.length > 3 ? "password" : "text"}
              value={loginCredential}
              onChange={(e) => {
                setLoginCredential(e.target.value);
                setError(null);
              }}
              placeholder="Enter your code or password"
              className="w-full px-5 py-3 text-lg border-4 border-primary-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500 placeholder:text-gray-400 font-comic"
            />
            <p className="text-xs text-gray-500 font-comic mt-1 ml-2">
              Students: Use your 3-digit code | Teachers: Use your password
            </p>
            {errorMessage?.target === "credential" && (
              <div className="mt-2">
                <Alert
                  alertType={AlertType.DANGER}
                  title={errorMessage.msg}
                  close={() => setError(null)}
                  timeOut={2000}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage?.target === "login" && (
          <div className="mt-4">
            <Alert
              alertType={AlertType.DANGER}
              title={errorMessage.msg}
              close={() => setError(null)}
              timeOut={2000}
            />
          </div>
        )}

        {/* Login Buttons */}
        <div className="flex flex-col items-center w-full gap-3 mt-6">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold text-xl font-comic transition-all duration-200"
          >
            {isLoading ? (
              <Loading fullScreen={false} overlay={false} size="xs" />
            ) : (
              <>
                <span>Start Learning! </span>
                <span className="text-2xl">🚀</span>
              </>
            )}
          </button>

          <button
            onClick={handleOAuthLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-2xl font-bold text-lg font-comic transition-all duration-200"
          >
            {isGoogleLoading ? (
              <Loading fullScreen={false} overlay={false} size="xs" />
            ) : (
              <>
                <FcGoogle size={24} />
                <span>Login with Google</span>
              </>
            )}
          </button>

          <Link
            href="/"
            className="mt-3 text-primary-500 font-comic hover:underline flex items-center"
          >
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Animated Decoration */}
        <div className="flex justify-between mt-6">
          <div className="w-12 h-12 relative animate-bounce">
            <Image
              src="/balloon.svg"
              alt="decoration"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="w-12 h-12 relative animate-pulse">
            <Image
              src="/star.svg"
              alt="decoration"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
