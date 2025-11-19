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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="SkoolaSync" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SkoolaSync" />
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

        <main id="main-content" className="bg-gradient-to-br from-white via-amber-50 to-white">
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
