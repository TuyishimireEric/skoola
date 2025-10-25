import SideMenu from "@/components/menu/SideMenu";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Ganzaa",
  description: "Ganzaa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex gap-2 sm:gap-4 z-20 h-[100vh] w-full items-center p-4 md:p-6 relative font-comic">
        <SideMenu />
        <div className="max-h-full flex-grow z-20 h-full">{children}</div>
        <div className="fixed inset-0 -z-20 overflow-hidden">
          <Image
            src="/backgroundImage.png"
            alt="cloud"
            fill
            className="object-cover"
            style={{
              objectPosition: "right",
            }}
            priority
          />
        </div>
      </div>
    </>
  );
}
