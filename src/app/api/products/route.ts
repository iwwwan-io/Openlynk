import { NextResponse } from "next/server";
import { isAdmin, getSessionUser, canManagePage } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/store";
import { uid } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId") ?? "";
  const db = await getDb();
  return NextResponse.json(db.products.filter((p) => !pageId || p.pageId === pageId));
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    pageId?: string;
    name?: string;
    description?: string;
    priceIdr?: number;
    stock?: number | null;
    kind?: "digital" | "fisik";
  };
  if (!body.pageId || !body.name || !body.priceIdr || body.priceIdr < 1000) {
    return NextResponse.json(
      { error: "pageId, name, priceIdr>=1000 wajib" },
      { status: 400 }
    );
  }

  const user = await getSessionUser(req);
  const allowed = await canManagePage(body.pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await getDb();
  const page = db.pages.find((p) => p.id === body.pageId);
  if (!page) return NextResponse.json({ error: "page tidak ada" }, { status: 404 });
  const product = {
    id: uid("prod"),
    pageId: page.id,
    name: body.name.slice(0, 100),
    description: (body.description ?? "").slice(0, 1000),
    priceIdr: Math.floor(body.priceIdr),
    stock: body.stock ?? null,
    kind: body.kind === "fisik" ? ("fisik" as const) : ("digital" as const),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  db.products.push(product);
  await saveDb(db);
  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    name?: string;
    description?: string;
    priceIdr?: number;
    stock?: number | null;
    kind?: "digital" | "fisik";
    isActive?: boolean;
    imageUrl?: string;
    fileUrl?: string;
  };
  if (!body.id) return NextResponse.json({ error: "id wajib" }, { status: 400 });
  const db = await getDb();
  const p = db.products.find((x) => x.id === body.id);
  if (!p) return NextResponse.json({ error: "produk tidak ada" }, { status: 404 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(p.pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (body.name !== undefined) p.name = body.name.slice(0, 100);
  if (body.description !== undefined) p.description = body.description.slice(0, 1000);
  if (body.priceIdr !== undefined && body.priceIdr >= 1000)
    p.priceIdr = Math.floor(body.priceIdr);
  if (body.isActive !== undefined) p.isActive = body.isActive;
  if (body.stock !== undefined)
    p.stock = body.stock === null ? null : Math.max(0, Math.floor(body.stock));
  if (body.kind === "digital" || body.kind === "fisik") p.kind = body.kind;
  if (body.imageUrl !== undefined) p.imageUrl = body.imageUrl.slice(0, 500);
  if (body.fileUrl !== undefined) p.fileUrl = body.fileUrl.slice(0, 500);
  await saveDb(db);
  return NextResponse.json(p);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  const db = await getDb();
  const i = db.products.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "produk tidak ada" }, { status: 404 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(db.products[i].pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (db.orders.some((o) => o.productId === id && ["pending", "paid"].includes(o.status))) {
    return NextResponse.json({ error: "ada order aktif, nonaktifkan saja" }, { status: 400 });
  }
  const [gone] = db.products.splice(i, 1);
  for (const page of db.pages) {
    page.bento = page.bento.filter(
      (b) => !(b.type === "product" && b.productId === gone.id)
    );
  }
  await saveDb(db);
  return NextResponse.json({ ok: true });
}
