import { NextResponse } from "next/server";
import { isAdmin, getSessionUser, canManagePage } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/store";
import { uid, type Coupon } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");

  const user = await getSessionUser(req);
  if (pageId) {
    const allowed = await canManagePage(pageId, user, req);
    if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  } else if (!user && !isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const coupons = (db.coupons ?? []).filter((c) => !pageId || c.pageId === pageId);
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    pageId?: string;
    code?: string;
    discountType?: "percent" | "fixed";
    discountValue?: number;
    minOrderIdr?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  };

  const pageId = body.pageId?.trim();
  const rawCode = body.code?.trim().toUpperCase();
  const discountType = body.discountType;
  const discountValue = Number(body.discountValue ?? 0);

  if (!pageId || !rawCode || !discountType || discountValue <= 0) {
    return NextResponse.json({ error: "Data kupon tidak lengkap atau nilai diskon tidak valid" }, { status: 400 });
  }

  const user = await getSessionUser(req);
  const allowed = await canManagePage(pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (discountType === "percent" && (discountValue < 1 || discountValue > 100)) {
    return NextResponse.json({ error: "Diskon persentase harus antara 1% - 100%" }, { status: 400 });
  }

  const db = await getDb();
  if (!db.pages.some((p) => p.id === pageId)) {
    return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
  }

  // Cek duplikasi kode pada halaman yang sama
  if (db.coupons.some((c) => c.pageId === pageId && c.code === rawCode)) {
    return NextResponse.json({ error: `Kode kupon "${rawCode}" sudah ada di halaman ini` }, { status: 409 });
  }

  const coupon: Coupon = {
    id: uid("coupon"),
    pageId,
    code: rawCode,
    discountType,
    discountValue,
    minOrderIdr: Math.max(Math.floor(body.minOrderIdr ?? 0), 0),
    maxUses: body.maxUses ? Math.max(Math.floor(body.maxUses), 1) : null,
    usedCount: 0,
    isActive: true,
    expiresAt: body.expiresAt || null,
    createdAt: new Date().toISOString(),
  };

  db.coupons.push(coupon);
  await saveDb(db);
  return NextResponse.json(coupon, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    isActive?: boolean;
    discountValue?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  };

  if (!body.id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  const db = await getDb();
  const coupon = db.coupons.find((c) => c.id === body.id);
  if (!coupon) return NextResponse.json({ error: "Kupon tidak ditemukan" }, { status: 404 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(coupon.pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (body.isActive !== undefined) coupon.isActive = body.isActive;
  if (body.discountValue !== undefined && body.discountValue > 0) coupon.discountValue = body.discountValue;
  if (body.maxUses !== undefined) coupon.maxUses = body.maxUses;
  if (body.expiresAt !== undefined) coupon.expiresAt = body.expiresAt;

  await saveDb(db);
  return NextResponse.json(coupon);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  const db = await getDb();
  const index = db.coupons.findIndex((c) => c.id === id);
  if (index === -1) return NextResponse.json({ error: "Kupon tidak ditemukan" }, { status: 404 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(db.coupons[index].pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  db.coupons.splice(index, 1);
  await saveDb(db);
  return NextResponse.json({ ok: true });
}

