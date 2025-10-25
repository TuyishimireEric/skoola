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
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ message: "Valid prompt is required" }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const result = response.choices[0]?.message.content?.trim() || "";
    return NextResponse.json(
      {
        status: "Success",
        message: "Responded successfully!",
        data: result,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({
      error: "Failed to generate text from OpenAI",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}