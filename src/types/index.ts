export * from "./User";
export * from "./Role";
export * from "./Organization";
export * from "./Contact";

export interface WordPerformance {
  word: string;
  correct: boolean;
  similarity: number;
}

export interface TestResult {
  totalWords: number;
  correctWords: number;
  accuracy: number;
  wordPerformance: WordPerformance[];
}
