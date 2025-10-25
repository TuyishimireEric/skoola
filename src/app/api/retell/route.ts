import type { NextApiRequest, NextApiResponse } from "next";

type RetellTokenResponse = {
  client_secret: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RetellTokenResponse | { error: string }>
) {
  try {
    const response = await fetch("https://api.retellai.com/v2/call-tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY as string}`, // keep key safe
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: "YOUR_AGENT_ID", // replace with your Retell agent ID
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Retell token:", error);
    res.status(500).json({ error: "Failed to fetch token" });
  }
}
