"use client";

import { signOut } from "next-auth/react";
import React from "react";
import { RiLogoutCircleLine } from "react-icons/ri";

const SignOut = () => {
  return (
    <div
      onClick={() => signOut()}
      className="flex flex-col items-center justify-center h-16 cursor-pointer group hover:scale-110 transition-all duration-100 ease-in-out active:scale-90 active:opacity-80"
    >
      <RiLogoutCircleLine className="text-white shadow-huge" size={32} />
      <span className="text-white text-xs font-comic group-hover:font-bold">
        Logout
      </span>
    </div>
  );
};

export default SignOut;
