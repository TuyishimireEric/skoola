import { User } from "lucide-react";
import Image from "next/image";

// Helper function to check if imageUrl is an emoji
const isEmoji = (str: string): boolean => {
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
  return emojiRegex.test(str) || str.length <= 2;
};

// Profile Image Component
const ProfileImage: React.FC<{ imageUrl: string; size?: string }> = ({
  imageUrl,
  size = "w-28 h-28",
}) => {
  if (!imageUrl) {
    return (
      <div
        className={`${size} bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center`}
      >
        <User size={48} className="text-gray-400" />
      </div>
    );
  }

  if (isEmoji(imageUrl)) {
    return (
      <div
        className={`${size} bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center`}
      >
        <span className="text-4xl leading-none flex items-center justify-center h-full">
          {imageUrl}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${size} relative rounded-full overflow-hidden flex items-center justify-center bg-gray-100`}
    >
      <Image
        src={imageUrl}
        alt="Profile"
        className="w-full h-full object-cover object-center"
        width={500}
        height={500}
      />
    </div>
  );
};

export default ProfileImage;
