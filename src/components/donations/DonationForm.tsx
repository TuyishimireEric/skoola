import { motion } from "framer-motion";
import { Shield, ArrowRight, CreditCard, Globe, Clock } from "lucide-react";
import { useState } from "react";
import { useClientSession } from "@/hooks/user/useClientSession";
import { Input } from "../form/Input";

const DonationForm = () => {
  const { userName, userEmail } = useClientSession();
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState("one-time");
  const [showIntegrationMessage, setShowIntegrationMessage] = useState(false);

  const [donorInfo, setDonorInfo] = useState({
    name: userName || "",
    email: userEmail || "",
    message: "",
    anonymous: false,
  });

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    setSelectedAmount(0);
  };

  const handleInputChange = (e: {
    target: { name: string; value: string | boolean };
  }) => {
    const { name, value } = e.target;
    setDonorInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowIntegrationMessage(true);
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(donorInfo.email);

  if (showIntegrationMessage) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border-3 border-primary-100 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-primary-100 to-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <CreditCard className="w-10 h-10 text-primary-600" />
              </motion.div>

              <h2 className="text-3xl font-bold font-comic text-primary-700 mb-4">
                Thank You for Your Support!
              </h2>

              <div className="bg-gradient-to-r from-primary-50 to-yellow-50 rounded-2xl p-6 border-2 border-primary-200 mb-6">
                <p className="text-primary-700 font-comic text-lg mb-4">
                  Your donation of{" "}
                  <span className="font-bold">${finalAmount.toFixed(2)}</span>{" "}
                  has been registered.
                </p>
                <div className="flex items-center justify-center gap-2 text-primary-600 font-comic">
                  <Clock className="w-5 h-5" />
                  <span>Payment Integration In Progress</span>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Globe className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-comic font-semibold text-primary-700 mb-1">
                      International Payment Processing Coming Soon
                    </h3>
                    <p className="text-primary-600 font-comic text-sm">
                      We are currently integrating with international payment
                      systems to accept VISA, Mastercard, and other major credit
                      cards. This will enable supporters from around the world
                      to contribute to our mission.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-comic font-semibold text-primary-700 mb-1">
                      Bank Transfer Option Available
                    </h3>
                    <p className="text-primary-600 font-comic text-sm">
                      While we complete our payment integration, you can still
                      support us through direct bank transfers. Our team will
                      contact you at{" "}
                      <span className="font-semibold">{donorInfo.email}</span>{" "}
                      with transfer details.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowIntegrationMessage(false)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-comic font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:-rotate-1 transition-all duration-300"
              >
                Back to Donation Form
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white bg-opacity-70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border-3 border-primary-100 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-primary-100 rounded-bl-full opacity-50" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold font-comic text-primary-700 mb-3">
                  Make Your Donation
                </h2>
                <p className="text-primary-600 font-comic">
                  Choose your donation amount and help us keep education free
                  for everyone
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Frequency Selection */}
                <div>
                  <label className="block text-primary-700 font-comic font-semibold mb-3">
                    Donation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFrequency("one-time")}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 font-comic font-semibold ${
                        frequency === "one-time"
                          ? "border-primary-400 bg-primary-50 text-primary-700"
                          : "border-primary-200 bg-white text-primary-600 hover:border-primary-300"
                      }`}
                    >
                      One-time Donation
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFrequency("monthly")}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 font-comic font-semibold relative ${
                        frequency === "monthly"
                          ? "border-primary-400 bg-primary-50 text-primary-700"
                          : "border-primary-200 bg-white text-primary-600 hover:border-primary-300"
                      }`}
                    >
                      Monthly Donation
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-primary-800 text-xs px-2 py-1 rounded-full font-bold">
                        2x Impact!
                      </span>
                    </motion.button>
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="block text-primary-700 font-comic font-semibold mb-3">
                    Donation Amount (USD)
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <motion.button
                        key={amount}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAmountSelect(amount)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 font-comic font-bold ${
                          selectedAmount === amount && !isCustom
                            ? "border-primary-400 bg-primary-50 text-primary-700"
                            : "border-primary-200 bg-white text-primary-600 hover:border-primary-300"
                        }`}
                      >
                        ${amount}
                      </motion.button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      className={`w-full px-5 py-3 rounded-2xl border-2 transition-all duration-300 font-comic bg-white bg-opacity-80 ${
                        isCustom
                          ? "border-primary-400 focus:border-primary-500"
                          : "border-primary-200 focus:border-primary-400"
                      } outline-none`}
                    />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-600 font-comic font-semibold pointer-events-none">
                      $
                    </span>
                  </div>
                </div>

                {/* Donor Information */}
                {!(userName && userEmail) && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Your Name"
                      name="name"
                      value={donorInfo.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      icon="👋"
                      required
                    />
                    <Input
                      label="Your Email"
                      name="email"
                      value={donorInfo.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      icon="📧"
                      valid={isEmailValid}
                      errorMessage={
                        !isEmailValid && donorInfo.email
                          ? "Please enter a valid email"
                          : ""
                      }
                      required
                    />
                  </div>
                )}

                {/* Optional Message */}
                <div>
                  <label className="block text-primary-700 font-comic font-semibold mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={donorInfo.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-primary-200 focus:border-primary-400 outline-none transition-all duration-300 font-comic resize-none bg-white bg-opacity-80"
                    placeholder="Leave a message of support..."
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    checked={donorInfo.anonymous}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "anonymous", value: e.target.checked },
                      })
                    }
                    className="w-5 h-5 text-primary-600 rounded border-2 border-primary-300 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-primary-700 font-comic"
                  >
                    Make this donation anonymous
                  </label>
                </div>

                {/* Total Display */}
                <div className="bg-gradient-to-r from-primary-50 to-yellow-50 rounded-2xl p-6 border-2 border-primary-200">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-700 font-comic font-semibold">
                      {frequency === "monthly"
                        ? "Monthly Donation:"
                        : "Total Donation:"}
                    </span>
                    <span className="text-2xl font-bold font-comic text-primary-800">
                      ${finalAmount.toFixed(2)}
                    </span>
                  </div>
                  {frequency === "monthly" && (
                    <p className="text-sm text-primary-600 font-comic mt-2">
                      Your monthly contribution of ${finalAmount.toFixed(2)}{" "}
                      will help us maintain consistent support for students
                      worldwide.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={finalAmount <= 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-comic font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:-rotate-1 transition-all duration-300 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Continue with Donation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </motion.button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-primary-600 font-comic text-sm">
                  <Shield className="w-4 h-4" />
                  <span>
                    Your information is secure • Payment integration in progress
                  </span>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DonationForm;
