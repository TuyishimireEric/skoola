import Image from "next/image";

const LoadingComponent = ({
  text = "Loading, please wait...",
  overlay = false,
  fullScreen = false,
  size = "md",
}: {
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) => {
  const sizeValue =
    size === "xs" ? 50 : size === "sm" ? 100 : size === "md" ? 150 : 200;
  return (
    <div
      className={`${
        fullScreen ? "w-full h-full absolute" : "absolute w-full h-full"
      } flex items-center justify-center ${
        overlay ? "bg-white/20" : "bg-white/20"
      } z-50 animate__animated animate__fadeIn overflow-hidden`}
    >
      <div
        className={`flex ${
          size == "xs" ? "flex-row " : "flex-col "
        }items-center gap-2`}
      >
        <Image
          src={"/loading.gif"}
          alt="Loading..."
          width={sizeValue}
          height={sizeValue}
          className="animate__animated animate__fadeIn"
        />
        {size !== "xs" && (
          <p
            className={` ${
              size == "sm" ? "text-sm" : "text-xl "
            }font-comic font-bold animate__animated animate__fadeIn animate__infinite`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingComponent;
