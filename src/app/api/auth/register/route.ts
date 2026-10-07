import { NextResponse } from "next/server";
import { client, ensureDbInitialized } from "@/lib/db";
import { hashPassword, createSession, getUserByEmail, SESSION_COOKIE_NAME } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { uid, type User } from "@/lib/types";
import { validSlug } from "@/lib/validate";

export async function POST(req: Request) {
  try {
    // Rate limit pendaftaran: maks 10 per menit per IP
    const ipKey = `auth_register:${clientKey(req)}`;
    if (!rateLimit(ipKey, 10, 60_000)) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pendaftaran. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
      slugToClaim?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const name = (body.name ?? "").trim();
    const slugToClaim = (body.slugToClaim ?? "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    await ensureDbInitialized();

    // Cek apakah email sudah terdaftar
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    }

    // Buat user baru
    const userId = uid("usr");
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role, plan, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'creator', 'free', ?, ?);`,
      args: [userId, email, passwordHash, name.slice(0, 100), now, now],
    });

    const user: User = {
      id: userId,
      email,
      name,
      role: "creator",
      plan: "free",
      createdAt: now,
      updatedAt: now,
    };

    // Buat session
    const session = await createSession(userId);

    // Jika ada slug yang ingin langsung diklaim
    let claimedPageSlug: string | undefined = undefined;
    if (slugToClaim) {
      const slugErr = validSlug(slugToClaim);
      if (!slugErr) {
        const checkPage = await client.execute({
          sql: "SELECT id FROM pages WHERE slug = ? LIMIT 1;",
          args: [slugToClaim],
        });
        if (checkPage.rows.length === 0) {
          const pageId = uid("page");
          await client.execute({
            sql: `INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
                  VALUES (?, ?, ?, ?, '', 'default', '#18181b', 0, 1, '[]', ?, ?);`,
            args: [pageId, userId, slugToClaim, name, now, now],
          });
          claimedPageSlug = slugToClaim;
        }
      }
    }

    const response = NextResponse.json(
      { ok: true, user, token: session.token, claimedSlug: claimedPageSlug },
      { status: 201 }
    );

    // Set cookie session (30 hari)
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
    const message = err instanceof Error ? err.message : "Gagal mendaftar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
