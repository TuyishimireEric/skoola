import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface DonationData {
  amount: number;
  frequency: "one-time" | "monthly";
  donorInfo: {
    name: string;
    email: string;
    message?: string;
    anonymous: boolean;
  };
}

export const useDonation = () => {
  return useMutation({
    mutationFn: async (data: DonationData) => {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Donation error:", error);
      toast.error("Failed to process donation. Please try again.");
    },
  });
};
