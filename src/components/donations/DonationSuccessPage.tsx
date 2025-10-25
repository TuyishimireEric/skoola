import { motion } from "framer-motion";
import { CheckCircle, Heart, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";

const DonateSuccessPage = () => {
  const shareMessage = `I just donated to Ganzaa to help keep education free for everyone! Join me in supporting accessible learning: ${window.location.origin}/donate`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold font-comic text-primary-800 mb-4">
            Thank You for Your Donation!
          </h1>

          <p className="text-lg text-primary-600 font-comic mb-8">
            Your generous contribution helps us keep education accessible and
            free for students worldwide.
          </p>

          {/* Impact Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-primary-100 to-yellow-50 rounded-3xl p-8 mb-8"
          >
            <Heart className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-comic text-primary-700 mb-3">
              Your Impact
            </h3>
            <p className="text-primary-600 font-comic">
              Your donation will help provide free educational resources to
              students in need, maintain our platform&apos;s security and
              reliability, and develop new learning tools that make education
              more accessible worldwide.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-comic font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Ganzaa
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "I donated to Ganzaa!",
                    text: shareMessage,
                    url: `${window.location.origin}/donate`,
                  });
                } else {
                  navigator.clipboard.writeText(shareMessage);
                  alert("Share message copied to clipboard!");
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 font-comic font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
              Share Your Impact
            </motion.button>
          </div>

          <p className="text-sm text-primary-500 font-comic">
            A confirmation email has been sent to your email address with your
            donation receipt.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DonateSuccessPage;
