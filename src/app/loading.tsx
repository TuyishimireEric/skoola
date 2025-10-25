import Loading from "@/components/loader/Loading";
import React from "react";
import Image from "next/image";

const loading = () => {
  return (
    <div className="inset-0 absolute flex flex-col items-center justify-center h-full w-full">
      <Loading />
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
  );
};

export default loading;
