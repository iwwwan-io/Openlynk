import { NextResponse } from "next/server";
import { client, ensureDbInitialized } from "@/lib/db";
import {
  createSession,
  getUserByEmail,
  parseCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import {
  exchangeCodeForTokens,
  fetchGoogleUser,
  isGoogleConfigured,
  OAUTH_STATE_COOKIE,
  verifyState,
} from "@/lib/google";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { uid, type User } from "@/lib/types";
import { validSlug } from "@/lib/validate";

function fail(base: string, error: string): NextResponse {
  const url = new URL("/masuk", base);
  url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  res.cookies.set({ name: OAUTH_STATE_COOKIE, value: "", maxAge: 0, path: "/" });
  return res;
}

/** Callback Google: verifikasi state → tukar kode → find-or-create user → sesi. */
export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (!rateLimit(`oauth_cb:${clientKey(req)}`, 20, 60_000)) return fail(appUrl, "rate");
  if (!isGoogleConfigured()) return fail(appUrl, "unconfigured");

  const { searchParams } = new URL(req.url);
  if (searchParams.get("error")) return fail(appUrl, "cancelled");

  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const state = stateRaw ? verifyState(stateRaw) : null;
  const nonceCookie = parseCookie(req.headers.get("cookie"), OAUTH_STATE_COOKIE);
  if (!code || !state || !nonceCookie || nonceCookie !== state.nonce) {
    return fail(appUrl, "state");
  }

  let profile;
  try {
    const { accessToken } = await exchangeCodeForTokens(code);
    profile = await fetchGoogleUser(accessToken);
  } catch {
    return fail(appUrl, "exchange");
  }
  if (!profile.emailVerified) return fail(appUrl, "unverified");

  await ensureDbInitialized();
  const email = profile.email.toLowerCase().trim();
  const existing = await getUserByEmail(email);
  const now = new Date().toISOString();

  let user: User;
  let claimedSlug: string | undefined;
  if (existing) {
    user = {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      avatar: existing.avatar ?? profile.picture?.slice(0, 500),
      role: existing.role,
      plan: existing.plan || "free",
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    };
    // Lengkapi avatar bila kosong
    if (!existing.avatar && profile.picture) {
      await client
        .execute({
          sql: "UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?;",
          args: [profile.picture.slice(0, 500), now, existing.id],
        })
        .catch(() => {});
    }
  } else {
    const userId = uid("usr");
    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash, name, avatar, role, plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'creator', 'free', ?, ?);",
      args: [userId, email, `oauth:google:${profile.sub}`, profile.name, profile.picture?.slice(0, 500) ?? null, now, now],
    });
    user = { id: userId, email, name: profile.name, avatar: profile.picture, role: "creator", plan: "free", createdAt: now, updatedAt: now };

    // Klaim slug bila dibawa dari /daftar atau /klaim
    const slug = state.slugToClaim;
    if (slug && !validSlug(slug)) {
      const taken = await client.execute({ sql: "SELECT id FROM pages WHERE slug = ? LIMIT 1;", args: [slug] });
      if (taken.rows.length === 0) {
        const pageId = uid("page");
        await client
          .execute({
            sql: "INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at) VALUES (?, ?, ?, ?, '', 'default', '#18181b', 0, 1, '[]', ?, ?);",
            args: [pageId, userId, slug, profile.name, now, now],
          })
          .catch(() => {});
        claimedSlug = slug;
      }
    }
  }

  const session = await createSession(user.id);
  const dest = claimedSlug ? `/dashboard/studio/${claimedSlug}` : state.redirect;
  const response = NextResponse.redirect(new URL(dest, appUrl));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  response.cookies.set({ name: OAUTH_STATE_COOKIE, value: "", maxAge: 0, path: "/" });
  return response;
}
