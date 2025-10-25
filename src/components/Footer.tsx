"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "@/utils/Constants";

interface FooterProps {
  fullWidth?: boolean;
}

export const Footer = ({ fullWidth = true }: FooterProps) => {
  return (
    <footer
      id="contact"
      className={`${
        !fullWidth
          ? "max-w-7xl mt-8 rounded-t-3xl shadow-3xl mx-auto py-12 px-6 md:px-24 "
          : "w-full py-20 px-6 md:px-16"
      } bg-primary-500 text-white  relative overflow-hidden`}
    >
      {/* Decorative wave border */}
      <div className="absolute top-0 left-0 w-full h-8 bg-repeat-x"></div>

      {/* Fun floating shapes for kids */}
      <div className="absolute top-16 left-10 w-8 h-8 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute top-32 right-16 w-6 h-6 bg-pink-300 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-32 left-20 w-10 h-10 bg-green-300 rounded-full opacity-20 animate-bounce delay-75"></div>

      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row gap-16 items-start lg:items-center">
          {/* Logo and brand section - Now prominent and centered on mobile */}
          <div className="mx-auto flex flex-col items-center lg:items-start lg:flex-shrink-0 text-center lg:text-left">
            <Link
              href="/"
              className="mx-auto flex flex-col items-center lg:items-start group mb-6"
            >
              <div className="w-28 h-28 sm:w-40 sm:h-40 lg:w-40 lg:h-40 xl:w-40 xl:h-40 relative group-hover:scale-110 transition-transform duration-500 ">
                <Image
                  src={
                    "https://res.cloudinary.com/dn8vyfgnl/image/upload/v1750008049/Logo_gnwstm.png"
                  }
                  alt="Ganzaa logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  unoptimized
                />
              </div>
            </Link>

            {/* Social media icons */}
            <div className="flex gap-2 sm:gap-3 justify-center lg:justify-start">
              {socialLinks.slice(0, 4).map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-40 hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8  flex items-center justify-center rounded-full">
                    {" "}
                    <social.icon
                      className={`text-lg text-white transition-colors`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation links - Better organized and responsive */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              {/* For Students */}
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-xl font-bold mb-6 font-comic text-white relative">
                  For Students
                  <div className="absolute -bottom-2 left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 w-12 h-1 bg-white rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {["Games", "Courses", "Library", "Rewards"].map((item) => (
                    <li key={item}>
                      <Link
                        href={`/`}
                        className="text-white hover:text-primary-200 font-comic text-base hover:scale-105 transition-all duration-200 inline-block"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Parents */}
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-xl font-bold mb-6 font-comic text-white relative">
                  For Parents
                  <div className="absolute -bottom-2 left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 w-12 h-1 bg-white rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {[
                    "Progress Reports",
                    "Parent Guide",
                    "Safety",
                    "Support",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        href={`/`}
                        className="text-white hover:text-primary-200 font-comic text-base sm:text-lg hover:scale-105 transition-all duration-200 inline-block"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Schools */}
              <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
                <h3 className="text-xl sm:text-xl font-bold mb-6 font-comic text-white relative">
                  For Schools
                  <div className="absolute -bottom-2 left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 w-12 h-1 bg-white rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {[
                    "Curriculum",
                    "Classroom Tools",
                    "School Plans",
                    "Case Studies",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        href={`/schools/${item
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        className="text-white hover:text-primary-200 font-comic text-base sm:text-lg hover:scale-105 transition-all duration-200 inline-block"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom section */}
        <div className="mt-20 pt-8 border-t-2 border-primary-400 border-dashed">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <p className="text-primary-100 font-comic text-center lg:text-left text-base sm:text-lg font-semibold">
              © 2025 Ganzaa - Making learning an adventure for every child! 🌟
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
             

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-40 hover:scale-110 transition-all duration-300 shadow-lg">
                  <div className="w-6 h-6  text-white flex items-center justify-center rounded-full">
                    {" "}
                    📞
                  </div>
                </div>
                +250 780 313 448
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
