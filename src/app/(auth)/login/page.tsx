"use client";

import React, { useState } from "react";
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Login } from "@/components/auth/Login";
import Link from "next/link";

const LoginPage = () => {
  // const [userType, setUserType] = useState("teacher");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  // const userTypes = [
  //   {
  //     id: "teacher",
  //     label: "Teacher",
  //     icon: <GraduationCap className="w-5 h-5" />,
  //     color: "green",
  //   },
  //   {
  //     id: "student",
  //     label: "Student",
  //     icon: <BookOpen className="w-5 h-5" />,
  //     color: "amber",
  //   },
  //   {
  //     id: "parent",
  //     label: "Parent",
  //     icon: <Users className="w-5 h-5" />,
  //     color: "green",
  //   },
  // ];

  // const handleSubmit = () => {
  //   if (!email || !password) {
  //     alert("Please fill in all fields");
  //     return;
  //   }
  //   alert(`Logging in as ${userType}\nEmail: ${email}`);
  // };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-gradient-to-br from-green-50 via-amber-50 to-green-50 relative">
      <div className="absolute top-20 right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-amber-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="flex text-sm items-center gap-2 text-white/80 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-12 mt-16">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <School className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">SkoolaSync</span>
          </div>

          <div className="space-y-6 text-white">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to
              <br />
              Education Excellence
            </h1>
            <p className="text-xl text-green-100">
              Sign in to access your dashboard and continue making a difference
              in student lives across Rwanda.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
