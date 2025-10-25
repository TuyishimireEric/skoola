import Image from "next/image";

const BackgroundCharacter = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/BackgroundImage.webp"
        alt="cloud"
        fill
        className="object-cover"
        style={{
          objectPosition: "right",
        }}
      />
    </div>
  );
};

export default BackgroundCharacter;
