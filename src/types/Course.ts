import { z } from "zod";

export interface GameDataI {
  Id?: string;
  Title: string;
  Description?: string;
  Topic?: string;
  ImageUrl: string;
  TutorialVideo?: string;
  GameLevel?: number;
  Subject?: string;
  Prompt?: string;
  Status: "Draft" | "Published" | "Archived";
  StartDate?: Date;
  EndDate?: Date;
  Duration?: number;
  Language?: string;
  PassScore?: number;
  Retakes?: number;
  Tags?: string;
  SingleResponse?: boolean;
  QuestionsPerPage?: number;
  NumberOfQuestions?: number;
  NumberOfLevels?: number;
  OrganizationId: string;
  Type: string;
  Grade?: number;
  AgeGroup?: string;
  TotalStudents?: number;
  CompletedLevels?: number;
  CourseAverageAttendance?: number;
  GameModerator?: {
    fullName: string;
    Image: string | "";
  } | null;
  StudentsAttended?: string;
  CompletionRate?: string;
  AverageRating?: string;
  TotalLikes?: string;
}

export interface GameTypeI {
  Id: number;
  Name: string;
  AIGenerated: boolean;
  Subject: string | null;
  gameFormat: string;
}

export const gameSchema = z.object({
  Id: z.string().optional(),
  Title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters long")
    .max(255, "Title must be at most 255 characters long"),
  Description: z.string().optional(),
  Instructions: z.string().optional(),
  ImageUrl: z
    .string({ required_error: "Image URL is required" })
    .url("Invalid image URL format"),
  TutorialVideo: z.string().url("Invalid video URL format").optional(),
  GameLevel: z
    .number({ required_error: "Grade is required" })
    .int("Grade must be an integer")
    .positive("Grade must be a positive number")
    .optional(),
  Subject: z.string().optional(),
  Status: z.enum(["Draft", "Published", "Archived"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be one of: Draft, Published, or Archived",
  }),
  StartDate: z.date().optional(),
  EndDate: z.date().optional(),
  Duration: z
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be a positive number")
    .optional(),
  PassScore: z
    .number()
    .int("Pass score must be an integer")
    .min(0, "Pass score must be at least 0")
    .max(100, "Pass score must be at most 100")
    .optional(),
  Retakes: z
    .number()
    .int("Number of retakes must be an integer")
    .min(0, "Number of retakes must be at least 0")
    .optional(),
  Tags: z.string().optional(),
  SingleResponse: z.boolean({
    required_error: "Single response field is required",
  }),
  QuestionsPerPage: z
    .number()
    .int("Questions per page must be an integer")
    .positive("Questions per page must be a positive number")
    .optional(),
  NumberOfQuestions: z
    .number()
    .int("Number of questions must be an integer")
    .positive("Number of questions must be a positive number")
    .optional(),
  NumberOfLevels: z
    .number()
    .int("Number of levels must be an integer")
    .positive("Number of levels must be a positive number")
    .optional(),
  Type: z.string({ required_error: "Course type is required" }),
});

export type GameData = z.infer<typeof gameSchema>;

export interface SubjectI {
  Id: string;
  Name: string;
}

export interface CourseDetailsI {
  Id: string;
  Title: string;
  Description: string;
  ImageUrl: string;
  AgeGroup: string;
  Subject: string;
  Status: "Draft" | "Published" | "Archived";
  StartDate: Date | null;
  EndDate: Date | null;
  PreliminaryTest: boolean;
  moderator?: {
    Access: "Admin" | "Trainer" | "Tester";
  };
}

export interface CourseLevelI {
  Id: string;
  Order: number;
  Title: string;
  Description: string;
  LevelType: string;
}

export interface CourseSectionI {
  Id?: string;
  StudentId: string;
  GameId: string;
  GameType: string;
  GameTitle: string;
  Score: string;
  MissedQuestions: string;
  StartedOn: string;
  CompletedOn: string;
  Stars: number;
}

export const courseSectionSchema = z.object({
  StudentId: z.string(),
  GameId: z.string(),
  Score: z.string(),
  GameType: z.string(),
  GameTitle: z.string(),
  MissedQuestions: z.string(),
  StartedOn: z.string(),
  CompletedOn: z.string(),
  Stars: z.number(),
});

// Interface for recommendation result
export interface RecommendedCourseI {
  id: number;
  GameId: string;
  title: string;
  status?: string;
  stars?: number;
  maxStars?: number;
  difficulty: string;
  estimatedTime: string;
  subject: string;
  emoji: string;
}

export interface RecommendedCourseResultI {
  GameId: string;
  stars: number;
}

export interface MathQuestion {
  originalQuestion: string;
  beforeInput: string;
  afterInput: string;
  answer: number;
  position: "first" | "second" | "result";
}

export type OperatorI = "<" | ">" | "=";

export interface ComparisonQuestionI {
  left: number;
  right: number;
  correctOperator: OperatorI;
}

export interface MultipleChoiceQuestionI {
  question: string;
  options: string[];
  answer: string;
}

export interface SortingQuestionI {
  id: number;
  originalSentence: string;
  words: Array<{ id: string; text: string }>;
}

export interface MatchingPairI {
  left: string;
  right: string;
}

export interface NumberSortingQuestionI {
  id: number;
  numbers: Array<number>;
  orderType: "ascending" | "descending";
}

export interface MissingNumberQuesI {
  id: number;
  numbers: Array<number | null>;
  originalNumbers: Array<number>;
}

export interface LeaderBoardI {
  completedOn: string;
  profilePicture: string;
  id: string;
  name: string;
  score: number;
  totalPoints: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
}

export const courseStatusEnum = z.enum(["Draft", "Published", "Archived"]);

export const courseSchema = z.object({
  Id: z.string().uuid().optional(),
  Title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  Description: z.string().max(1000, "Description is too long").optional(),
  ImageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  Grade: z.string().min(1, "Grade is required"),
  Subject: z.string().max(100, "Subject is too long").optional(),
  Status: courseStatusEnum.default("Draft"),
  Order: z.number().int().min(0).default(0),
  IsActive: z.boolean().default(true),
  OrganizationId: z.string().uuid().optional(),
});

export const coursePerformanceSchema = z.object({
  Id: z.string().uuid().optional(),
  CourseId: z.string().uuid("Invalid course ID"),
  StudentId: z.string().uuid("Invalid student ID"),
  Assignment1: z.number().min(0).max(100).optional().nullable(),
  Assignment2: z.number().min(0).max(100).optional().nullable(),
  CAT: z.number().min(0).max(100).optional().nullable(),
  Exam: z.number().min(0).max(100).optional().nullable(),
  Total: z.number().min(0).max(100).optional().nullable(),
  Grade: z.string().max(2).optional().nullable(),
  Remarks: z.string().max(500).optional().nullable(),
  Term: z.string().optional(),
  AcademicYear: z.string().optional(),
  OrganizationId: z.string().uuid().optional(),
});

export const bulkPerformanceSchema = z.object({
  CourseId: z.string().uuid("Invalid course ID"),
  Term: z.string().min(1, "Term is required"),
  AcademicYear: z.string().min(1, "Academic year is required"),
  Performances: z.array(
    z.object({
      StudentId: z.string().uuid("Invalid student ID"),
      Assignment1: z.number().min(0).max(100).optional().nullable(),
      Assignment2: z.number().min(0).max(100).optional().nullable(),
      CAT: z.number().min(0).max(100).optional().nullable(),
      Exam: z.number().min(0).max(100).optional().nullable(),
      Remarks: z.string().max(500).optional().nullable(),
    })
  ).min(1, "At least one performance record is required"),
});

export type CourseStatus = z.infer<typeof courseStatusEnum>;
export type CourseInput = z.infer<typeof courseSchema>;
export type CoursePerformanceInput = z.infer<typeof coursePerformanceSchema>;
export type BulkPerformanceInput = z.infer<typeof bulkPerformanceSchema>;

export interface CourseDataI {
  Id?: string;
  Title: string;
  Description?: string;
  ImageUrl?: string;
  Grade: string;
  Subject?: string;
  Status: CourseStatus;
  Order?: number;
  IsActive?: boolean;
  OrganizationId: string;
  CreatedBy?: string;
  UpdatedBy?: string;
  CreatedOn?: string;
  UpdatedOn?: string;
  // Additional fields from joins
  CreatorName?: string;
  CreatorImage?: string;
  TotalStudents?: number;
  AveragePerformance?: number;
}

export interface CoursePerformanceDataI {
  Id?: string;
  CourseId: string;
  StudentId: string;
  Assignment1?: number | null;
  Assignment2?: number | null;
  CAT?: number | null;
  Exam?: number | null;
  Total?: number | null;
  Grade?: string | null;
  Remarks?: string | null;
  Term?: string;
  AcademicYear?: string;
  OrganizationId: string;
  CreatedBy?: string;
  UpdatedBy?: string;
  CreatedOn?: string;
  UpdatedOn?: string;
  // Additional fields from joins
  StudentName?: string;
  StudentGrade?: string;
  StudentAvatar?: string;
  CourseName?: string;
  CourseSubject?: string;
}

export interface StudentPerformanceSummaryI {
  StudentId: string;
  StudentName: string;
  StudentGrade: string;
  StudentAvatar?: string;
  Courses: Array<{
    CourseId: string;
    CourseName: string;
    Subject: string;
    Assignment1?: number | null;
    Assignment2?: number | null;
    CAT?: number | null;
    Exam?: number | null;
    Total?: number | null;
    Grade?: string | null;
  }>;
  OverallAverage: number;
  TotalCourses: number;
}