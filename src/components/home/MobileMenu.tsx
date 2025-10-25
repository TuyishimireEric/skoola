import { Link } from "lucide-react";
import { memo } from "react";
import NavLink from "./NavLink";
import UserProfile from "./UserProfile";
import { Session } from "next-auth";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  session: Session | null;
};

const MobileMenu = memo(
  ({ isOpen, onClose, activeSection, session }: MobileMenuProps) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-white z-20 pt-20 px-6 md:hidden animate__animated animate__fadeInDown">
        <nav className="flex flex-col items-center gap-6">
          {["Home", "Features", "Subjects"].map((item) => {
            const section = item.toLowerCase();
            return (
              <NavLink
                key={item}
                href={`#${section}`}
                section={section}
                activeSection={activeSection}
                onClick={onClose}
              >
                {item}
              </NavLink>
            );
          })}

          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="text-xl bg-primary-400 text-white font-comic font-medium py-2 px-4 rounded-full hover:text-green-50 hover:scale-105 transition-all duration-300 w-full text-center"
              >
                Dashboard
              </Link>
              <div className="w-full border-t border-gray-200 my-4"></div>
              <UserProfile session={session} onClose={onClose} />
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="w-full text-center px-5 py-3 bg-primary-400 hover:bg-primary-300 text-white rounded-full font-bold font-comic text-xl shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Start Adventure!
            </Link>
          )}
        </nav>
      </div>
    );
  }
);
MobileMenu.displayName = "MobileMenu";

export default MobileMenu;
