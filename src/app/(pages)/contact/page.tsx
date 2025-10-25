import HeroSection from "@/components/contact/HeroSection";
import { Footer } from "@/components/Footer";
import ContactForm from "@/components/contact/ContactForm";

const ContactUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Contact Form Section */}
      <ContactForm />

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default ContactUsPage;
