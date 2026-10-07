import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { client, ensureDbInitialized } from "@/lib/db";
import { getUserByEmail } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { uid } from "@/lib/types";

export async function POST(req: Request) {
  if (!rateLimit(`forgot:${clientKey(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").toLowerCase().trim();
  // Selalu balas OK untuk mencegah enumerasi email
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: true });
  }

  await ensureDbInitialized();
  const user = await getUserByEmail(email);
  if (!user) return NextResponse.json({ ok: true });

  // Hapus token lama user ini
  await client
    .execute({ sql: "DELETE FROM password_reset_tokens WHERE user_id = ?;", args: [user.id] })
    .catch(() => {});

  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  await client.execute({
    sql: "INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?);",
    args: [uid("prt"), user.id, token, expiresAt, now.toISOString()],
  });

  const baseUrl = (
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const resetLink = `${baseUrl}/lupa-password?token=${token}`;

  // Kirim via Resend jika dikonfigurasi, selain itu log server (sandbox)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const from = process.env.EMAIL_FROM ?? "OpenLynk <noreply@openlynk.id>";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: user.email,
        subject: "[OpenLynk] Reset password akun kreator",
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e4e4e7;border-radius:12px"><h2>Reset password OpenLynk</h2><p>Halo ${user.name}, klik tautan berikut untuk membuat password baru (berlaku 1 jam):</p><p><a href="${resetLink}">${resetLink}</a></p><p style="color:#71717a;font-size:12px">Abaikan email ini jika Anda tidak memintanya.</p></div>`,
      }),
    }).catch((e) => console.error("[forgot:email_error]", e));
  } else {
    console.log(`[password-reset:${user.email}] ${resetLink}`);
  }

  // Di non-production kembalikan token untuk memudahkan testing lokal
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, debugToken: token, resetLink });
  }
  return NextResponse.json({ ok: true });
}
