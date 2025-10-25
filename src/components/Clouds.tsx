"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// Define the type for cloud styles
type CloudStyle = {
  animationDuration: string;
  left: string;
  width: number;
  height: number;
};

const Clouds = () => {
  // Define cloud styles in the state
  const [cloudStyles, setCloudStyles] = useState<CloudStyle[]>([]);

  useEffect(() => {
    // Generate cloud styles
    const newCloudStyles: CloudStyle[] = Array(4)
      .fill(null)
      .map(() => ({
        animationDuration: `${Math.random() * 20 + 40}s`,
        left: `${Math.random() * 100 - 50}%`,
        width: Math.floor(Math.random() * 200) + 300,
        height: Math.floor(Math.random() * 100) + 200,
      }));
    setCloudStyles(newCloudStyles);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {cloudStyles.length > 0 && (
        <>
          <Image
            src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1730131605/AI-driven/cloud2_nihtcn.svg"
            alt="cloud"
            width={cloudStyles[0].width}
            height={cloudStyles[0].height}
            className=" opacity-70"
            style={{
              position: "absolute",
              top: 0,
              left: cloudStyles[0].left,
              animationDuration: cloudStyles[0].animationDuration,
            }}
          />
          <Image
            src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1730131060/AI-driven/cloud1_cggogm.svg"
            alt=" "
            width={cloudStyles[1].width}
            height={cloudStyles[1].height}
            className="opacity-70"
            style={{
              position: "absolute",
              top: "20%",
              left: cloudStyles[1].left,
              animationDuration: cloudStyles[1].animationDuration,
            }}
          />
          <Image
            src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1730133941/AI-driven/cloud4_rggpz1.svg"
            alt="cloud"
            width={cloudStyles[2].width}
            height={cloudStyles[2].height}
            className=" opacity-70"
            style={{
              position: "absolute",
              top: "40%",
              left: cloudStyles[2].left,
              animationDuration: cloudStyles[2].animationDuration,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Clouds;
