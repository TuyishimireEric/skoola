"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import HeroSection from "./HeroSection";
import HowWeUseDonations from "./HowWeUseDonations";
import DonationForm from "./DonationForm";
import { Footer } from "../Footer";

// Main Donate Page Component
const DonatePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <HeroSection />

      {/* How We Use Donations Section */}
      <HowWeUseDonations />

      {/* Donation Form Section */}
      <DonationForm />

      {/* Trust Indicators */}
      <section className="py-12 bg-gradient-to-r from-primary-100 to-yellow-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold font-comic text-primary-700 mb-6">
              Trusted by Donors Worldwide
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 text-primary-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-comic">SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-comic">PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-comic">Stripe Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-comic">Tax Deductible</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer fullWidth={true} />
    </div>
  );
};

export default DonatePage;
