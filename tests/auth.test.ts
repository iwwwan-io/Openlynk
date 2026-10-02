import { describe, expect, test, beforeAll } from "bun:test";
import { client, ensureDbInitialized } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  validateSessionToken,
  getUserByEmail,
  getUserById,
  canManagePage,
} from "@/lib/auth";
import { uid, type User } from "@/lib/types";

beforeAll(async () => {
  await ensureDbInitialized();
});

describe("Password Hashing & Verification", () => {
  test("menghasilkan hash berformat salt:key dan dapat diverifikasi", () => {
    const raw = "KatasandiKreator123!";
    const hash = hashPassword(raw);
    expect(hash).toContain(":");
    const parts = hash.split(":");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBe(32); // 16 bytes hex

    expect(verifyPassword(raw, hash)).toBe(true);
    expect(verifyPassword("salahPassword", hash)).toBe(false);
    expect(verifyPassword("", hash)).toBe(false);
  });
});

describe("User & Session Management", () => {
  test("membuat user baru dan mengambil via email & id", async () => {
    const testUserId = uid("usr_test");
    const testEmail = `test_${Date.now()}@openlynk.id`;
    const passwordHash = hashPassword("rahasia123");
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
            VALUES (?, ?, ?, 'User Uji Coba', 'creator', ?, ?);`,
      args: [testUserId, testEmail, passwordHash, now, now],
    });

    const userByEmail = await getUserByEmail(testEmail.toUpperCase());
    expect(userByEmail).toBeDefined();
    expect(userByEmail?.id).toBe(testUserId);
    expect(userByEmail?.name).toBe("User Uji Coba");
    expect(userByEmail?.role).toBe("creator");

    const userById = await getUserById(testUserId);
    expect(userById).toBeDefined();
    expect(userById?.email).toBe(testEmail);

    // Sesi: buat session, validasi, lalu hapus
    const session = await createSession(testUserId);
    expect(session.token).toBeDefined();
    expect(session.token.length).toBe(64); // 32 bytes hex

    const validatedUser = await validateSessionToken(session.token);
    expect(validatedUser).toBeDefined();
    expect(validatedUser?.id).toBe(testUserId);

    await destroySession(session.token);
    const afterDestroy = await validateSessionToken(session.token);
    expect(afterDestroy).toBeNull();

    // Bersihkan
    await client.execute({ sql: "DELETE FROM users WHERE id = ?;", args: [testUserId] });
  });
});

describe("Page Ownership & Multi-Tenancy Authorization", () => {
  test("hanya pemilik halaman atau admin yang berhak mengelola halaman", async () => {
    const userA: User = {
      id: uid("usr_a"),
      email: "userA@test.com",
      name: "Kreator A",
      role: "creator",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userB: User = {
      id: uid("usr_b"),
      email: "userB@test.com",
      name: "Kreator B",
      role: "creator",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const adminUser: User = {
      id: uid("usr_adm"),
      email: "admin@test.com",
      name: "Admin Platform",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pageAId = uid("page_a");
    const now = new Date().toISOString();

    // Buat page milik User A
    await client.execute({
      sql: `INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, ?, 'slug-user-a', 'Halaman A', '', 'default', '#18181b', 0, 1, '[]', ?, ?);`,
      args: [pageAId, userA.id, now, now],
    });

    // 1. User A adalah pemilik -> boleh
    expect(await canManagePage(pageAId, userA)).toBe(true);

    // 2. User B bukan pemilik -> ditolak
    expect(await canManagePage(pageAId, userB)).toBe(false);

    // 3. User anonymous / null -> ditolak
    expect(await canManagePage(pageAId, null)).toBe(false);

    // 4. Admin platform -> selalu boleh
    expect(await canManagePage(pageAId, adminUser)).toBe(true);

    // Bersihkan
    await client.execute({ sql: "DELETE FROM pages WHERE id = ?;", args: [pageAId] });
  });
});

describe("Auth Routes & Multi-Tenant Endpoint Isolation", () => {
  test("Register, Login, Me, dan proteksi multi-tenant orders/analytics/subscribers", async () => {
    const { POST: registerPost } = await import("@/app/api/auth/register/route");
    const { POST: loginPost } = await import("@/app/api/auth/login/route");
    const { GET: meGet } = await import("@/app/api/auth/me/route");
    const { GET: ordersGet } = await import("@/app/api/orders/route");
    const { GET: analyticsGet } = await import("@/app/api/analytics/route");
    const { GET: subscribeGet } = await import("@/app/api/subscribe/route");

    const emailA = `creator_a_${Date.now()}@openlynk.id`;
    const emailB = `creator_b_${Date.now()}@openlynk.id`;

    // 1. Register User A
    const regReqA = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailA, password: "passwordA123", name: "Kreator A" }),
    });
    const regResA = await registerPost(regReqA);
    expect(regResA.status).toBe(201);
    const regDataA = await regResA.json();
    expect(regDataA.ok).toBe(true);
    expect(regDataA.user.email).toBe(emailA);

    // 2. Login User A
    const loginReqA = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailA, password: "passwordA123" }),
    });
    const loginResA = await loginPost(loginReqA);
    expect(loginResA.status).toBe(200);
    const loginDataA = await loginResA.json();
    const tokenA = loginDataA.token;
    expect(tokenA).toBeDefined();

    // 3. Register User B
    const regReqB = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailB, password: "passwordB123", name: "Kreator B" }),
    });
    const regResB = await registerPost(regReqB);
    const regDataB = await regResB.json();
    const userBId = regDataB.user.id;

    // Login User B
    const loginReqB = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailB, password: "passwordB123" }),
    });
    const loginResB = await loginPost(loginReqB);
    const loginDataB = await loginResB.json();
    const tokenB = loginDataB.token;

    // Buat Halaman milik User B
    const pageBId = uid("page_b");
    const now = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, ?, ?, 'Halaman B', '', 'default', '#18181b', 0, 1, '[]', ?, ?);`,
      args: [pageBId, userBId, `slug-b-${Date.now()}`, now, now],
    });

    // 4. Test GET /api/auth/me dengan Bearer token User A
    const meReqA = new Request("http://localhost/api/auth/me", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const meResA = await meGet(meReqA);
    expect(meResA.status).toBe(200);
    const meDataA = await meResA.json();
    expect(meDataA.user.email).toBe(emailA);
    // User A belum punya halaman, harusnya pages User A tidak ada Halaman B
    expect(meDataA.pages.some((p: { id: string }) => p.id === pageBId)).toBe(false);

    // 5. Test Multi-Tenant Route Isolation:
    // a. User A mencoba akses orders milik Page B -> ditolak 401
    const orderReqA = new Request(`http://localhost/api/orders?pageId=${pageBId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const orderResA = await ordersGet(orderReqA);
    expect(orderResA.status).toBe(401);

    // b. User B mengakses orders milik Page B -> diizinkan 200
    const orderReqB = new Request(`http://localhost/api/orders?pageId=${pageBId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const orderResB = await ordersGet(orderReqB);
    expect(orderResB.status).toBe(200);

    // c. User A mencoba akses analytics milik Page B -> ditolak 401
    const analyticsReqA = new Request(`http://localhost/api/analytics?pageId=${pageBId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const analyticsResA = await analyticsGet(analyticsReqA);
    expect(analyticsResA.status).toBe(401);

    // d. User B mengakses analytics milik Page B -> diizinkan 200
    const analyticsReqB = new Request(`http://localhost/api/analytics?pageId=${pageBId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const analyticsResB = await analyticsGet(analyticsReqB);
    expect(analyticsResB.status).toBe(200);

    // e. User A mencoba akses subscribers milik Page B -> ditolak 401
    const subReqA = new Request(`http://localhost/api/subscribe?pageId=${pageBId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const subResA = await subscribeGet(subReqA);
    expect(subResA.status).toBe(401);

    // f. User B mengakses subscribers milik Page B -> diizinkan 200
    const subReqB = new Request(`http://localhost/api/subscribe?pageId=${pageBId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const subResB = await subscribeGet(subReqB);
    expect(subResB.status).toBe(200);

    // Bersihkan data uji coba
    await client.execute({ sql: "DELETE FROM pages WHERE id = ?;", args: [pageBId] });
    await client.execute({ sql: "DELETE FROM users WHERE email IN (?, ?);", args: [emailA, emailB] });
  });
});

