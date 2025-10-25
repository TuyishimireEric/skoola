import { HfInference } from "@huggingface/inference";
import { NextRequest, NextResponse } from "next/server";

const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN!;
const hf = new HfInference(HF_ACCESS_TOKEN);

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { message: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert the file into an ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();

    // Transcribe audio using Hugging Face Inference API
    const result = await hf.automaticSpeechRecognition({
      model: "openai/whisper-large-v3",
      data: new Uint8Array(arrayBuffer), // Convert ArrayBuffer to Uint8Array
    });

    return NextResponse.json(
      {
        message: "success!",
        data: result,
      },
      { status: 202 }
    );
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
