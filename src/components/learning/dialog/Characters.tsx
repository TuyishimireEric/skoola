import Image from "next/image";

interface CharacterProps {
  currentCharacter: string;
  name: string;
  gameOver: boolean;
}

const CharacterNames = [
  {
    name: "John",
    url: "/boy.png",
    alt: "John",
  },
  {
    name: "Anna",
    url: "/girlCharacter.png",
    alt: "Anna",
  },
];

export const Characters = ({
  currentCharacter,
  name,
  gameOver,
}: CharacterProps) => {
  const Character = CharacterNames.find(
    (character) => character.name.toLowerCase() === name.toLowerCase()
  );
  if (!Character) {
    return null;
  }
  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
      <div
        className={`transition-all duration-500 relative ${
          currentCharacter === name ? "" : ""
        }`}
      >
        <Image
          src={Character.url}
          alt={Character.alt}
          width={300}
          height={450}
          className={`transition-all duration-500 ${
            currentCharacter === name || gameOver
              ? "opacity-100 scale-105"
              : "opacity-50 scale-90"
          }`}
        />
      </div>
    </div>
  );
};
