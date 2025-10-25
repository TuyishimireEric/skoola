import {
  Calculator,
  BookOpen,
  Target,
  Shuffle,
  Link2,
  Edit3,
  MessageSquare,
  ArrowUpDown,
  Hash,
} from "lucide-react";

export const QUESTION_TYPE_CONFIG = {
  MissingNumber: {
    icon: Calculator,
    label: "Math Problems",
    color: "from-orange-400 to-red-400",
    emoji: "🔢",
  },
  Selection: {
    icon: Target,
    label: "Multiple Choice",
    color: "from-green-400 to-emerald-500",
    emoji: "🎯",
  },
  Reading: {
    icon: BookOpen,
    label: "Reading",
    color: "from-purple-400 to-pink-400",
    emoji: "📖",
  },
  Sorting: {
    icon: ArrowUpDown,
    label: "Sorting",
    color: "from-yellow-400 to-orange-400",
    emoji: "↕️",
  },
  Matching: {
    icon: Link2,
    label: "Matching",
    color: "from-pink-400 to-rose-400",
    emoji: "🔗",
  },
  Comparison: {
    icon: Shuffle,
    label: "Comparison",
    color: "from-indigo-400 to-purple-400",
    emoji: "⚖️",
  },
  FillInBlanks: {
    icon: Edit3,
    label: "Fill Blanks",
    color: "from-teal-400 to-cyan-400",
    emoji: "✏️",
  },
  Dialog: {
    icon: MessageSquare,
    label: "Dialogue",
    color: "from-cyan-400 to-blue-400",
    emoji: "💬",
  },
  NumberSorting: {
    icon: Hash,
    label: "Number Sort",
    color: "from-red-400 to-orange-400",
    emoji: "🔢",
  },
  WordProblems: {
    icon: Edit3,
    label: "Word Problems",
    color: "from-emerald-400 to-green-400",
    emoji: "📝",
  },
  MathEquation: {
    icon: Calculator,
    label: "Math Equations",
    color: "from-orange-400 to-yellow-400",
    emoji: "➕",
  },
  Fraction: {
    icon: Calculator,
    label: "Fractions",
    color: "from-amber-400 to-orange-400",
    emoji: "🥧",
  },
  NumberSequence: {
    icon: Hash,
    label: "Number Sequence",
    color: "from-purple-400 to-indigo-400",
    emoji: "🔢",
  },
  SelectChoice: {
    icon: Target,
    label: "Select Choice",
    color: "from-green-400 to-teal-400",
    emoji: "✅",
  },
} as const;

export type QuestionType = keyof typeof QUESTION_TYPE_CONFIG;
