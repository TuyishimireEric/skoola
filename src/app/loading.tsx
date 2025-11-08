import Loading from "@/components/loader/Loading";
import React from "react";
import Image from "next/image";

const loading = () => {
  return (
    <div className="inset-0 absolute flex flex-col items-center justify-center h-full w-full font-comic bg-gradient-to-br from-white via-amber-50 to-white">
      <h1 className="text-2xl font-bold mb-4">Loading...</h1>
    </div>
  );
};

export default loading;
