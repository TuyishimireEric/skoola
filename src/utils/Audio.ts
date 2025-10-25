interface AudioMap {
  [key: string]: string;
}

const audioFiles: AudioMap = {
  keepPracticing:
    "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1744104357/Audios/KeepPlacticing_j9fmrw.mp4",
  welcomeStudent:
    "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1744104357/Audios/Welcome_student_cid6qu.mp4",
  counter:
    "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1744104357/Audios/3_2_1_sr8ev4.mp4",
  congratulations:
    "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1744104357/Audios/Congratulations_kylg3j.mp4",
  great:
    "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1750873862/Audios/Great_msfilp.mp3",
  wrong:
    "https://res.cloudinary.com/dn8vyfgnl/video/upload/v1744105136/Audios/Wrong_x5etcb.mp4",
};

// Audio element to reuse
let audioElement: HTMLAudioElement | null = null;

/**
 * Plays an audio file based on the provided name
 * @param soundName The name of the sound to play
 */
export const speak = (soundName: string): void => {
  // Get the URL for the sound
  const audioUrl = audioFiles[soundName];

  if (!audioUrl) {
    console.error(`Audio file not found for: ${soundName}`);
    return;
  }

  // Create the audio element if it doesn't exist
  if (!audioElement) {
    audioElement = new Audio();
  }

  // Stop any currently playing audio
  audioElement.pause();
  audioElement.currentTime = 0;

  // Set new source and play
  audioElement.src = audioUrl;

  audioElement.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
};
