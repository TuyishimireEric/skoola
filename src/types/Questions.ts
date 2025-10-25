export type QuestionType =
  | "MissingNumber"
  | "Comparison"
  | "NumberSequence"
  | "MathEquation"
  | "ImageBased"
  | "Fraction"
  | "SelectChoice"
  | "WordProblems"
  | "FillInTheBlank"
  | "SentenceSorting"
  | "Reading";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type MediaType = "Image" | "Video" | "Audio" | "Text" | "text" | "None";

export interface QuestionDataI {
  Id?: string;
  QuestionText: string;
  QuestionType: QuestionType | string;
  MediaType: string;
  MediaUrl?: string;
  Options?: string;
  CorrectAnswer?: string;
  Explanation?: string;
  Difficulty: string;
  Language: string;
  GameId: string;
  IsApproved?: boolean;
}

export interface FillInTheBlankData {
  question: string;
  options: string[];
  correctAnswers: string[];
  blanksCount: number;
}

export interface MathQuestionInput {
  equation: string;
  explanation: string;
  difficulty: DifficultyLevel;
}

export function isQuestionType(type: string): type is QuestionType {
  return [
    "MissingNumber",
    "Comparison",
    "NumberSequence",
    "MathEquation",
    "ImageBased",
    "Fraction",
    "SelectChoice",
    "WordProblems",
    "FillInTheBlank",
    "SentenceSorting",
    "Reading",
  ].includes(type);
}

export function isMediaType(type: string): type is MediaType {
  return ["Image", "Video", "Audio", "Text", "text", "None"].includes(type);
}

export function isDifficultyLevel(type: string): type is DifficultyLevel {
  return ["easy", "medium", "hard"].includes(type);
}
