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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1), 50);
  const offset = (page - 1) * limit;

  await ensureDbInitialized();
  const conds: string[] = [];
  const args: (string | number | null)[] = [];
  if (status && ["pending", "paid", "sent", "expired", "cancelled"].includes(status)) {
    conds.push("o.status = ?");
    args.push(status);
  }
  const where = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";

  const totalRes = await client.execute({ sql: `SELECT COUNT(*) as c FROM orders o ${where};`, args });
  const rows = await client.execute({
    sql: `SELECT o.*, p.slug as page_slug, p.name as page_name
          FROM orders o LEFT JOIN pages p ON o.page_id = p.id
          ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?;`,
    args: [...args, limit, offset],
  });

  return NextResponse.json({
    ok: true,
    total: Number(totalRes.rows[0]?.c ?? 0),
    page,
    limit,
    orders: rows.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      productId: String(r.product_id),
      pageId: String(r.page_id),
      pageSlug: r.page_slug ? String(r.page_slug) : undefined,
      pageName: r.page_name ? String(r.page_name) : undefined,
      buyerName: String(r.buyer_name),
      buyerContact: String(r.buyer_contact),
      qty: Number(r.qty),
      totalIdr: Number(r.total_idr),
      feeIdr: Number(r.fee_idr),
      status: String(r.status),
      couponCode: r.coupon_code ? String(r.coupon_code) : undefined,
      createdAt: String(r.created_at),
      paidAt: r.paid_at ? String(r.paid_at) : undefined,
    })),
  });
}
