import { NextResponse } from "next/server";

// Dummy POST handler to satisfy the Next.js build requirement
export async function POST(req: Request) {
  return NextResponse.json({ message: "Webhook endpoint ready." }, { status: 200 });
}
