// Levenshtein Distance function to calculate similarity between words
const getLevenshteinDistance = (a: string, b: string): number => {
  const dp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Deletion
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return dp[a.length][b.length];
};

export interface TextAccuracyResult {
  percentage: number;
  orderPercentage: number;
  missedWords: string[];
  extraWords: string[];
  totalWords: number;
  correctWords: number;
}

export const calculateTextAccuracy = (
  original: string,
  spoken: string,
  toleranceThreshold: number = 2 // Tolerance threshold for Levenshtein distance
): TextAccuracyResult => {
  // Normalization function
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,?!]/g, "")
      .split(/\s+/)
      .filter((word) => word.trim() !== "");

  // Normalize words
  const originalWords = normalizeText(original);
  const spokenWords = normalizeText(spoken);

  // Tracking variables
  const missedWords: string[] = [];
  const extraWords: string[] = [];
  const matchedWords: string[] = [];

  // Find matched, missed, and extra words using Levenshtein distance for tolerance
  const spokenWordsCopy = [...spokenWords];
  originalWords.forEach((originalWord) => {
    const match = spokenWordsCopy.find((spokenWord) => {
      const distance = getLevenshteinDistance(originalWord, spokenWord);
      return distance <= toleranceThreshold; // If distance is below threshold, treat as a match
    });

    if (match) {
      matchedWords.push(originalWord);
      // Remove the matched word to handle duplicates
      spokenWordsCopy.splice(spokenWordsCopy.indexOf(match), 1);
    } else {
      missedWords.push(originalWord);
    }
  });

  // Remaining words in spokenWordsCopy are extra words
  extraWords.push(...spokenWordsCopy);

  // Total words in the original text
  const totalWords = originalWords.length;
  const correctWords = matchedWords.length;

  // Percentage calculations
  // Accuracy is based on matched words relative to original text
  const contentAccuracyPercentage = (correctWords / totalWords) * 100;

  // Order accuracy calculation
  const orderComparison = originalWords.map((word) =>
    spokenWords.indexOf(word)
  );

  // Check if the order of found words is maintained
  let isOrderMaintained = true;
  let lastValidIndex = -1;
  for (let i = 0; i < orderComparison.length; i++) {
    if (orderComparison[i] !== -1) {
      if (orderComparison[i] < lastValidIndex) {
        isOrderMaintained = false;
        break;
      }
      lastValidIndex = orderComparison[i];
    }
  }

  // Order percentage
  const orderPercentage = isOrderMaintained
    ? 100
    : Math.max(0, (matchedWords.length / totalWords) * 100 * 0.7);

  // Penalty calculations
  // Penalize missed and extra words
  const extraWordPenalty = (extraWords.length / totalWords) * 20; // 20% max penalty for extra words

  // Final accuracy calculation
  const finalAccuracyPercentage = Math.max(
    0,
    contentAccuracyPercentage - extraWordPenalty
  );

  return {
    percentage: Number(finalAccuracyPercentage.toFixed(2)),
    orderPercentage: Number(orderPercentage.toFixed(2)),
    missedWords,
    extraWords,
    totalWords,
    correctWords,
  };
};
