import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import type { User } from "@/lib/types";

export async function POST(req: Request) {
  try {
    // Rate limit: maks 10 percobaan login per menit per IP
    const ipKey = `auth_login:${clientKey(req)}`;
    if (!rateLimit(ipKey, 10, 60_000)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan masuk. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const userWithPw = await getUserByEmail(email);
    if (!userWithPw) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const isValid = verifyPassword(password, userWithPw.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    if (userWithPw.suspended) {
      return NextResponse.json(
        { error: "Akun Anda ditangguhkan. Hubungi admin OpenLynk untuk informasi lebih lanjut." },
        { status: 403 }
      );
    }

    const session = await createSession(userWithPw.id);

    const user: User = {
      id: userWithPw.id,
      email: userWithPw.email,
      name: userWithPw.name,
      avatar: userWithPw.avatar,
      role: userWithPw.role,
      plan: userWithPw.plan || "free",
      createdAt: userWithPw.createdAt,
      updatedAt: userWithPw.updatedAt,
    };

    const response = NextResponse.json({ ok: true, user, token: session.token });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal masuk";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
