import { FormEvent, useState, useEffect, useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { Input } from "../form/Input";
import { signIn } from "next-auth/react";
import { LoginFormI } from "@/types";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { VerifiedSuccess } from "./VerifiedSuccess";
import { ForgotPasswordForm } from "./ForgotPassword";

interface LoginFormProps {
  onClose: () => void;
  showForm?: boolean;
}

export const LoginForm = ({ onClose, showForm }: LoginFormProps) => {
  const [formState, setFormState] = useState<LoginFormI>({
    username: "",
    password: "",
    email: "",
  });

  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const [verifyUser, setVerifyUser] = useState<string | null>(null);
  const [verified, setVerified] = useState<number | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [animationClass, setAnimationClass] =
    useState<string>("animate__fadeIn");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState({
      username: "",
      password: "",
      email: "",
    });
    setErrorMessage("");
    setIsLogin(true);
    setAnimationClass("animate__fadeIn");
  }, []);

  useEffect(() => {
    if (showForm) {
      resetForm();
    }
  }, [showForm, resetForm]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Use username field as the identifier (email or username)
    const { email, password } = formState;

    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      setIsLoading(false);
      return;
    }

    if (password.length < 3) {
      setErrorMessage("Password must be at least 3 characters");
      setIsLoading(false);
      return;
    }

    try {
      const credentials = {
        identifier: email.trim(),
        password: password,
        authType: "regular",
      };

      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        const err = result.error.split(":")[0];
        const userId = result.error.split(":")[1];

        if (err === "CredentialsSignin") {
          setErrorMessage(
            "Invalid email/username or password. Please try again!"
          );
        } else if (err === "Not verified. Please verify") {
          setVerifyUser(userId);
          setErrorMessage("Not verified. Please verify email!");
        } else {
          setErrorMessage(err);
        }

        setTimeout(() => setErrorMessage(""), 3000);
      } else if (result?.ok) {
        onClose();
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(
        (error as Error).message ||
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Google login failed:", error);
      setErrorMessage("Google login failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const isPasswordValid = formState.password.length >= 3;
  const isEmailValid = formState.email.length > 0;

  const canSubmit = isEmailValid && isPasswordValid && !isLoading;

  const handleVerified = (st: number) => {
    setVerified(st);
    onClose();
  };

  return (
    <div className="p-2 w-full rounded-lg overflow-hidden">
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-xl text-red-600 font-comic text-center animate__animated animate__shakeX">
          {errorMessage}
        </div>
      )}

      {forgotPassword ? (
        <ForgotPasswordForm
          onClose={onClose}
          onBackToLogin={() => setForgotPassword(false)}
        />
      ) : verifyUser ? (
        <VerifyEmailForm
          userId={verifyUser}
          email={formState.email}
          password={formState.password}
          onClose={onClose}
          setCurrentStep={handleVerified}
        />
      ) : verified ? (
        <VerifiedSuccess onClose={onClose} />
      ) : (
        <>
          <div
            className={`mb-6 transition-all duration-1000 ${
              showForm
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="text-center mb-6">
              <h2
                className="text-2xl sm:text-3xl font-bold font-comic"
                style={{
                  background:
                    "linear-gradient(to right, var(--primary-700), var(--primary-800))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome Back
              </h2>
              <p
                className="font-comic"
                style={{ color: "var(--primary-600)" }}
              >
                Ready to start your learning journey?
              </p>
            </div>
          </div>

          {/* Auth Form */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-2 animate__animated ${animationClass}`}
          >
            {isLogin && (
              <>
                <Input
                  label="Your Email / UserName"
                  name="email"
                  value={formState.email || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your Email / UserName"
                  icon="👋"
                  valid={isEmailValid}
                  errorMessage={
                    !isEmailValid ? "Email or username is required" : ""
                  }
                  required
                />
                <Input
                  label={"Your Password"}
                  type="password"
                  name="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  placeholder={"Enter your password"}
                  icon="🔑"
                  valid={isPasswordValid}
                  errorMessage={
                    !isPasswordValid && formState.password
                      ? "Password must be at least 3 characters"
                      : ""
                  }
                  required
                />

                <div className="flex justify-end animate__animated animate__fadeIn -mt-4">
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-primary-600 hover:text-primary-800 font-comic text-sm"
                  >
                    Forgot your password? 🤔
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full relative py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-3xl mt-2 font-comic text-base shadow-lg transition-all border-3 border-primary-300 flex items-center justify-center gap-2 transform animate__animated animate__pulse
                  ${
                    canSubmit
                      ? "hover:bg-primary-400 hover:opacity-80"
                      : "opacity-70 cursor-not-allowed"
                  }`}
            >
              {isLoading ? <>{"Logging in..."}</> : <>{"Continue! 🚀"}</>}
            </button>

            <div className="flex items-center justify-center space-x-1">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "var(--primary-300)" }}
              ></div>
              <span
                className="text-sm font-comic"
                style={{ color: "var(--primary-500)" }}
              >
                or
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "var(--primary-300)" }}
              ></div>
            </div>

            <button
              type="button"
              onClick={handleOAuthLogin}
              disabled={isGoogleLoading}
              className="w-full relative p-2 border-2 border-primary-300 rounded-full bg-white/70  text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 hover:bg-primary-100 transition-all font-comic flex items-center justify-center gap-2 animate__animated animate__bounceIn"
            >
              {isGoogleLoading ? (
                <>
                  <span className="animate-pulse">Please wait...</span>
                </>
              ) : (
                <>
                  <FcGoogle size={18} />
                  <span>{"Continue with Google"}</span>
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
