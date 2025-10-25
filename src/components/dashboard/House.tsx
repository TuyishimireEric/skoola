import Image from "next/image";

export const House = () => {
  return (
    <div className="fixed z-10 bottom-0 right-0 w-1/2 h-4/5">
      <div className="relative w-full h-full flex justify-end">
        <Image
          src="/house.png"
          alt="House"
          priority
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-right transition-all duration-300"
        />
      </div>
    </div>
  );
};