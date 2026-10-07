import { NextResponse } from "next/server";
import { client, ensureDbInitialized } from "@/lib/db";
import { getUserByEmail } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { countAdmins, logAdminAction } from "@/lib/admin";

/**
 * Bootstrap admin pertama (sekali-pakai secara operasional):
 * Hanya bisa dipanggil dengan header ADMIN_TOKEN yang valid.
 * Body: { email }
 */
export async function POST(req: Request) {
  if (!rateLimit(`admin_bootstrap:${clientKey(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  if (!process.env.ADMIN_TOKEN?.trim() || !isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").toLowerCase().trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email tidak valid" }, { status: 400 });
  }

  await ensureDbInitialized();
  const target = await getUserByEmail(email);
  if (!target) {
    return NextResponse.json({ error: "email tidak terdaftar" }, { status: 404 });
  }
  if (target.role === "admin") {
    return NextResponse.json({ ok: true, alreadyAdmin: true });
  }

  const existingAdmins = await countAdmins();
  await client.execute({
    sql: "UPDATE users SET role = 'admin', updated_at = ? WHERE id = ?;",
    args: [new Date().toISOString(), target.id],
  });
  await logAdminAction(
    "token:ADMIN_TOKEN",
    existingAdmins === 0 ? "admin.bootstrap.first" : "admin.promote",
    "user",
    target.id,
    `Promosikan ${email} menjadi admin`
  );

  return NextResponse.json({ ok: true, userId: target.id, email: target.email });
}
