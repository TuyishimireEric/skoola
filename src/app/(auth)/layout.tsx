import type { Metadata } from "next";
import "animate.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login to SkoolaSync",
  description: "Access your SkoolaSync account to start learning and having fun!",
  keywords: [
    "login",
    "signup",
    "SkoolaSync",
    "authentication",
    "education for kids",
    "interactive learning",
    "PWA",
    "offline learning",
    "fun learning",
    "children education",
    "math for kids",
    "science for kids",
    "Login to SkoolaSync",
    "Sign in to SkoolaSync",
    "Sign up for SkoolaSync",
    "SkoolaSync account",
    "SkoolaSync login",
    "SkoolaSync signup",
    "SkoolaSync authentication",
    "SkoolaSync user account",
    "SkoolaSync educational platform",
    "SkoolaSync learning platform",
    "SkoolaSync interactive lessons",
    "SkoolaSync educational games",
  ],
  openGraph: {
    title: "Login to SkoolaSync",
    description: "Access your SkoolaSync account to start learning and having fun!",
    url: "https://SkoolaSync.org/login",
    siteName: "SkoolaSync",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 1200,
        alt: "SkoolaSync Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login to SkoolaSync",
    description: "Sign in to your SkoolaSync account.",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: false,
  },
  metadataBase: new URL("https://SkoolaSync.org"),
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
