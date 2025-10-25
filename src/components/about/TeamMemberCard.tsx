import { useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";


// Component for team member card to reduce complexity
type TeamMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin: string;
};

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, index }) => {
  const handleLinkedInClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
      e.preventDefault();
      window.open(url, "_blank", "noopener,noreferrer");
    },
    []
  );

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, scale: 0.8, y: 30 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            delay: index * 0.15,
            type: "spring",
            stiffness: 100,
            damping: 12,
          },
        },
      }}
      whileHover={{
        y: -15,
        scale: 1.05,
        transition: { duration: 0.3 },
      }}
      className="group bg-white rounded-3xl p-8 bg-opacity-50 backdrop-blur-xl shadow-2xl border-4 border-primary-200 hover:shadow-3xl transition-all duration-500 relative overflow-hidden max-w-sm mx-auto"
      role="article"
      aria-labelledby={`team-member-${index}`}
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        aria-hidden="true"
      >
        <div className="absolute top-4 right-4 text-6xl">🎈</div>
        <div className="absolute bottom-4 left-4 text-4xl">🌈</div>
      </div>

      {/* Profile Image */}
      <div className="relative mb-6">
        <div className="w-44 h-44 mx-auto relative">
          {/* Animated border */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 via-yellow-400 to-orange-400"
            style={{
              animation: "spin 3s linear infinite",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-1 rounded-full bg-white" />

          <div className="absolute inset-2 overflow-hidden rounded-full">
            <Image
              src={member.image}
              alt={`Portrait of ${member.name}`}
              width={160}
              height={160}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              priority={index === 0}
              sizes="(max-width: 768px) 160px, 160px"
            />
          </div>

          {/* Achievement badge */}
          <div
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-3 shadow-lg group-hover:animate-bounce"
            aria-hidden="true"
          >
            <span className="text-2xl" role="img" aria-label="Trophy">
              🏆
            </span>
          </div>
        </div>

        {/* LinkedIn link */}
        <button
          onClick={(e) => handleLinkedInClick(e, member.linkedin)}
          className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-orange-500 rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          aria-label={`View ${member.name}'s LinkedIn profile`}
          type="button"
        >
          <ExternalLink size={20} className="text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Member info */}
      <div className="text-center space-y-3">
        <h3
          id={`team-member-${index}`}
          className="text-2xl font-black font-comic text-primary-700 group-hover:text-orange-600 transition-colors"
        >
          {member.name}
        </h3>

        <div className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-4 py-2">
          <p className="text-primary-600 font-comic font-bold text-sm">
            {member.role}
          </p>
        </div>

        <p className="text-gray-700 font-comic text-sm leading-relaxed px-2">
          {member.bio}
        </p>

        {/* Rating stars */}
        <div
          className="flex justify-center space-x-1 mt-4"
          role="img"
          aria-label="5 star rating"
        >
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="text-yellow-400 text-lg"
              style={{
                animation: `pulse 2s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
              aria-hidden="true"
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Hover effects */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/4 text-yellow-400 text-lg animate-ping">
          ✨
        </div>
        <div
          className="absolute top-3/4 right-1/4 text-orange-400 text-lg animate-ping"
          style={{ animationDelay: "0.5s" }}
        >
          💫
        </div>
        <div
          className="absolute bottom-1/4 left-3/4 text-yellow-500 text-lg animate-ping"
          style={{ animationDelay: "1s" }}
        >
          ⭐
        </div>
      </div>
    </motion.article>
  );
};

export default TeamMemberCard;
