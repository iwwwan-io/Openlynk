import { NextResponse } from "next/server";
import { isAdmin, getSessionUser, canManagePage } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/store";
import { THEME_NAMES } from "@/lib/themes";
import { uid, type SocialLinks, type Page } from "@/lib/types";
import { validSlug } from "@/lib/validate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.has("slug")) {
    const slug = (searchParams.get("slug") ?? "").trim().toLowerCase();
    const err = validSlug(slug);
    if (err) return NextResponse.json({ available: false, error: err });
    const db = await getDb();
    return NextResponse.json({ available: !db.pages.some((p) => p.slug === slug) });
  }
  const db = await getDb();
  return NextResponse.json(db.pages.filter((p) => p.isPublic));
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user && !isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { slug?: string; name?: string; bio?: string };
  const slug = (body.slug ?? "").trim().toLowerCase();
  const err = validSlug(slug);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }
  const db = await getDb();
  if (db.pages.some((p) => p.slug === slug)) {
    return NextResponse.json({ error: "slug sudah dipakai" }, { status: 409 });
  }
  if (db.pages.length >= 50) {
    return NextResponse.json({ error: "batas page tercapai" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const page: Page = {
    id: uid("page"),
    userId: user ? user.id : "usr_demo",
    slug,
    name: body.name?.slice(0, 80) || slug,
    bio: body.bio?.slice(0, 200) || "",
    bento: [],
    theme: "default" as const,
    accentColor: "#18181b",
    darkMode: false,
    isPublic: true,
    createdAt: now,
    updatedAt: now,
  };
  db.pages.push(page);
  await saveDb(db);
  return NextResponse.json(page, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    name?: string;
    bio?: string;
    theme?: string;
    accentColor?: string;
    darkMode?: boolean;
    image?: string;
    bannerImage?: string;
    socials?: SocialLinks;
    customDomain?: string | null;
  };
  if (!body.id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(body.id, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDb();
  const page = db.pages.find((p) => p.id === body.id);
  if (!page) return NextResponse.json({ error: "page tidak ada" }, { status: 404 });
  if (body.name !== undefined) page.name = body.name.slice(0, 80);
  if (body.bio !== undefined) page.bio = body.bio.slice(0, 200);
  if (body.image !== undefined) page.image = body.image ? body.image.trim().slice(0, 500) : undefined;
  if (body.bannerImage !== undefined) {
    page.bannerImage = body.bannerImage ? body.bannerImage.trim().slice(0, 500) : undefined;
  }
  if (body.socials !== undefined) {
    if (typeof body.socials === "object" && body.socials !== null) {
      const sanitized: SocialLinks = {};
      for (const [k, v] of Object.entries(body.socials)) {
        if (typeof v === "string" && v.trim()) {
          sanitized[k as keyof SocialLinks] = v.trim().slice(0, 300);
        }
      }
      page.socials = Object.keys(sanitized).length > 0 ? sanitized : undefined;
    } else {
      page.socials = undefined;
    }
  }
  if (body.customDomain !== undefined) {
    if (body.customDomain === null || body.customDomain.trim() === "") {
      page.customDomain = undefined;
    } else {
      const rawDomain = body.customDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");

      const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
      if (!domainRegex.test(rawDomain)) {
        return NextResponse.json(
          { error: "Format domain tidak valid (contoh: bio.domainku.com atau domainku.id)" },
          { status: 400 }
        );
      }

      const reserved = ["localhost", "openlynk.id", "openlynk.com", "vercel.app"];
      if (reserved.some((r) => rawDomain === r || rawDomain.endsWith(`.${r}`))) {
        return NextResponse.json(
          { error: "Domain sistem tidak dapat digunakan sebagai custom domain" },
          { status: 400 }
        );
      }

      const conflict = db.pages.find(
        (p) => p.id !== page.id && p.customDomain?.toLowerCase() === rawDomain
      );
      if (conflict) {
        return NextResponse.json(
          { error: "Domain sudah digunakan oleh halaman lain" },
          { status: 409 }
        );
      }

      page.customDomain = rawDomain;
    }
  }
  if (body.theme !== undefined && (THEME_NAMES as string[]).includes(body.theme))
    page.theme = body.theme as (typeof THEME_NAMES)[number];
  if (body.accentColor !== undefined && /^#[0-9a-fA-F]{6}$/.test(body.accentColor))
    page.accentColor = body.accentColor;
  if (body.darkMode !== undefined) page.darkMode = body.darkMode;
  page.updatedAt = new Date().toISOString();
  await saveDb(db);
  return NextResponse.json(page);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(id, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDb();
  const i = db.pages.findIndex((p) => p.id === id);
  if (i < 0) return NextResponse.json({ error: "page tidak ada" }, { status: 404 });
  if (db.orders.some((o) => o.pageId === id && ["pending", "paid"].includes(o.status))) {
    return NextResponse.json({ error: "ada order aktif" }, { status: 400 });
  }
  const [gone] = db.pages.splice(i, 1);
  db.products = db.products.filter((p) => p.pageId !== gone.id);
  await saveDb(db);
  return NextResponse.json({ ok: true });
}
