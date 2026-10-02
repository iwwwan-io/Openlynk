import crypto from "node:crypto";
import { cookies } from "next/headers";
import { client, ensureDbInitialized } from "./db";
import { uid, type User, type Session } from "./types";

export const SESSION_COOKIE_NAME = "openlynk_session";
const SESSION_DURATION_DAYS = 30;

export function adminRequired(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}

export function isAdmin(req?: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return true;
  if (!req) return false;
  const h =
    req.headers.get("authorization") ?? req.headers.get("x-admin-token") ?? "";
  const bearer = h.startsWith("Bearer ") ? h.slice(7) : h;
  return bearer === token;
}

// 1. Password Hashing (scrypt with random 16-byte salt)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// 2. Cookie parser helper
export function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// 3. User Queries & Mutations
export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  await ensureDbInitialized();
  const res = await client.execute({
    sql: "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1;",
    args: [email.toLowerCase().trim()],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0] as Record<string, unknown>;
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    avatar: r.avatar ? String(r.avatar) : undefined,
    role: (r.role as "creator" | "admin") || "creator",
    passwordHash: String(r.password_hash),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureDbInitialized();
  const res = await client.execute({
    sql: "SELECT * FROM users WHERE id = ? LIMIT 1;",
    args: [id],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0] as Record<string, unknown>;
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    avatar: r.avatar ? String(r.avatar) : undefined,
    role: (r.role as "creator" | "admin") || "creator",
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

// 4. Session Management
export async function createSession(userId: string): Promise<Session> {
  await ensureDbInitialized();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const session: Session = {
    id: uid("ses"),
    userId,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  await client.execute({
    sql: "INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?);",
    args: [session.id, session.userId, session.token, session.expiresAt, session.createdAt],
  });

  return session;
}

export async function destroySession(token: string): Promise<void> {
  await ensureDbInitialized();
  await client.execute({
    sql: "DELETE FROM sessions WHERE token = ?;",
    args: [token],
  });
}

export async function validateSessionToken(token: string): Promise<User | null> {
  if (!token) return null;
  await ensureDbInitialized();

  const res = await client.execute({
    sql: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.name, u.avatar, u.role, u.created_at, u.updated_at
          FROM sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.token = ? LIMIT 1;`,
    args: [token],
  });

  if (res.rows.length === 0) return null;
  const r = res.rows[0] as Record<string, unknown>;

  // Cek apakah session kedaluwarsa
  if (new Date(String(r.expires_at)).getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }

  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    avatar: r.avatar ? String(r.avatar) : undefined,
    role: (r.role as "creator" | "admin") || "creator",
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

// 5. Ekstraksi User dari Request atau Cookies
export async function getSessionUser(req?: Request): Promise<User | null> {
  let token: string | null = null;

  if (req) {
    // 1. Coba Authorization Header (Bearer ...)
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const candidate = authHeader.slice(7).trim();
      // Jangan pakai jika itu ADMIN_TOKEN murni
      if (candidate !== process.env.ADMIN_TOKEN) {
        token = candidate;
      }
    }

    // 2. Coba header x-session-token
    if (!token) {
      token = req.headers.get("x-session-token");
    }

    // 3. Coba dari Cookie header di request
    if (!token) {
      token = parseCookie(req.headers.get("cookie"), SESSION_COOKIE_NAME);
    }
  }

  // 4. Jika tidak ada di req atau req kosong, coba cookies() Next.js
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
    } catch {
      // Diluar context HTTP Next.js (misal di worker atau tes), abaikan
    }
  }

  if (!token) return null;
  return validateSessionToken(token);
}

// 6. Verifikasi Kepemilikan Halaman (Authorization)
export async function canManagePage(
  pageIdOrSlug: string,
  user: User | null,
  req?: Request
): Promise<boolean> {
  // Jika pemanggil adalah admin via ADMIN_TOKEN
  if (req && isAdmin(req) && process.env.ADMIN_TOKEN) {
    return true;
  }

  // Jika user adalah admin platform
  if (user && user.role === "admin") {
    return true;
  }

  await ensureDbInitialized();
  const res = await client.execute({
    sql: "SELECT id, user_id FROM pages WHERE id = ? OR slug = ? LIMIT 1;",
    args: [pageIdOrSlug, pageIdOrSlug],
  });

  if (res.rows.length === 0) return false;
  const page = res.rows[0] as Record<string, unknown>;

  // Jika user login cocok dengan pemilik halaman
  if (user && page.user_id && String(page.user_id) === user.id) {
    return true;
  }

  // Jika halaman belum memiliki user_id (unclaimed/legacy) dan ada ADMIN_TOKEN yang cocok atau mode sandbox
  if (!page.user_id) {
    if (!process.env.ADMIN_TOKEN) return true; // dev sandbox
    if (req && isAdmin(req)) return true;
  }

  return false;
}
