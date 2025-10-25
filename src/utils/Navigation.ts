import { FaUserGraduate, FaUsers } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { GiTeacher } from "react-icons/gi";
import { BiSolidSchool } from "react-icons/bi";
import { Gamepad } from "lucide-react";

export const SideMenu = [
  {
    icon: IoHome,
    label: "Home",
    path: "/dashboard",
    access: ["All"],
  },
  {
    icon: Gamepad,
    label: "Games",
    path: "/school/games",
    access: ["All"],
  },
  {
    icon: FaUserGraduate,
    label: "Students",
    path: "/school/students",
    access: ["SuperAdmin", "Teacher", "All"],
  },
  {
    icon: GiTeacher,
    label: "Teachers",
    path: "/school/teachers",
    access: ["SuperAdmin", "Teacher", "All"],
  },
  {
    icon: FaUsers,
    label: "Users",
    path: "/users",
    access: ["SuperAdmin", "All"],
  },
  {
    icon: BiSolidSchool,
    label: "School",
    path: "/school/profile",
    access: ["Student", "ClassTeacher", "Parent", "SuperAdmin", "All"],
  },
  {
    icon: FaUserLarge,
    label: "Profile",
    path: "/profile",
    access: ["Student", "ClassTeacher", "Parent", "SuperAdmin", "All"],
  },
];
