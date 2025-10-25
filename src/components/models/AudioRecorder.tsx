// // app/components/AudioRecorder.tsx

// "use client";

// import React, { useState, useRef } from "react";
// import { useSpeechRecognition } from "@microsoft/speech-js";

// const AudioRecorder: React.FC = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURL, setAudioURL] = useState<string | null>(null);
//   const [transcription, setTranscription] = useState<string | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   const speechRecognition = useSpeechRecognition({
//     language: 'en-US',
//     mode: 'Interactive'
//   });

//   const startRecording = async () => {
//     try {
//       await speechRecognition.startListening();

//       speechRecognition.onSpeechStart = () => {
//         setIsRecording(true);
//       };

//       speechRecognition.onSpeechEnd = async () => {
//         setIsRecording(false);
//         await stopRecording();
//       };
//     } catch (error) {
//       console.error("Error starting audio recording:", error);
//       setIsRecording(false);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await speechRecognition.stopListening();

//       const audioBlob = new Blob(speechRecognition.audioData, { type: 'audio/wav' });
//       setAudioURL(URL.createObjectURL(audioBlob));

//       // Send the audio blob to the server for transcription
//       const formData = new FormData();
//       formData.append('audio', audioBlob);

//       const response = await fetch('/api/transcribe', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
      
//       if (result.transcription) {
//         setTranscription(result.transcription);
//       } else if (result.error) {
//         console.error(result.error);
//         setTranscription(null);
//       }
//     } catch (error) {
//       console.error("Error stopping audio recording or transcribing:", error);
//       setTranscription(null);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <button
//         onClick={isRecording ? stopRecording : startRecording}
//         className={`px-4 py-2 rounded ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
//       >
//         {isRecording ? "Stop Recording" : "Start Recording"}
//       </button>

//       {audioURL && (
//         <div>
//           <p>Recorded Audio:</p>
//           <audio src={audioURL} controls />
//         </div>
//       )}

//       {transcription && (
//         <div>
//           <p>Transcription:</p>
//           <p className="mt-2 p-2 bg-gray-100 rounded">{transcription}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AudioRecorder;
