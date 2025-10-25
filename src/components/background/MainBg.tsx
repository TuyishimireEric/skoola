import Image from "next/image";
import { memo } from "react";

const MainBackground = memo(function MainBackground() {
  return (
    <div className="fixed inset-0 z-20 overflow-hidden">
      <Image
        src="https://res.cloudinary.com/dn8vyfgnl/image/upload/v1747124071/backgroundImage_b3lwbq.jpg"
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
});

export default MainBackground;
