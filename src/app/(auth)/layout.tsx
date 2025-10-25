import type { Metadata } from "next";
import Image from "next/image";
import "animate.css";
import "../globals.css";
import { NavBar } from "@/components/menu/NavBar";

export const metadata: Metadata = {
  title: "Login to Ganzaa",
  description: "Access your Ganzaa account to start learning and having fun!",
  keywords: [
    "login",
    "signup",
    "Ganzaa",
    "authentication",
    "education for kids",
    "interactive learning",
    "PWA",
    "offline learning",
    "fun learning",
    "children education",
    "math for kids",
    "science for kids",
    "Login to Ganzaa",
    "Sign in to Ganzaa",
    "Sign up for Ganzaa",
    "Ganzaa account",
    "Ganzaa login",
    "Ganzaa signup",
    "Ganzaa authentication",
    "Ganzaa user account",
    "Ganzaa educational platform",
    "Ganzaa learning platform",
    "Ganzaa interactive lessons",
    "Ganzaa educational games",
  ],
  openGraph: {
    title: "Login to Ganzaa",
    description: "Access your Ganzaa account to start learning and having fun!",
    url: "https://ganzaa.org/login",
    siteName: "Ganzaa",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 1200,
        alt: "Ganzaa Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login to Ganzaa",
    description: "Sign in to your Ganzaa account.",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: false,
  },
  metadataBase: new URL("https://ganzaa.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative font-comic">
      {children}
    </div>
  );
}
