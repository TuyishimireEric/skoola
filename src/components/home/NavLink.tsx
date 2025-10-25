import Link from "next/link";
import { memo } from "react";

type NavLinkProps = {
  href: string;
  section: string;
  activeSection: string;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavLink = memo(
  ({ href, section, activeSection, children, onClick }: NavLinkProps) => (
    <Link
      href={href}
      onClick={onClick}
      className={`text-base sm:text-lg font-comic transition-colors font-medium ${
        activeSection === section
          ? "text-primary-400 border-b-2 border-primary-400 pb-1"
          : "text-primary-600 hover:text-primary-400"
      }`}
    >
      {children}
    </Link>
  )
);
NavLink.displayName = "NavLink";

export default NavLink;
