export interface ReportI {
  studentName: string;
  parentEmail: string | null;
  parentName: string | null;
  courseSubject: string;
  totalSections: number;
  highestScore: number | null;
  coursesStudied: string;
  dailyAverageScore: number;
  missedQuestions: string;
  timeSpentLearning: string;
  levelsCompleted: number;
}

export interface DailyTimeDataI {
  date: string;
  minutes: number;
}

export interface StudentPerformanceI {
  id: string;
  name: string;
  avgScore: number;
  totalTimeSpent: number;
  completed: number;
}

export interface CourseSectionReportI {
  dailyTimeData: DailyTimeDataI[];
  studentPerformances: StudentPerformanceI[];
}
