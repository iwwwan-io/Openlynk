import { NextResponse } from "next/server";
import { client, ensureDbInitialized } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { countAdmins, logAdminAction, requireAdmin } from "@/lib/admin";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  if (!rateLimit(`admin:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  if (!(await requireAdmin(req))) return unauthorized();

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const plan = searchParams.get("plan");
  const suspended = searchParams.get("suspended");
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1), 50);
  const offset = (page - 1) * limit;

  await ensureDbInitialized();
  const conds: string[] = [];
  const args: (string | number | null)[] = [];
  if (search) {
    conds.push("(LOWER(email) LIKE ? OR LOWER(name) LIKE ?)");
    args.push(`%${search}%`, `%${search}%`);
  }
  if (plan === "free" || plan === "pro") {
    conds.push("plan = ?");
    args.push(plan);
  }
  if (suspended === "1") conds.push("suspended = 1");
  if (suspended === "0") conds.push("suspended = 0");
  const where = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";

  const totalRes = await client.execute({ sql: `SELECT COUNT(*) as c FROM users ${where};`, args });
  const rows = await client.execute({
    sql: `SELECT u.id, u.email, u.name, u.avatar, u.role, u.plan, u.suspended, u.created_at,
            (SELECT COUNT(*) FROM pages p WHERE p.user_id = u.id) as page_count,
            (SELECT COALESCE(SUM(o.total_idr),0) FROM orders o JOIN pages p ON o.page_id = p.id WHERE p.user_id = u.id AND o.status IN ('paid','sent')) as gmv
          FROM users u ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?;`,
    args: [...args, limit, offset],
  });

  return NextResponse.json({
    ok: true,
    total: Number(totalRes.rows[0]?.c ?? 0),
    page,
    limit,
    users: rows.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      avatar: r.avatar ? String(r.avatar) : undefined,
      role: String(r.role),
      plan: String(r.plan),
      suspended: Boolean(r.suspended),
      pageCount: Number(r.page_count ?? 0),
      gmv: Number(r.gmv ?? 0),
      createdAt: String(r.created_at),
    })),
  });
}

export async function PATCH(req: Request) {
  if (!rateLimit(`admin:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  const actor = await requireAdmin(req);
  if (!actor) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as {
    userId?: string;
    plan?: "free" | "pro";
    role?: "creator" | "admin";
    suspended?: boolean;
    suspendedReason?: string;
  };
  if (!body.userId) return NextResponse.json({ error: "userId wajib" }, { status: 400 });

  await ensureDbInitialized();
  const cur = await client.execute({ sql: "SELECT * FROM users WHERE id = ? LIMIT 1;", args: [body.userId] });
  if (cur.rows.length === 0) return NextResponse.json({ error: "user tidak ditemukan" }, { status: 404 });
  const target = cur.rows[0] as Record<string, unknown>;

  // Tidak bisa mengubah akun sendiri (cegah lockout admin terakhir)
  if (actor.user && String(target.id) === actor.user.id) {
    return NextResponse.json({ error: "Tidak dapat mengubah akun sendiri" }, { status: 400 });
  }

  const changes: string[] = [];
  const now = new Date().toISOString();

  if (body.plan === "free" || body.plan === "pro") {
    if (body.plan !== String(target.plan)) {
      await client.execute({ sql: "UPDATE users SET plan = ?, updated_at = ? WHERE id = ?;", args: [body.plan, now, body.userId] });
      changes.push(`plan:${target.plan}->${body.plan}`);
    }
  }

  if (body.role === "creator" || body.role === "admin") {
    if (body.role !== String(target.role)) {
      // Jangan demote admin terakhir
      if (String(target.role) === "admin" && body.role === "creator") {
        const others = await countAdmins(String(target.id));
        if (others === 0) {
          return NextResponse.json({ error: "Tidak dapat demote admin terakhir" }, { status: 400 });
        }
      }
      await client.execute({ sql: "UPDATE users SET role = ?, updated_at = ? WHERE id = ?;", args: [body.role, now, body.userId] });
      changes.push(`role:${target.role}->${body.role}`);
    }
  }

  if (typeof body.suspended === "boolean") {
    const toSuspended = body.suspended ? 1 : 0;
    if (toSuspended !== Number(target.suspended ?? 0)) {
      await client.execute({
        sql: "UPDATE users SET suspended = ?, suspended_at = ?, suspended_reason = ?, updated_at = ? WHERE id = ?;",
        args: [toSuspended, toSuspended ? now : null, toSuspended ? (body.suspendedReason ?? "").slice(0, 200) : null, now, body.userId],
      });
      if (toSuspended) {
        // Paksa keluar dari semua perangkat
        await client.execute({ sql: "DELETE FROM sessions WHERE user_id = ?;", args: [body.userId] }).catch(() => {});
        await client.execute({ sql: "DELETE FROM password_reset_tokens WHERE user_id = ?;", args: [body.userId] }).catch(() => {});
      }
      changes.push(toSuspended ? "suspended:0->1" : "suspended:1->0");
    }
  }

  if (changes.length === 0) {
    return NextResponse.json({ ok: true, changed: false });
  }
  await logAdminAction(actor.adminId, "admin.user.update", "user", String(target.id), changes.join(", "));

  return NextResponse.json({ ok: true, changed: true, changes });
}
