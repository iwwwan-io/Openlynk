import { NextResponse } from "next/server";
import { client, ensureDbInitialized } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`reset:${clientKey(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { token?: string; password?: string };
  const token = (body.token ?? "").trim();
  const password = body.password ?? "";
  if (!token) return NextResponse.json({ error: "token wajib" }, { status: 400 });
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password terlalu panjang" }, { status: 400 });
  }

  await ensureDbInitialized();
  const tokRes = await client.execute({
    sql: "SELECT * FROM password_reset_tokens WHERE token = ? LIMIT 1;",
    args: [token],
  });
  if (tokRes.rows.length === 0) {
    return NextResponse.json({ error: "Token tidak valid atau sudah dipakai" }, { status: 400 });
  }
  const row = tokRes.rows[0] as Record<string, unknown>;
  if (new Date(String(row.expires_at)).getTime() < Date.now()) {
    await client
      .execute({ sql: "DELETE FROM password_reset_tokens WHERE token = ?;", args: [token] })
      .catch(() => {});
    return NextResponse.json({ error: "Token kedaluwarsa, minta tautan baru" }, { status: 400 });
  }

  const userId = String(row.user_id);
  const now = new Date().toISOString();
  await client.execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?;",
    args: [hashPassword(password), now, userId],
  });
  // Bersihkan semua token reset + paksa login ulang di semua perangkat
  await client
    .execute({ sql: "DELETE FROM password_reset_tokens WHERE user_id = ?;", args: [userId] })
    .catch(() => {});
  await client
    .execute({ sql: "DELETE FROM sessions WHERE user_id = ?;", args: [userId] })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
