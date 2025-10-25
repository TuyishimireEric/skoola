import OpenAI from "openai";
import { NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const expectedText = formData.get("expectedText") as string;

    if (!audioFile || !expectedText) {
      return NextResponse.json({ message: "Audio and expected text are required" }, { status: 400 });
    }

    // Convert Blob to File (with a name and lastModified properties)
    const file = new File([audioFile], "recorded_audio.wav", {
      type: audioFile.type,
      lastModified: Date.now(),
    });

    // Step 1: Transcribe Audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: file, // Using File instead of Blob
      language: "en",
    });

    const spokenText = transcription.text.trim();

    // Step 2: Use GPT-4o to Evaluate Accuracy
    const prompt = `Compare the following spoken text with the expected text and rate accuracy from 0 to 100%.
    
    **Expected Text:** "${expectedText}"
    **Spoken Text:** "${spokenText}"
    
    Provide an accuracy percentage and an explanation of errors.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.3,
    });

    const result = response.choices[0]?.message.content?.trim() || "";

    return NextResponse.json(
      {
        status: "Success",
        message: "Speech evaluated successfully!",
        accuracy: result,
        spokenText, // Actual transcribed text
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Speech Evaluation Error:", error);
    return NextResponse.json({
      error: "Failed to process speech",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
