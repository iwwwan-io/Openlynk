import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { client, ensureDbInitialized } from "@/lib/db";
import type { Page, BentoItem, SocialLinks, PageTheme } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ user: null, pages: [] });
    }

    await ensureDbInitialized();

    const sql =
      user.role === "admin"
        ? "SELECT * FROM pages ORDER BY created_at DESC;"
        : "SELECT * FROM pages WHERE user_id = ? ORDER BY created_at DESC;";
    const args = user.role === "admin" ? [] : [user.id];

    const pagesRes = await client.execute({ sql, args });

    const pages: Page[] = pagesRes.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      userId: r.user_id ? String(r.user_id) : undefined,
      slug: String(r.slug),
      name: String(r.name),
      bio: String(r.bio ?? ""),
      image: r.image ? String(r.image) : undefined,
      bannerImage: r.banner_image ? String(r.banner_image) : undefined,
      socials: r.socials
        ? typeof r.socials === "string"
          ? JSON.parse(r.socials)
          : (r.socials as SocialLinks)
        : undefined,
      theme: ((r.theme as string) ?? "default") as PageTheme,
      accentColor: String(r.accent_color ?? "#18181b"),
      darkMode: Boolean(r.dark_mode),
      isPublic: Boolean(r.is_public),
      bento:
        typeof r.bento === "string"
          ? JSON.parse(r.bento)
          : ((r.bento as BentoItem[]) ?? []),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    }));

    return NextResponse.json({ user, pages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
