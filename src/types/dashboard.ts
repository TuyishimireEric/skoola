export interface TeacherDashboardStatsI {
  totalStudents: number;
  dailyUsers: number;
  totalCourses: number;
  topStudents: {
    studentId: string;
    studentName: string;
    totalScore: string;
  }[];
}

export interface AdminDashboardStatsI {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  dailyTimeSpent: string[];
  averageScore: string;
}

export interface StudentStatsI {
  studentId: string;
  fullName: string;
  imageUrl: null;
  dateOfBirth: string;
  parentEmail: string;
  parentName: string;
  currentClass: number;
  courseCount: string;
  averageScore: string;
  totalTimeSpent: string;
  lastCourseDate: string;
}

// Additional interfaces needed for dynamic dashboard

// Performance Alerts
export interface PerformanceAlertI {
  type: "warning" | "success" | "info" | "danger";
  message: string;
  count: number;
  iconType: string; // Store icon identifier as string
}

// Grade Performance (Pie Chart)
export interface GradePerformanceI {
  gradeName: string;
  gradeNumber: number;
  studentCount: number;
  percentage: number;
  color: string;
}

// Student Ranking
export interface StudentRankingI {
  studentId: string;
  name: string;
  points: number;
  avatar: string;
  rank: number;
}

// Best Performance Subjects
export interface BestPerformanceI {
  subjectName: string;
  averageScore: number;
  icon: string; // emoji or icon identifier
  totalStudents: number;
}

// Improvement Areas
export interface ImprovementAreaI {
  skillName: string;
  accuracy: number;
  exerciseCount: number;
  studentCount: number;
  subject?: string;
}

// Course Summary
export interface CourseSummaryI {
  courseId: string;
  courseName: string;
  totalLevels: number;
  completedLevels: number;
  progress: number;
  enrolledStudents: number;
  averageScore: number;
  lastActivity: string;
}

// Recent Activities
export interface RecentActivityI {
  activityId: string;
  studentName: string;
  courseName: string;
  level: number;
  score: number;
  date: string;
  activityType: "completed" | "started" | "retaken";
}

// Subject Performance
export interface SubjectPerformanceI {
  subject: string;
  subjectName: string;
  averageScore: number;
  totalStudents: number;
  completionRate: number;
  totalActivities: number;
}

// Filter Options
export interface FilterOptionsI {
  grades: GradeOptionI[];
  subjects: SubjectOptionI[];
  dateRanges: DateRangeOptionI[];
}

export interface GradeOptionI {
  id: string;
  name: string;
  gradeNumber: number;
  studentCount: number;
}

export interface SubjectOptionI {
  id: string;
  name: string;
  courseCount: number;
}

export interface DateRangeOptionI {
  label: string;
  value: string;
  days: number;
}

// Enhanced Dashboard Stats (Core Stats + Trends)
export interface EnhancedDashboardStatsI extends AdminDashboardStatsI {
  // Additional stats
  attendanceRate: number;
  engagementScore: number;
  completionRate: number;
  activeToday: number;

  // Trends data
  trends: {
    courses: TrendI;
    teachers: TrendI;
    students: TrendI;
    scores: TrendI;
  };
}

// Dashboard Lists (All dynamic lists/charts data)
export interface DashboardListsI {
  performanceAlerts: PerformanceAlertI[];
  gradePerformance: GradePerformanceI[];
  studentRanking: StudentRankingI[];
  bestPerformance: BestPerformanceI[];
  improvementAreas: ImprovementAreaI[];
}

export interface TrendI {
  direction: "up" | "down" | "stable";
  value: number;
  percentage?: number;
}

// API Filter Parameters
export interface DashboardFiltersI {
  gradeId?: string;
  subject?: string;
  dateRange: string;
  organizationId: string;
}

// Chart Data
export interface ChartDataI {
  date: string;
  value: number;
  label?: string;
}

// Weekly Data for charts
export interface WeeklyDataI {
  label: string;
  value: number;
  date: string;
}

// Parent Corner Data
export interface ParentCornerI {
  totalParents: number;
  activeParents: number;
  parentEngagementRate: number;
  recentParentActivities: ParentActivityI[];
  parentFeedback: ParentFeedbackI[];
}

export interface ParentActivityI {
  parentId: string;
  parentName: string;
  activityType: "login" | "message" | "report_view" | "meeting_request";
  timestamp: string;
  studentName: string;
}

export interface ParentFeedbackI {
  feedbackId: string;
  parentName: string;
  rating: number;
  comment: string;
  date: string;
  category: "general" | "teacher" | "curriculum" | "platform";
}

// Additional Support Data
export interface AdditionalSupportI {
  studentId: string;
  studentName: string;
  supportType: "academic" | "behavioral" | "attendance" | "engagement";
  priority: "high" | "medium" | "low";
  description: string;
  assignedTeacher: string;
  dateReported: string;
  status: "pending" | "in_progress" | "resolved";
}

type DailyStats = Record<
  string,
  { totalTime: number | string; averageScore: number | string }
>;

export interface StudentStats {
  studentId: string;
  studentName: string;
  imageUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  totalCourses: string;
  totalScore: string;
  averageScore: number;
}

export interface LatestSection {
  GameTitle: string;
  score: number;
  missedQuestions: string;
  completedOn: string;
}

export interface StudentDashboardStatsI {
  dailyStats: DailyStats;
  studentStats: StudentStats;
  latestSections: LatestSection[];
  topStudents: {
    studentId: string;
    studentName: string;
    totalScore: string;
  }[];
}

export interface DailyStarProgress {
  [date: string]: {
    [studentName: string]: number; // totalStars
  };
}

// Simplified subject performance type
export interface SubjectPerformance {
  english: number;
  mathematics: number;
  sciences: number;
  studentId: string;
  studentName: string;
}

// Updated analytics data interface
export interface StudentAnalyticsData {
  dailyProgress: DailyStarProgress;
  subjectPerformance: SubjectPerformance[];
}

// Filter type enum
export type AnalyticsFilter = "7d" | "30d" | "last_month";
