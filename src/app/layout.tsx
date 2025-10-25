import { Baloo_2, Comic_Neue, Nunito, Albert_Sans } from "next/font/google";
import "./globals.css";
import { Provider } from "./_providers/Provider";
import "animate.css";
import { Toaster } from "react-hot-toast";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactNode } from "react";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-albert-sans",
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-comic-neue",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo-2",
  weight: ["400", "500", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Ganzaa - Fun Learning Adventure for Kids",
  description:
    "Join Ganzaa's world of fun, games, and learning for an exciting educational journey! Interactive lessons in math, science, reading, and more.",
  keywords:
    "kids learning, educational games, children education, interactive learning, math for kids, science for kids, PWA, offline learning",
  authors: [{ name: "Ganzaa Team" }],
  creator: "Ganzaa",
  publisher: "Ganzaa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ganzaa.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ganzaa - Fun Learning Adventure for Kids",
    description:
      "Join Ganzaa's world of fun, games, and learning for an exciting educational journey!",
    url: "https://ganzaa.org",
    siteName: "Ganzaa",
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 1200,
        alt: "Ganzaa - Learning is an Adventure",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ganzaa - Fun Learning Adventure for Kids",
    description: "Join Ganzaa's world of fun, games, and learning!",
    images: ["/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/Logo.png", sizes: "192x192", type: "image/png" },
      { url: "/Logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/Logo.png" }],
  },
  manifest: "/manifest.json",
  // PWA-specific metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ganzaa Learning",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Ganzaa",
    "application-name": "Ganzaa",
    "msapplication-TileColor": "#FFD166",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Ganzaa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ganzaa" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FFD166" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Manual favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Theme colors */}
        <meta name="theme-color" content="#FFD166" />
        <meta name="color-scheme" content="light" />

        {/* Viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />

        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((error) => {
                      console.log('SW registration failed: ', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${albertSans.variable} ${comicNeue.variable} ${baloo2.variable} ${nunito.variable} font-comic-neue antialiased`}
      >
        {/* Skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-yellow-500 text-white px-4 py-2 rounded-md z-50 font-comic-neue"
        >
          Skip to content
        </a>

        <main id="main-content">
          <Provider>
            {children}
            <Toaster />
            <ServiceWorkerRegistration />
            <SpeedInsights />
          </Provider>
        </main>

      </body>
    </html>
  );
}
