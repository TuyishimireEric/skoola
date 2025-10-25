export interface KidProfileDataI {
  id: string;
  name: string;
  age: number;
  level: number;
  totalStars: number;
  coursesCompleted: number;
  currentStreak: number;
  avatar: string;
  avatarType: "emoji" | "custom";
  customAvatar: string | null;
  nextReward: string;
  progressToNextLevel: number;
  weeklyCompleted: number;
  rank: string;
  todayMinutes: number;
  imageUrl: string | null;
  userNumber: number | null;
}

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalStudents: number;
  weeklyLearningMinutes: number;
  totalStarsEarned: number;
  averageProgress: number;
  familyStreak: number;
  avatar: string;
  plan: "free" | "premium";
}

export interface WeeklyActivityData {
  day: string;
  student1: number;
  student2: number;
  student1Name: string;
  student2Name: string;
}

export interface SubjectPerformanceData {
  subject: string;
  student1Score: number;
  student2Score: number;
  student1Trend: number;
  student2Trend: number;
  icon: string;
}

export interface RecentActivityData {
  id: number;
  studentName: string;
  activity: string;
  score: string;
  time: string;
  icon: string;
  color: string;
}

export interface ParentDashboardData {
  parentProfile: ParentProfile;
  students: KidProfileDataI[];
  weeklyActivity: WeeklyActivityData[];
  subjectPerformance: SubjectPerformanceData[];
  recentActivity: RecentActivityData[];
  familyStats: {
    totalStreak: number;
    totalStars: number;
    totalCourses: number;
    averageLevel: number;
    weeklyMinutes: number;
  };
}

export type DateFilterType = "7d" | "30d" | "last_month" | "custom";

export interface ParentDashboardFilters {
  dateRange: DateFilterType;
  fromDate?: string;
  toDate?: string;
}

export interface ParentInfoResult {
  id: string;
  fullName: string | null;
  email: string | null;
  imageUrl: string | null;
  createdOn: Date | null;
}

export interface StudentInfoResult {
  id: string;
  fullName: string | null;
  dateOfBirth: string | null;
  imageUrl: string | null;
}

export interface StudentStatsResult {
  studentId: string;
  totalStars: number;
  coursesCompleted: number;
  totalGames: number;
  weeklyCompleted: number;
  weeklyMinutes: number;
  todayMinutes: number;
  todayStreak: number;
  lastStreak: number;
  lastPlayed: string | null;
}

export interface DailyActivityResult {
  studentId: string;
  date: string;
  dailyMinutes: number;
}

export interface RecentGameResult {
  studentId: string;
  gameId: string | null;
  score: string | null;
  stars: number | null;
  startedOn: string | null;
  completedOn: string | null;
}
