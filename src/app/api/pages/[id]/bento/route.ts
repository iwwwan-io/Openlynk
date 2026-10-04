import { NextResponse } from "next/server";
import { getSessionUser, canManagePage } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/store";
import { uid } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser(req);
  const allowed = await canManagePage(id, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  type BentoActionBody =
    | { action: "add-header"; title?: string; subtitle?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" | "4x1" }
    | { action: "add-link"; title?: string; href?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-note"; title?: string; text?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-video"; title?: string; url?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-music"; title?: string; url?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-map"; label?: string; address?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-countdown"; title?: string; targetDate?: string; emoji?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-image"; url?: string; caption?: string; href?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-github"; username?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | { action: "add-calendar"; title?: string; url?: string; description?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" }
    | {
        action: "add-sawer";
        title?: string;
        message?: string;
        unitName?: string;
        unitPrice?: number;
        targetAmount?: number;
        size?: "1x1" | "2x1" | "2x2" | "4x2";
      }
    | { action: "add-product"; productId?: string }
    | { action: "resize"; bentoId?: string; size?: "1x1" | "2x1" | "2x2" | "4x2" | "4x1" }
    | { action: "move"; bentoId?: string; dir?: number }
    | { action: "reorder"; order?: string[] }
    | {
        action: "edit";
        bentoId: string;
        title?: string;
        subtitle?: string;
        href?: string;
        text?: string;
        url?: string;
        label?: string;
        address?: string;
        targetDate?: string;
        emoji?: string;
        caption?: string;
        username?: string;
        description?: string;
        message?: string;
        unitName?: string;
        unitPrice?: number;
        targetAmount?: number;
        size?: "1x1" | "2x1" | "2x2" | "4x2" | "4x1";
      }
    | { action: "layout"; layout?: { id: string; x: number; y: number }[] }
    | { action: "remove"; bentoId?: string };

  let body: BentoActionBody;
  try {
    body = (await req.json()) as BentoActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const db = await getDb();
  const page = db.pages.find((p) => p.id === id);
  if (!page) return NextResponse.json({ error: "page tidak ada" }, { status: 404 });

  if (body.action === "remove") {
    page.bento = page.bento.filter((b) => b.id !== body.bentoId);
  } else if (body.action === "edit") {
    const item = page.bento.find((b) => b.id === body.bentoId);
    if (!item) return NextResponse.json({ error: "kartu bento tidak ditemukan" }, { status: 404 });
    if (item.type === "header") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.subtitle !== undefined) item.subtitle = (body.subtitle ?? "").trim().slice(0, 120) || undefined;
    } else if (item.type === "link") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.href !== undefined) item.href = (body.href ?? "").trim().slice(0, 500);
    } else if (item.type === "note") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.text !== undefined) item.text = (body.text ?? "").trim().slice(0, 1000);
    } else if (item.type === "video") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.url !== undefined) item.url = (body.url ?? "").trim().slice(0, 500);
    } else if (item.type === "music") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.url !== undefined) item.url = (body.url ?? "").trim().slice(0, 500);
    } else if (item.type === "map") {
      if (body.label !== undefined) item.label = (body.label ?? "").trim().slice(0, 60);
      if (body.address !== undefined) item.address = (body.address ?? "").trim().slice(0, 200);
    } else if (item.type === "countdown") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.targetDate !== undefined) item.targetDate = (body.targetDate ?? "").trim();
      if (body.emoji !== undefined) item.emoji = (body.emoji ?? "⏳").slice(0, 4);
    } else if (item.type === "image") {
      if (body.url !== undefined) item.url = (body.url ?? "").trim();
      if (body.caption !== undefined) item.caption = (body.caption ?? "").trim().slice(0, 200) || undefined;
      if (body.href !== undefined) item.href = (body.href ?? "").trim().slice(0, 500) || undefined;
    } else if (item.type === "github") {
      if (body.username !== undefined) item.username = (body.username ?? "").trim().replace(/^@/, "").slice(0, 60);
    } else if (item.type === "calendar") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.url !== undefined) item.url = (body.url ?? "").trim().slice(0, 500);
      if (body.description !== undefined) item.description = (body.description ?? "").trim().slice(0, 300) || undefined;
    } else if (item.type === "sawer") {
      if (body.title !== undefined) item.title = (body.title ?? "").trim().slice(0, 60);
      if (body.message !== undefined) item.message = (body.message ?? "").trim().slice(0, 500) || undefined;
      if (body.unitName !== undefined) item.unitName = (body.unitName ?? "Kopi").trim().slice(0, 30);
      if (body.unitPrice !== undefined) item.unitPrice = Number(body.unitPrice) || 15000;
      if (body.targetAmount !== undefined) item.targetAmount = body.targetAmount ? Number(body.targetAmount) : undefined;
    }
    if (body.size !== undefined && item.type !== "product") {
      item.size = body.size;
    }
  } else if (body.action === "add-header") {
    const title = (body.title ?? "").trim().slice(0, 60);
    const subtitle = (body.subtitle ?? "").trim().slice(0, 120);
    if (!title) {
      return NextResponse.json({ error: "judul grup/header wajib diisi" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "header",
      title,
      subtitle: subtitle || undefined,
      size: "4x1",
    });
  } else if (body.action === "add-link") {
    const title = (body.title ?? "").slice(0, 60);
    const href = (body.href ?? "").slice(0, 500);
    if (!title || !/^https?:\/\//.test(href)) {
      return NextResponse.json({ error: "title + href http(s) wajib" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "link",
      title,
      href,
      size: body.size ?? "2x1",
    });
  } else if (body.action === "add-note") {
    const text = (body.text ?? "").trim().slice(0, 1000);
    if (!text) {
      return NextResponse.json({ error: "isi catatan wajib diisi" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "note",
      title: (body.title ?? "").trim().slice(0, 60),
      text,
      size: body.size ?? "2x1",
    });
  } else if (body.action === "add-video") {
    const url = (body.url ?? "").trim().slice(0, 500);
    if (!url || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ error: "URL video wajib (YouTube)" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "video",
      title: (body.title ?? "").trim().slice(0, 60),
      url,
      size: body.size ?? "2x2",
    });
  } else if (body.action === "add-music") {
    const url = (body.url ?? "").trim().slice(0, 500);
    if (!url || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ error: "URL Spotify wajib" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "music",
      title: (body.title ?? "").trim().slice(0, 60),
      url,
      size: body.size ?? "2x1",
    });
  } else if (body.action === "add-map") {
    const address = (body.address ?? "").trim().slice(0, 200);
    const label = (body.label ?? "").trim().slice(0, 60) || address;
    if (!address) {
      return NextResponse.json({ error: "alamat / lokasi wajib diisi" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "map",
      label,
      address,
      size: body.size ?? "2x2",
    });
  } else if (body.action === "add-countdown") {
    const title = (body.title ?? "").trim().slice(0, 60);
    const targetDate = (body.targetDate ?? "").trim();
    if (!title || !targetDate || isNaN(Date.parse(targetDate))) {
      return NextResponse.json({ error: "judul dan tanggal target valid wajib" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "countdown",
      title,
      targetDate,
      emoji: (body.emoji ?? "⏳").slice(0, 4),
      size: body.size ?? "2x1",
    });
  } else if (body.action === "add-image") {
    const url = (body.url ?? "").trim();
    if (!url) {
      return NextResponse.json({ error: "URL gambar wajib" }, { status: 400 });
    }
    const caption = (body.caption ?? "").trim().slice(0, 200);
    const href = (body.href ?? "").trim().slice(0, 500);
    page.bento.push({
      id: uid("b"),
      type: "image",
      url,
      caption: caption || undefined,
      href: href || undefined,
      size: body.size ?? "2x2",
    });
  } else if (body.action === "add-github") {
    const username = (body.username ?? "").trim().replace(/^@/, "").slice(0, 60);
    if (!username) {
      return NextResponse.json({ error: "Username GitHub wajib" }, { status: 400 });
    }
    page.bento.push({
      id: uid("b"),
      type: "github",
      username,
      size: body.size ?? "2x1",
    });
  } else if (body.action === "add-calendar") {
    const title = (body.title ?? "").trim().slice(0, 60);
    const url = (body.url ?? "").trim().slice(0, 500);
    if (!title || !url || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ error: "Judul dan URL Cal.com/Calendly wajib" }, { status: 400 });
    }
    const description = (body.description ?? "").trim().slice(0, 300);
    page.bento.push({
      id: uid("b"),
      type: "calendar",
      title,
      url,
      description: description || undefined,
      size: body.size ?? "2x1",
    });
  } else if (body.action === "add-sawer") {
    const title = (body.title ?? "").trim().slice(0, 60) || "Traktir Kopi ☕";
    const message = (body.message ?? "").trim().slice(0, 500) || undefined;
    const unitName = (body.unitName ?? "").trim().slice(0, 30) || "Kopi";
    const unitPrice = Number(body.unitPrice) || 15000;
    const targetAmount = body.targetAmount ? Number(body.targetAmount) : undefined;
    page.bento.push({
      id: uid("b_sawer"),
      type: "sawer",
      title,
      message,
      unitName,
      unitPrice,
      targetAmount,
      currentAmount: 0,
      size: body.size ?? "2x2",
    });
  } else if (body.action === "resize") {
    const item = page.bento.find((b) => b.id === body.bentoId);
    if (!item || item.type === "product") {
      return NextResponse.json({ error: "kartu produk ukuran otomatis" }, { status: 400 });
    }
    item.size =
      body.size === "1x1" || body.size === "2x2" || body.size === "4x2" || body.size === "4x1" ? body.size : "2x1";
  } else if (body.action === "move") {
    const i = page.bento.findIndex((b) => b.id === body.bentoId);
    const j = i + (body.dir === -1 ? -1 : 1);
    if (i < 0 || j < 0 || j >= page.bento.length) {
      return NextResponse.json({ error: "tidak bisa digeser" }, { status: 400 });
    }
    const [item] = page.bento.splice(i, 1);
    page.bento.splice(j, 0, item);
  } else if (body.action === "reorder") {
    const ids = new Set(page.bento.map((b) => b.id));
    if (!body.order || body.order.length !== page.bento.length || !body.order.every((x) => ids.has(x))) {
      return NextResponse.json({ error: "urutan invalid" }, { status: 400 });
    }
    const map = new Map(page.bento.map((b) => [b.id, b]));
    page.bento = body.order.map((x) => map.get(x)!);
  } else if (body.action === "layout") {
    if (!body.layout || body.layout.length !== page.bento.length) {
      return NextResponse.json({ error: "layout invalid" }, { status: 400 });
    }
    const map = new Map(page.bento.map((b) => [b.id, b]));
    for (const l of body.layout) {
      const item = map.get(l.id);
      if (!item) return NextResponse.json({ error: "layout invalid" }, { status: 400 });
      item.pos = {
        x: Math.max(0, Math.min(3, Math.floor(l.x))),
        y: Math.max(0, Math.floor(l.y)),
      };
    }
  } else if (body.action === "add-product") {
    const prod = db.products.find((p) => p.id === body.productId && p.pageId === id);
    if (!prod) return NextResponse.json({ error: "produk tidak ada" }, { status: 404 });
    page.bento.push({ id: uid("b"), type: "product", productId: prod.id });
  } else {
    return NextResponse.json({ error: "action invalid" }, { status: 400 });
  }
  page.updatedAt = new Date().toISOString();
  await saveDb(db);
  return NextResponse.json(page);
}
