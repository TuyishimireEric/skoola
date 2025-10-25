import {
  Heart,
  Lightbulb,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { BsTwitterX } from "react-icons/bs";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";

export const subjects = [
  "Mathematics",
  "English",
  "Sciences",
  "Geography",
  "History",
  "Arts",
];

export const ImagePlaceholder =
  "https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png";

export const getGameType = (subject: string): string[] => {
  switch (subject) {
    case "Mathematics":
      return [
        "Sorting",
        "Selection",
        "Matching",
        "Math",
        "Comparison",
        "FillInTheBlanks",
        "DragAndDrop",
        "MultipleChoice",
        "TrueOrFalse",
        "Drawing",
      ];
    case "English":
      return [
        "Reading",
        "Writing",
        "Speaking",
        "Listening",
        "Sorting",
        "Selection",
        "Matching",
        "Comparison",
        "FillInTheBlanks",
        "DragAndDrop",
        "MultipleChoice",
        "TrueOrFalse",
      ];
    default:
      return [
        "Sorting",
        "Selection",
        "Matching",
        "FillInTheBlanks",
        "Puzzle",
        "DragAndDrop",
        "MultipleChoice",
        "TrueOrFalse",
        "Drawing",
      ];
  }
};

export const ConstantClasses = [
  {
    Id: 1,
    Name: "Primary 1",
    Description: "Primary 1",
    OrganizationId: "22417b1f-b8b7-491c-9b5b-fe675bd06ea3",
    CreatedOn: "2025-03-13 09:58:52.203549+00",
    UpdatedOn: "2025-03-13 09:58:52.203549+00",
    Type: "Primary",
    Order: 4,
    ClassCode: "PR-001",
  },
  {
    Id: 2,
    Name: "Primary 2",
    Description: "Primary 2",
    OrganizationId: "22417b1f-b8b7-491c-9b5b-fe675bd06ea3",
    CreatedOn: "2025-03-13 09:58:52.673442+00",
    UpdatedOn: "2025-03-13 09:58:52.673442+00",
    Type: "Primary",
    Order: 5,
    ClassCode: "PR-002",
  },
  {
    Id: 3,
    Name: "Primary 3",
    Description: "Primary 3",
    OrganizationId: "22417b1f-b8b7-491c-9b5b-fe675bd06ea3",
    CreatedOn: "2025-03-13 09:58:53.628826+00",
    UpdatedOn: "2025-03-13 09:58:53.628826+00",
    Type: "Primary",
    Order: 6,
    ClassCode: "PR-003",
  },
  {
    Id: 4,
    Name: "Primary 4",
    Description: "Primary 4",
    OrganizationId: "22417b1f-b8b7-491c-9b5b-fe675bd06ea3",
    CreatedOn: "2025-03-13 09:58:53.999385+00",
    UpdatedOn: "2025-03-13 09:58:53.999385+00",
    Type: "Primary",
    Order: 7,
    ClassCode: "PR-004",
  },
  {
    Id: 5,
    Name: "Primary 5",
    Description: "Primary 5",
    OrganizationId: "22417b1f-b8b7-491c-9b5b-fe675bd06ea3",
    CreatedOn: "2025-03-13 09:58:54.37041+00",
    UpdatedOn: "2025-03-13 09:58:54.37041+00",
    Type: "Primary",
    Order: 8,
    ClassCode: "PR-005",
  },
  {
    Id: 6,
    Name: "Primary 6",
    Description: "Primary 6",
    OrganizationId: "22417b1f-b8b7-491c-9b5b-fe675bd06ea3",
    CreatedOn: "2025-03-13 09:58:54.728533+00",
    UpdatedOn: "2025-03-13 09:58:54.728533+00",
    Type: "Primary",
    Order: 9,
    ClassCode: "PR-006",
  },
];

export const TEAM_MEMBERS = [
  {
    name: "Eric Tuyishimire",
    role: "Founder & Frontend Developer",
    image: "/eric.JPG",
    bio: "Frontend developer with 4+ years of experience. Leads the design and development of the user interface, ensuring a seamless learning experience for children. Former educator with a passion for transforming education through technology.",
    linkedin: "https://www.linkedin.com/in/tuyishimireeric",
  },
  {
    name: "Jacques Niyonkuru",
    role: "Backend Developer",
    image: "/jacques.jpg",
    bio: "Backend developer, responsible for the backend development and technical infrastructure. Uses his academic expertise to shape the app's educational logic and content structure.",
    linkedin: "https://www.linkedin.com/in/jacques-niyonkuru-55b12b180/",
  },
];

export const VALUES = [
  {
    icon: Heart,
    title: "Child-Centered",
    description:
      "Every decision we make puts children's wellbeing and joy first",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We use cutting-edge technology to create magical learning moments",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Creating a secure, ad-free environment where kids can explore freely",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Globe,
    title: "Inclusive",
    description: "Learning should be accessible to every child, everywhere",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
];

export const IMPACT_STATS = [
  {
    number: "98%",
    label: "Parent Satisfaction",
    description: "Parents report improved learning outcomes",
  },
  {
    number: "2.5x",
    label: "Faster Learning",
    description: "Compared to traditional methods",
  },
  {
    number: "45min",
    label: "Daily Engagement",
    description: "Average time kids spend learning",
  },
  {
    number: "4.9★",
    label: "App Store Rating",
    description: "From thousands of happy families",
  },
];

export const HERO_STATS = [
  { value: "25+", label: "Countries", icon: "🌍" },
  { value: "100+", label: "Partner Schools", icon: "🏫" },
  { value: "10K+", label: "Happy Students", icon: "👨‍👩‍👧‍👦" },
  { value: "1M+", label: "Lessons Completed", icon: "✅" },
];

export const MISSION_FEATURES = [
  "🎯 Personalized learning paths for every student",
  "🎮 Gamification that makes learning addictive",
  "📊 Real-time progress tracking for parents",
  "🌟 Curriculum aligned with global standards",
];

export const socialLinks = [
  {
    name: "Facebook",
    icon: FaFacebook,
    url: "https://www.facebook.com/people/Ganzaa-Learning/100070586472256",
    color: "text-blue-600 hover:text-blue-700",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    url: "https://instagram.com/ganzaaorg",
    color: "text-pink-600 hover:text-pink-700",
    bgColor: "bg-pink-50 hover:bg-pink-100",
  },
  {
    name: "X",
    icon: BsTwitterX,
    url: "https://x.com/ganzaalearning",
    color: "text-sky-500 hover:text-sky-600",
    bgColor: "bg-sky-50 hover:bg-sky-100",
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    url: "https://www.youtube.com/@ganzaalearning",
    color: "text-red-600 hover:text-red-700",
    bgColor: "bg-red-50 hover:bg-red-100",
  },
  {
    name: "LinkedIn",
    icon: FaLinkedin,
    url: "https://linkedin.com/company/ganzaaorg",
    color: "text-blue-700 hover:text-blue-800",
    bgColor: "bg-blue-50 hover:bg-blue-100",
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    url: "https://tiktok.com/@ganzaaorg",
    color: "text-gray-900 hover:text-black",
    bgColor: "bg-gray-100 hover:bg-gray-200",
  },
];

export const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    content: "contact@ganzaa.org",
    link: "mailto:contact@ganzaa.org",
  },
  {
    icon: Phone,
    title: "Call Us",
    content: "+250 780 313 448",
    link: "tel:+250780313448",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    content: "Kigali, Rwanda",
    link: "#",
  },
];

// recommendedCourses.ts
export const recommendedCourses = [
  {
    id: 1,
    GameId: "math-basic",
    name: "Number Fun",
    status: "completed",
    stars: 3,
    maxStars: 3,
    difficulty: "easy",
    estimatedTime: "10m",
    category: "Math",
    emoji: "🔢",
  },
  {
    id: 2,
    GameId: "reading-fun",
    name: "ABC Adventure",
    status: "completed",
    stars: 3,
    maxStars: 3,
    difficulty: "easy",
    estimatedTime: "12m",
    category: "Reading",
    emoji: "📚",
  },
  {
    id: 3,
    GameId: "colors-art",
    name: "Color Magic",
    status: "completed",
    stars: 2,
    maxStars: 3,
    difficulty: "easy",
    estimatedTime: "8m",
    category: "Art",
    emoji: "🎨",
  },
  {
    id: 4,
    GameId: "science-explore",
    name: "Science Quest",
    status: "current",
    stars: 1,
    maxStars: 3,
    difficulty: "medium",
    estimatedTime: "15m",
    category: "Science",
    emoji: "🔬",
  },
  {
    id: 5,
    GameId: "shapes-geometry",
    name: "Shape Safari",
    status: "locked",
    stars: 0,
    maxStars: 3,
    difficulty: "medium",
    estimatedTime: "12m",
    category: "Math",
    emoji: "📐",
  },
  {
    id: 6,
    GameId: "music-notes",
    name: "Musical Journey",
    status: "locked",
    stars: 0,
    maxStars: 3,
    difficulty: "medium",
    estimatedTime: "18m",
    category: "Music",
    emoji: "🎵",
  },
];

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
}

export interface Friend {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  currentActivity: string;
  level: number;
}

// Types
export interface Level {
  id: number;
  GameId: string;
  name: string;
  isCompleted: boolean;
  stars: number;
  icon: string;
  color: string;
}

export interface Activity {
  id: number;
  title: string;
  type: "homework" | "video" | "game" | "lesson";
  subject: string;
  duration: string;
  stars: number;
  completed: boolean;
  dueDate?: string;
  scheduledTime?: string;
}

export interface KidProfile {
  name: string;
  avatar: string;
  level: number;
  totalStars: number;
  gamesPlayed: number;
  streakDays: number;
  rank: string;
  completionRate: number;
  age: number;
  grade: string;
}

// Mock data
export const mockKidProfile: KidProfile = {
  name: "Amara Johnson",
  avatar: "👧🏿",
  level: 8,
  totalStars: 1247,
  gamesPlayed: 18,
  streakDays: 5,
  rank: "Village Explorer",
  completionRate: 92,
  age: 10,
  grade: "4th Grade",
};

export const mockTodayActivities: Activity[] = [
  {
    id: 1,
    title: "Math Adventure",
    type: "game",
    subject: "Mathematics",
    duration: "15 min",
    stars: 30,
    completed: false,
    scheduledTime: "Now",
  },
  {
    id: 2,
    title: "Story Time",
    type: "video",
    subject: "English",
    duration: "10 min",
    stars: 20,
    completed: false,
    scheduledTime: "After Math",
  },
  {
    id: 3,
    title: "Animal Facts",
    type: "lesson",
    subject: "Science",
    duration: "12 min",
    stars: 25,
    completed: true,
    scheduledTime: "Completed",
  },
  {
    id: 4,
    title: "Draw & Color",
    type: "game",
    subject: "Art",
    duration: "20 min",
    stars: 35,
    completed: false,
    scheduledTime: "3:00 PM",
  },
];

export const mockFriends: Friend[] = [
  {
    id: 1,
    name: "Kwame",
    avatar: "👦🏿",
    isOnline: true,
    currentActivity: "Playing Math Safari",
    level: 7,
  },
  {
    id: 2,
    name: "Fatima",
    avatar: "👩🏿",
    isOnline: true,
    currentActivity: "Reading Stories",
    level: 9,
  },
  {
    id: 3,
    name: "Jabari",
    avatar: "👨🏿",
    isOnline: false,
    currentActivity: "Last seen 2h ago",
    level: 6,
  },
  {
    id: 4,
    name: "Zara",
    avatar: "👧🏿",
    isOnline: true,
    currentActivity: "Science Quest",
    level: 8,
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: "Math Master",
    description: "Complete 10 math games",
    icon: "🧮",
    earned: true,
    progress: 10,
    maxProgress: 10,
  },
  {
    id: 2,
    title: "Story Explorer",
    description: "Read 5 stories",
    icon: "📚",
    earned: false,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: 3,
    title: "Science Star",
    description: "Complete science course",
    icon: "⭐",
    earned: true,
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 4,
    title: "Daily Champion",
    description: "Complete daily challenges for 7 days",
    icon: "🏆",
    earned: false,
    progress: 5,
    maxProgress: 7,
  },
];
