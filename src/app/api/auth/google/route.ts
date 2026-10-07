import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { buildGoogleAuthUrl, isGoogleConfigured, OAUTH_STATE_COOKIE, signState } from "@/lib/google";
import { clientKey, rateLimit } from "@/lib/ratelimit";

function safeRedirect(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw.slice(0, 200);
  return "/dashboard";
}

/** Mulai login Google: set nonce anti-CSRF lalu redirect ke Google. */
export async function GET(req: Request) {
  if (!rateLimit(`oauth_start:${clientKey(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "Login Google belum dikonfigurasi server" }, { status: 501 });
  }

  const { searchParams } = new URL(req.url);
  const slugRaw = (searchParams.get("slug") ?? "").trim().toLowerCase();
  const slugToClaim = /^[a-z0-9-]{3,30}$/.test(slugRaw) ? slugRaw : undefined;

  const nonce = crypto.randomBytes(16).toString("hex");
  let state: string;
  try {
    state = signState({ nonce, redirect: safeRedirect(searchParams.get("redirect")), slugToClaim });
  } catch {
    return NextResponse.json({ error: "Login Google belum dikonfigurasi server" }, { status: 501 });
  }

  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
  return response;
}
