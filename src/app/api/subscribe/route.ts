import { NextResponse } from "next/server";
import { isAdmin, getSessionUser, canManagePage } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getDb, saveDb } from "@/lib/store";

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
  return NextResponse.json(db.subscribers.filter((s) => !pageId || s.pageId === pageId));
}

export async function POST(req: Request) {
  if (!rateLimit(`sub:${clientKey(req)}`, 10)) {
    return NextResponse.json({ error: "terlalu banyak" }, { status: 429 });
  }
  const body = (await req.json()) as { pageId?: string; email?: string };
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 120);
  if (!body.pageId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "email tidak valid" }, { status: 400 });
  }
  const db = await getDb();
  if (!db.pages.some((p) => p.id === body.pageId)) {
    return NextResponse.json({ error: "page tidak ada" }, { status: 404 });
  }
  if (!db.subscribers.some((s) => s.pageId === body.pageId && s.email === email)) {
    db.subscribers.push({ pageId: body.pageId, email, at: new Date().toISOString() });
    await saveDb(db);
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
