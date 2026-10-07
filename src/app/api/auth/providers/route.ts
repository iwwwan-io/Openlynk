import { NextResponse } from "next/server";
import { isGoogleConfigured } from "@/lib/google";

export async function GET() {
  return NextResponse.json({ google: isGoogleConfigured() });
}
