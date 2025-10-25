import Image from "next/image";

const PleaseWait = ({
  text = "Loading...",
  overlay = false,
  size = 30,
}: {
  text?: string;
  overlay?: boolean;
  size?: number;
}) => {
  return (
    <div className={`absolute flex items-center justify-center gap-2 inset-0 ${overlay?"bg-white/20 bg-opacity-70 backdrop-blur-sm":""}`}>
      <Image
        src={"/loading.gif"}
        alt="Loading..."
        width={size}
        height={size}
        className="animate__animated animate__fadeIn"
      />
      <p className="text-lg font-comic  animate__animated animate__fadeIn animate__slow animate__infinite">
        {text}
      </p>
    </div>
  );
};

export default PleaseWait;
