import {
  ComparisonQuestionI,
  MatchingPairI,
  MathQuestion,
  MissingNumberQuesI,
  MultipleChoiceQuestionI,
  NumberSortingQuestionI,
  OperatorI,
  SortingQuestionI,
} from "@/types/Course";
import { shuffleSortingArray } from "./functions";

export const formatFillInBlanks = (
  data: string
): {
  id: number;
  sentence: string;
  missingWord: string;
  hint?: string;
  originalSentence: string;
}[] => {
  if (!data || data.trim() === "") {
    // Fallback data
    data =
      "I ride my bike:ride, I go to school:go, She reads a book:reads, They play football:play, He writes a letter:writes, We eat dinner:eat";
  }

  const sentencePairs = data.replace(/"/g, "").split(", ");
  return sentencePairs.map((pair, index) => {
    const [sentence, verb] = pair.split(":");

    if (!sentence || !verb) {
      return {
        id: index,
        sentence: "Invalid sentence",
        missingWord: "error",
        originalSentence: "Invalid sentence",
      };
    }

    // Replace the verb with blanks in the sentence
    const sentenceWithBlank = sentence.replace(
      new RegExp(`\\b${verb}\\b`, "i"),
      "_________"
    );

    return {
      id: index,
      sentence: sentenceWithBlank,
      missingWord: verb,
      originalSentence: sentence,
    };
  });
};

export const formatMathQuestions = (data: string): MathQuestion[] => {
  // Handle different response formats
  let questionsStr = data;

  // Clean up string by removing extra quotes and parse into array
  questionsStr = questionsStr.replace(/"/g, "");
  const questionsArray = questionsStr.split(", ");

  const formattedQuestions: MathQuestion[] = [];

  for (const item of questionsArray) {
    try {
      const equationParts = item.split("=");

      // Skip invalid questions
      if (equationParts.length !== 2) {
        console.warn("Skipping invalid equation format:", item);
        continue;
      }

      const question = equationParts[0].trim();
      const answer = equationParts[1].trim();

      if (!question || !answer || isNaN(Number(answer))) {
        console.warn("Skipping invalid question or answer:", item);
        continue;
      }

      // Extract numbers and operator from question
      // Support multiple formats like "1+1" or "1 + 1"
      const matches = question.match(/(\d+)\s*([+\-*\/])\s*(\d+)/);

      if (!matches) {
        console.warn("Could not parse equation parts:", question);
        continue;
      }

      const [, firstNumStr, operator, secondNumStr] = matches;
      const num1 = parseInt(firstNumStr);
      const num2 = parseInt(secondNumStr);
      const result = parseInt(answer);

      // Verify all parts are valid numbers
      if (isNaN(num1) || isNaN(num2) || isNaN(result)) {
        console.warn("Invalid number in equation:", item);
        continue;
      }

      // Only select positions that hide numbers, not operators
      const positions: ("first" | "second" | "result")[] = [
        "first",
        "second",
        "result",
      ];
      const randomPosition =
        positions[Math.floor(Math.random() * positions.length)];

      let beforeInput = "";
      let afterInput = "";
      let correctAnswer = 0;

      switch (randomPosition) {
        case "first":
          beforeInput = "";
          afterInput = `${operator}${num2}=${result}`;
          correctAnswer = num1;
          break;
        case "second":
          beforeInput = `${num1}${operator}`;
          afterInput = `=${result}`;
          correctAnswer = num2;
          break;
        case "result":
        default:
          beforeInput = `${num1}${operator}${num2}=`;
          afterInput = "";
          correctAnswer = result;
          break;
      }

      formattedQuestions.push({
        originalQuestion: `${num1}${operator}${num2}=${result}`,
        beforeInput,
        afterInput,
        answer: correctAnswer,
        position: randomPosition,
      });
    } catch (error) {
      console.error("Error parsing question:", item, error);
    }
  }

  if (formattedQuestions.length === 0) {
    console.error("No valid questions could be parsed");
    return [];
  }

  return formattedQuestions;
};

export const formatComparisonQuestions = (
  data: string
): ComparisonQuestionI[] => {
  const formatted = data
    .replace(/"/g, "")
    .split(", ")
    .map((item) => {
      const [left, operator, right] = item.split(" ");
      console.log("Parsed Item", { left, operator, right });

      return {
        left: parseInt(left),
        right: parseInt(right),
        correctOperator: operator as OperatorI,
      };
    });

  console.log("Formatted Questions", formatted);

  if (formatted.length === 0) {
    return [];
  }

  if (isNaN(formatted[0].left) || isNaN(formatted[0].right)) {
    return [];
  }

  return formatted;
};

export const formatReadingQuestions = (data: string) => {
  const formattedWords = data.split(", ").map((word) => ({
    word: word.trim(),
    difficulty: word.length > 6 ? "hard" : word.length > 3 ? "medium" : "easy",
  }));

  if (formattedWords.length === 0) {
    return [];
  }

  if (!formattedWords[0].word || formattedWords[0].word === "undefined") {
    return [];
  }

  return formattedWords;
};

export const formatSelectQuestions = (
  data: string
): MultipleChoiceQuestionI[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.questions || [];
  } catch (error) {
    console.error("Error parsing question data:", error);
    return [];
  }
};

export const formatSortingQuestions = (data: string): SortingQuestionI[] => {
  const sentences = data.split(", ");
  return sentences.map((sentence, index) => {
    const words = sentence.split(" ").map((word, wordIndex) => ({
      id: `${index}-${wordIndex}`,
      text: word,
    }));

    return {
      id: index,
      originalSentence: sentence,
      words: shuffleSortingArray([...words]),
    };
  });
};

export const formatMatchinQuestions = (data: string): MatchingPairI[] => {
  try {
    const allPairs = data
      .replace(/"/g, "")
      .split(", ")
      .map((pair) => {
        const [left, right] = pair.split(":");
        return { left, right };
      });

    if (allPairs.length === 0) {
      return [];
    }

    const MAX_PAIRS = 4;

    // Limit to MAX_PAIRS
    const limitedPairs = allPairs.slice(0, MAX_PAIRS);
    return limitedPairs;
  } catch (error) {
    console.error("Error parsing matching pairs:", error);
    return [];
  }
};

export const formatDialogQuestions = (data: string) => {
  const lines = data.split(/\n/).filter((line) => line.trim() !== "");

  return lines.map((line, index) => {
    let character = "anna";
    let text = line;

    if (line.includes(":")) {
      const parts = line.split(":", 2);
      character = parts[0].trim().toLowerCase();
      text = parts[1] ? parts[1].trim() : "";
    }

    const words = text.split(/\s+/).map((word) => ({
      word: word,
      status: "pending" as const,
      wasSaid: false,
    }));

    return {
      character: character,
      text: text,
      words,
      order: index,
      status: "pending" as const,
      score: 0,
    };
  });
};

export const formatNumberSortingQuestions = (
  data: string
): NumberSortingQuestionI[] => {
  const numberGroups = data
    .split(",")
    .map((group) =>
      group
        .trim()
        .split(" ")
        .map((num) => parseInt(num.trim()))
    )
    .filter((group) => group.length > 0 && !isNaN(group[0]));

  if (numberGroups.length > 0) {
    // Create questions, alternating between ascending and descending
    return numberGroups.map((numbers, index) => ({
      id: index,
      numbers: numbers,
      orderType: index % 2 === 0 ? "ascending" : "descending",
    }));
  }

  // Default fallback
  return [
    {
      id: 0,
      numbers: [5, 2, 8, 1, 9],
      orderType: "ascending",
    },
    {
      id: 1,
      numbers: [3, 7, 4, 10, 6],
      orderType: "descending",
    },
  ];
};

export const formatMissingNumberQuestions = (
  data: string
): MissingNumberQuesI[] => {
  // Parse comma-separated groups of space-separated numbers
  const numberGroups = data
    .replace(/"/g, "")
    .split(",")
    .map((group) =>
      group
        .trim()
        .split(" ")
        .map((num) => parseInt(num.trim()))
    )
    .filter((group) => group.length > 0 && !isNaN(group[0]));

  if (numberGroups.length > 0) {
    // Create questions, removing 2-3 numbers from each sequence
    return numberGroups.map((numbers, index) => {
      const originalNumbers = [...numbers];

      // Select 2-3 indices to remove (replace with null)
      const numMissing = Math.min(Math.floor(numbers.length / 3) + 2, 3);
      const missingIndices = new Set<number>();

      while (missingIndices.size < numMissing) {
        missingIndices.add(Math.floor(Math.random() * numbers.length));
      }

      const numbersWithGaps = numbers.map((num, i) =>
        missingIndices.has(i) ? null : num
      );

      return {
        id: index,
        numbers: numbersWithGaps,
        originalNumbers,
      };
    });
  }

  // Default fallback
  return [
    {
      id: 0,
      numbers: [5, null, 15, 20, null, null],
      originalNumbers: [5, 10, 15, 20, 25, 30],
    },
    {
      id: 1,
      numbers: [4, 7, null, null, 16, null],
      originalNumbers: [4, 7, 10, 13, 16, 19],
    },
    {
      id: 2,
      numbers: [null, 12, null, 18, 24, null],
      originalNumbers: [6, 12, 18, 24, 30, 36],
    },
    {
      id: 3,
      numbers: [null, 20, null, 40, 50, null],
      originalNumbers: [10, 20, 30, 40, 50, 60],
    },
    {
      id: 4,
      numbers: [null, 27, null, 23, 21, null],
      originalNumbers: [29, 27, 25, 23, 21, 19],
    },
  ];
};
