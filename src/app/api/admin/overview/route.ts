import { NextResponse } from "next/server";
import { client, ensureDbInitialized } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  if (!rateLimit(`admin:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await ensureDbInitialized();
  const num = async (sql: string): Promise<number> => {
    const r = await client.execute(sql);
    return Number(r.rows[0]?.c ?? 0);
  };

  const gmvRes = await client.execute(
    "SELECT COALESCE(SUM(total_idr),0) as gmv, COALESCE(SUM(fee_idr),0) as fee FROM orders WHERE status IN ('paid','sent');"
  );
  const gmvRow = gmvRes.rows[0] as Record<string, unknown>;
  const payoutRes = await client.execute(
    "SELECT COUNT(*) as c, COALESCE(SUM(CASE WHEN status IN ('pending','processing') THEN amount_idr ELSE 0 END),0) as pending_amount FROM payout_requests;"
  );
  const payoutRow = payoutRes.rows[0] as Record<string, unknown>;

  return NextResponse.json({
    ok: true,
    totalUsers: await num("SELECT COUNT(*) as c FROM users;"),
    totalPages: await num("SELECT COUNT(*) as c FROM pages;"),
    paidOrders: await num("SELECT COUNT(*) as c FROM orders WHERE status IN ('paid','sent');"),
    paidOrdersToday: await num(
      "SELECT COUNT(*) as c FROM orders WHERE status IN ('paid','sent') AND created_at >= date('now');"
    ),
    gmv: Number(gmvRow.gmv ?? 0),
    feeCollected: Number(gmvRow.fee ?? 0),
    pendingPayouts: Number(payoutRow.c ?? 0),
    pendingPayoutAmount: Number(payoutRow.pending_amount ?? 0),
    adminCount: await num("SELECT COUNT(*) as c FROM users WHERE role = 'admin';"),
  });
}
