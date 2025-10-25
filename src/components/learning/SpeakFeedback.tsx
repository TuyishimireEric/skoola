// Voice feedback function
export const speakFeedback = (text: string) => {
  // Create a speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);
  // Set properties for the voice
  utterance.rate = 1.0; // Speed of speech (0.1 to 10)
  utterance.pitch = 1.0; // Pitch of voice (0 to 2)
  utterance.volume = 1.0; // Volume (0 to 1)

  // Cancel any current speech
  window.speechSynthesis.cancel();

  // Speak the text immediately
  window.speechSynthesis.speak(utterance);
};
