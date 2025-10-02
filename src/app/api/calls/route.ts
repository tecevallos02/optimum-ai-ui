// path: src/app/api/calls/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Mock calls — adjust to your schema as needed
  const data = [
    {
      id: "call_1",
      orgId: "org_1",
      startedAt: new Date().toISOString(),
      durationSec: 185,
      status: "completed",
      intent: ["book"],
      transcriptUrl: "/transcripts/call_1.txt",
      recordingUrl: "/recordings/call_1.mp3",
      createdByAgent: false,
      disposition: "booked",
      contactId: "ct_1",
      costSeconds: 185,
      tags: ["inbound", "priority"],
    },
    {
      id: "call_2",
      orgId: "org_1",
      startedAt: new Date(Date.now() - 3600_000).toISOString(),
      durationSec: 0,
      status: "missed",
      intent: [],
      transcriptUrl: "",
      recordingUrl: "",
      createdByAgent: false,
      disposition: "voicemail",
      contactId: "ct_2",
      costSeconds: 0,
      tags: ["inbound"],
    },
  ] as const;

  return NextResponse.json(data, { status: 200 });
}
