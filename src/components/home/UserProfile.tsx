import { getInitials } from "@/utils/functions";
import { Link, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { memo } from "react";
import Image from "next/image";
import { Session } from "next-auth";

type UserProfileProps = {
  session: Session | null;
  onClose?: () => void;
};

const UserProfile = memo(({ session, onClose }: UserProfileProps) => (
  <>
    <div className="flex items-center gap-3 w-full py-3">
      <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-primary-300">
        {session?.user?.image ? (
          <Image
            fill
            src={session.user.image}
            alt={session.user.name || "Profile"}
            className="w-full h-full object-cover"
            sizes="48px"
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-comic text-lg font-bold"
            aria-label="User initials"
          >
            {getInitials(session?.user?.name)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-primary-600 font-semibold font-comic">
          {session?.user.name || "Explorer"}
        </h3>
      </div>
    </div>
    <Link
      href="/profile"
      onClick={onClose}
      className="w-full text-left px-4 py-2 text-primary-600 hover:bg-primary-50 font-comic"
    >
      My Profile
    </Link>
    <Link
      href="/achievements"
      onClick={onClose}
      className="w-full text-left px-4 py-2 text-primary-600 hover:bg-primary-50 font-comic"
    >
      My Achievements
    </Link>
    <Link
      href="/settings"
      onClick={onClose}
      className="w-full text-left px-4 py-2 text-primary-600 hover:bg-primary-50 font-comic"
    >
      Settings
    </Link>
    <button
      onClick={() => {
        if (confirm("Are you sure you want to leave your adventure?")) {
          signOut();
          onClose?.();
        }
      }}
      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-comic flex items-center gap-2"
    >
      <LogOut size={18} aria-hidden="true" /> Log Out
    </button>
  </>
));
UserProfile.displayName = "UserProfile";

export default UserProfile;
