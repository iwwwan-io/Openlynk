import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getAuditLog, requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  if (!rateLimit(`admin:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 1), 200);
  return NextResponse.json({ ok: true, items: await getAuditLog(limit) });
}
