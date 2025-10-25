"use client";
import { useState } from "react";
// Import the Retell Web SDK types
import { RetellWebSDK, RetellCall } from "retell-sdk";

export default function TalkToAgentButton() {
  const [call, setCall] = useState<RetellCall | null>(null);

  const startCall = async () => {
    try {
      const res = await fetch("/api/get-retell-token");
      const { client_secret } = (await res.json()) as { client_secret: string };

      const newCall = await RetellWebSDK.startCall({
        call_token: client_secret,
        element: document.body, // attach Retell’s mini call UI
      });

      newCall.on("connected", () => console.log("✅ Connected to AI agent"));
      newCall.on("disconnected", () => console.log("❌ Call ended"));

      setCall(newCall);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const endCall = () => {
    if (call) {
      call.stop();
      setCall(null);
    }
  };

  return (
    <div>
      <button
        onClick={startCall}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        🎤 Talk to AI Agent
      </button>

      {call && (
        <button
          onClick={endCall}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          🔴 End Call
        </button>
      )}
    </div>
  );
}
