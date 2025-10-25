import { calculateTextAccuracy } from "@/utils/textUtils";
import { HfInference } from "@huggingface/inference";
import { NextRequest, NextResponse } from "next/server";

const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN!;
const hf = new HfInference(HF_ACCESS_TOKEN);

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.json();

    const { answer, myAnswer, keyWords } = formData;

    const keywordsMatched = keyWords?.filter((keyword: string) =>
      myAnswer.toLowerCase().includes(keyword.toLowerCase())
    );

    const keywordScore = (keywordsMatched.length / keyWords.length) * 100;

    // Compute sentence similarities
    const similarity = await hf.sentenceSimilarity({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: {
        source_sentence: answer,
        sentences: [myAnswer],
      },
    });

    const sentenceSimilarityScore = similarity[0] * 100;

    const { percentage } = calculateTextAccuracy(answer, myAnswer);

    const totalScore =
      keywordScore * 0.4 +
      sentenceSimilarityScore * 0.4 +
      percentage * 0.2;

    // Sort similarities in descending order
    return NextResponse.json(
      {
        message: "Sentence similarities computed successfully!",
        reference: answer,
        data: totalScore,
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
