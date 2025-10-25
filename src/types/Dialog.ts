export interface DialogLineI {
  character: string;
  text: string;
  words: WordsI[];
  order: number;
  status: "pending";
  score: number;
}

export interface WordsI {
  word: string;
  status: "pending" | "correct" | "incorrect";
  wasSaid: boolean;
}
