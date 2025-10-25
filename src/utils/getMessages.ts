export const getFailureMessage = (score: number) => {
  const messages = [
    "Oops! You're just getting started. Keep listening carefully!",
    "Not quite there. Try reading the question again!",
    "Close, but not quite right. Pay attention to the details!",
    "You're on the right track. Listen one more time!",
    "Almost there! Let's try again and listen closely.",
  ];

  if (score < 30) return messages[0];
  if (score < 50) return messages[1];
  if (score < 70) return messages[2];
  return messages[3];
};
