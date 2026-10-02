import { NextResponse } from "next/server";
import { destroySession, parseCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let token: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
    if (!token) {
      token = parseCookie(req.headers.get("cookie"), SESSION_COOKIE_NAME);
    }

    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal keluar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
