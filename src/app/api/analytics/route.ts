import { NextResponse } from "next/server";
import { isAdmin, getSessionUser, canManagePage } from "@/lib/auth";
import { getDb } from "@/lib/store";

function buckets(items: { at: string }[], days: number): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: 0 });
  }
  const map = new Map(out.map((b) => [b.date, b]));
  for (const it of items) {
    const b = map.get(it.at.slice(0, 10));
    if (b) b.count += 1;
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId") ?? "";
  const user = await getSessionUser(req);

  if (pageId) {
    const allowed = await canManagePage(pageId, user, req);
    if (!allowed) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    if (!isAdmin(req) && (!user || user.role !== "admin")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const db = await getDb();
  const v = db.views.filter((x) => !pageId || x.pageId === pageId);
  const c = db.clicks.filter((x) => !pageId || x.pageId === pageId);
  const orders = db.orders.filter((o) => !pageId || o.pageId === pageId);
  const paid = orders.filter((o) => o.status === "paid" || o.status === "sent");
  const omset = paid.reduce((s, o) => s + o.totalIdr, 0);
  const byStatus = Object.fromEntries(
    ["pending", "paid", "sent", "expired", "cancelled"].map((st) => [
      st,
      orders.filter((o) => o.status === st).length,
    ])
  );
  return NextResponse.json({
    views: v.length,
    clicks: c.length,
    orders: orders.length,
    omset,
    byStatus,
    viewsOverTime: buckets(v, 14),
    clicksOverTime: buckets(c, 14),
  });
}
