import SideNav from "@/components/menu/SideMenu";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skoola - Dashboard",
  description: "Skoola Dashboard Layout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex gap-4 z-20 h-[100vh] w-full items-center relative font-comic bg-gradient-to-br from-white via-amber-50 to-white ">
        <SideNav />
        <div className="h-full flex-grow z-20 p-4">{children}</div>
      </div>
    </>
  );
}
