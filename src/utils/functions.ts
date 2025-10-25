import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateNiceMaxValue(maxValue: number): number {
  if (maxValue <= 0) return 10; // Default for no data or negative values

  // Calculate a nice ceiling value
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;

  // Round up to a nice number (1, 2, 2.5, 5, 10) multiplied by the magnitude
  let niceMax;
  if (normalized <= 1) {
    niceMax = 1 * magnitude;
  } else if (normalized <= 2) {
    niceMax = 2 * magnitude;
  } else if (normalized <= 2.5) {
    niceMax = 2.5 * magnitude;
  } else if (normalized <= 5) {
    niceMax = 5 * magnitude;
  } else {
    niceMax = 10 * magnitude;
  }

  // Add a bit of padding (10%)
  return Math.ceil(niceMax * 1.1);
}

export function calculateOptimalTickCount(height: number): number {
  // For every 50px of height, we want approximately 1 tick
  // with some constraints for minimum and maximum
  const baseTicks = Math.floor(height / 50);
  return Math.max(3, Math.min(10, baseTicks));
}

export const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper function to generate a complete date range
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Helper function to format date as DD/MM/YYYY
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function shortDate(date: string): string {
  if (!date || typeof date !== "string") {
    return "Invalid Date";
  }

  let parsedDate: Date | null = null;

  // Try parsing custom DD/MM/YY format
  const parts = date.trim().split("/");
  if (parts.length === 3) {
    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10) + (yearStr.length === 2 ? 2000 : 0);

    parsedDate = new Date(year, month, day);
  } else {
    // Try parsing as ISO format or other recognized formats
    parsedDate = new Date(date);
  }

  // Validate parsed date
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }

  const formattedDay = String(parsedDate.getDate()).padStart(2, "0");
  const monthShort = parsedDate.toLocaleString("default", { month: "short" });

  return `${formattedDay} ${monthShort}`;
}

export const shuffleArray = (text: string[]) => {
  const newArray = [...text];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const shuffleSortingArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const DATE = (
  data: string,
  format: "DD/MM/YYYY" | "YYYY/MM/DD" | "MM/DD/YYYY" = "DD/MM/YYYY"
): string => {
  const date = new Date(data);
  if (format === "YYYY/MM/DD") {
    return (
      date.getFullYear() +
      "-" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "-" +
      (date.getDate() < 10 ? "0" : "") +
      date.getDate()
    );
  } else if (format === "MM/DD/YYYY") {
    return (
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "/" +
      (date.getDate() < 10 ? "0" : "") +
      date.getDate() +
      "/" +
      date.getFullYear()
    );
  } else {
    return (
      (date.getDate() < 10 ? "0" : "") +
      date.getDate() +
      "/" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "/" +
      date.getFullYear()
    );
  }
};

export const timestampToDate = (
  thisTimestamp: string | number | Date
): { fullDATE: string; date: string; timeFR: string; timeAMPM: string } => {
  const date = new Date(thisTimestamp);
  const hours: number = date.getHours();
  const minutes = "0" + date.getMinutes();

  const ampm: "pm" | "am" = hours >= 12 ? "pm" : "am";
  let _hours: number = hours % 12;
  _hours = _hours ? _hours : 12; // the hour '0' should be '12'

  // Will display time in 10:30:23 format
  return {
    fullDATE: date.toString(),
    date: DATE(date.toString()),
    timeFR: hours + ":" + minutes.substr(-2),
    timeAMPM: _hours + ":" + minutes.substr(-2) + " " + ampm,
  };
};

export const timeFromNow = (date: Date | string): string => {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - inputDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hr ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

export const getAge = (date: Date | string): number => {
  const birthDate = new Date(date);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();

  // Adjust if birthday hasn't occurred this year yet
  if (
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Check if age falls within age group range (e.g., "5-8", "6-8", "7-9", "10-11")
 */
export function isAgeInGroup(age: number, ageGroup: string): boolean {
  if (!ageGroup || !ageGroup.includes("-")) return false;

  const [minAge, maxAge] = ageGroup.split("-").map(Number);
  return age >= minAge && age <= maxAge;
}

export const getBirthdateFromAge = (age: number): string => {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const birthMonth = today.getMonth(); // same month as today
  const birthDay = today.getDate(); // same day as today

  const birthDate = new Date(birthYear, birthMonth, birthDay);

  return birthDate.toISOString();
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let result = "";

  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (secs > 0 || result === "") result += `${secs}s`;

  return result.trim();
};

export function generateUserCode(fullName: string): string {
  // Get first two letters of the name after trimming
  const trimmedName = fullName.trim();
  const firstLetter = trimmedName.substring(0, 2).toUpperCase();

  // Generate a random number between 1 and 999
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  // Pad to ensure 3 digits
  const paddedNum = randomNum.toString().padStart(4, "0");

  return `${firstLetter}${paddedNum}`;
}

// Animation variants for better performance
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInVariants = {
  left: { opacity: 0, x: -30 },
  right: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

// Helper function to map language names to language codes
export const mapLanguageToCode = (language: string): string => {
  const languageMap: { [key: string]: string } = {
    English: "en",
    Spanish: "es",
    French: "fr",
    German: "de",
    Italian: "it",
    Portuguese: "pt",
    Russian: "ru",
    Chinese: "zh",
    Japanese: "ja",
    Korean: "ko",
    Arabic: "ar",
    Hindi: "hi",
    Dutch: "nl",
    Swedish: "sv",
    Norwegian: "no",
    Danish: "da",
    Finnish: "fi",
    Polish: "pl",
    Turkish: "tr",
    Greek: "el",
    Hebrew: "he",
    Thai: "th",
    Vietnamese: "vi",
    Indonesian: "id",
    Malay: "ms",
    Filipino: "fil",
    Swahili: "sw",
    Urdu: "ur",
    Bengali: "bn",
    Tamil: "ta",
    Telugu: "te",
    Gujarati: "gu",
    Marathi: "mr",
    Punjabi: "pa",
    Malayalam: "ml",
    Kannada: "kn",
    Oriya: "or",
    Assamese: "as",
    Nepali: "ne",
    Sinhala: "si",
    Burmese: "my",
    Khmer: "km",
    Lao: "lo",
    Mongolian: "mn",
    Kazakh: "kk",
    Kyrgyz: "ky",
    Tajik: "tg",
    Turkmen: "tk",
    Uzbek: "uz",
    Armenian: "hy",
    Georgian: "ka",
    Azerbaijani: "az",
    Albanian: "sq",
    Serbian: "sr",
    Croatian: "hr",
    Bosnian: "bs",
    Slovenian: "sl",
    Slovak: "sk",
    Czech: "cs",
    Hungarian: "hu",
    Romanian: "ro",
    Bulgarian: "bg",
    Macedonian: "mk",
    Estonian: "et",
    Latvian: "lv",
    Lithuanian: "lt",
    Icelandic: "is",
    Irish: "ga",
    Welsh: "cy",
    "Scottish Gaelic": "gd",
    Basque: "eu",
    Catalan: "ca",
    Galician: "gl",
    Maltese: "mt",
    Luxembourgish: "lb",
    Afrikaans: "af",
    Zulu: "zu",
    Xhosa: "xh",
    Sesotho: "st",
    Setswana: "tn",
    Sepedi: "nso",
    Venda: "ve",
    Tsonga: "ts",
    Swati: "ss",
    Ndebele: "nr",
    Amharic: "am",
    Tigrinya: "ti",
    Oromo: "om",
    Somali: "so",
    Hausa: "ha",
    Yoruba: "yo",
    Igbo: "ig",
    Fulani: "ff",
    Akan: "ak",
    Ewe: "ee",
    Ga: "gaa",
    Lingala: "ln",
    Kikongo: "kg",
    Tshiluba: "lu",
    Shona: "sn",
    Chewa: "ny",
    Bemba: "bem",
    Luo: "luo",
    Kikuyu: "ki",
    Kinyarwanda: "rw",
    Kirundi: "rn",
    Luganda: "lg",
    Wolof: "wo",
    Malagasy: "mg",
    Cebuano: "ceb",
    Hiligaynon: "hil",
    Waray: "war",
    Bicolano: "bcl",
    Pangasinan: "pag",
    Kapampangan: "pam",
    Ilocano: "ilo",
    Maranao: "mrw",
    Maguindanao: "mdh",
    Tausug: "tsg",
    Chavacano: "cbk",
    "Kinaray-a": "krj",
  };

  return languageMap[language] || language.toLowerCase().substring(0, 2);
};
