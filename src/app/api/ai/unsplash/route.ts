import { createClient } from "pexels";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "Nature"; 

  const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: "PEXELS_API_KEY is missing" }, { status: 500 });
  }

  try {
    const client = createClient(PEXELS_API_KEY);
    console.log("query", query);
    const photos = await client.photos.search({ query, per_page: 1 });

    return NextResponse.json(photos);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
