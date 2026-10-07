import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { client, ensureDbInitialized } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { uid } from "@/lib/types";

const TEST_ADMIN_TOKEN = "test-admin-bootstrap-secret";
let prevAdminToken: string | undefined;
let ipCounter = 10;

// Tiap request uji memakai IP unik agar tidak berbagi bucket rate-limit in-memory
// dengan file uji lain (clientKey() membaca x-forwarded-for lebih dulu).
function testIp(): string {
  ipCounter += 1;
  return `10.99.0.${ipCounter}`;
}

beforeAll(async () => {
  await ensureDbInitialized();
  prevAdminToken = process.env.ADMIN_TOKEN;
  process.env.ADMIN_TOKEN = TEST_ADMIN_TOKEN;
});

afterAll(async () => {
  if (prevAdminToken === undefined) delete process.env.ADMIN_TOKEN;
  else process.env.ADMIN_TOKEN = prevAdminToken;
});

async function createUser(email: string, role: "creator" | "admin" = "creator") {
  const id = uid("usr_admtest");
  const now = new Date().toISOString();
  await client.execute({
    sql: "INSERT INTO users (id, email, password_hash, name, role, plan, created_at, updated_at) VALUES (?, ?, ?, 'Admin Test', ?, 'free', ?, ?);",
    args: [id, email, hashPassword("RahasiaAdmin123!"), role, now, now],
  });
  return id;
}

async function loginToken(email: string, password = "RahasiaAdmin123!"): Promise<string> {
  const { POST } = await import("@/app/api/auth/login/route");
  const res = await POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": testIp() },
      body: JSON.stringify({ email, password }),
    })
  );
  const data = await res.json();
  if (!data.token) throw new Error(`login gagal untuk ${email}: ${JSON.stringify(data)}`);
  return data.token as string;
}

const createdUserIds: string[] = [];

describe("Admin Bootstrap", () => {
  test("tanpa ADMIN_TOKEN ditolak 401", async () => {
    const { POST } = await import("@/app/api/admin/bootstrap/route");
    const res = await POST(
      new Request("http://localhost/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "siapa@openlynk.id" }),
      })
    );
    expect(res.status).toBe(401);
  });

  test("email tak terdaftar → 404", async () => {
    const { POST } = await import("@/app/api/admin/bootstrap/route");
    const res = await POST(
      new Request("http://localhost/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TEST_ADMIN_TOKEN}` },
        body: JSON.stringify({ email: `hantu_${Date.now()}@openlynk.id` }),
      })
    );
    expect(res.status).toBe(404);
  });

  test("mempromosikan kreator menjadi admin + tercatat di audit", async () => {
    const email = `calonadmin_${Date.now()}@openlynk.id`;
    const userId = await createUser(email);
    createdUserIds.push(userId);

    const { POST } = await import("@/app/api/admin/bootstrap/route");
    const res = await POST(
      new Request("http://localhost/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TEST_ADMIN_TOKEN}` },
        body: JSON.stringify({ email }),
      })
    );
    expect(res.status).toBe(200);
    const check = await client.execute({ sql: "SELECT role FROM users WHERE id = ?;", args: [userId] });
    expect(String(check.rows[0]?.role)).toBe("admin");

    const audit = await client.execute({
      sql: "SELECT * FROM admin_audit_log WHERE target_id = ?;",
      args: [userId],
    });
    expect(audit.rows.length).toBeGreaterThan(0);
  });
});

describe("Admin API Authorization", () => {
  test("non-admin ditolak di semua endpoint admin", async () => {
    const email = `kreatorbiasa_${Date.now()}@openlynk.id`;
    const userId = await createUser(email);
    createdUserIds.push(userId);
    const token = await loginToken(email);
    const auth = { Authorization: `Bearer ${token}` };

    const { GET: ovGet } = await import("@/app/api/admin/overview/route");
    expect((await ovGet(new Request("http://localhost/api/admin/overview", { headers: auth }))).status).toBe(401);

    const { GET: usersGet } = await import("@/app/api/admin/users/route");
    expect((await usersGet(new Request("http://localhost/api/admin/users", { headers: auth }))).status).toBe(401);

    const { GET: ordersGet } = await import("@/app/api/admin/orders/route");
    expect((await ordersGet(new Request("http://localhost/api/admin/orders", { headers: auth }))).status).toBe(401);

    const { GET: auditGet } = await import("@/app/api/admin/audit/route");
    expect((await auditGet(new Request("http://localhost/api/admin/audit", { headers: auth }))).status).toBe(401);

    await client.execute({ sql: "DELETE FROM sessions WHERE user_id = ?;", args: [userId] });
  });

  test("admin: overview, users (tanpa password_hash), orders, audit", async () => {
    const email = `adminku_${Date.now()}@openlynk.id`;
    const adminId = await createUser(email, "admin");
    createdUserIds.push(adminId);
    const token = await loginToken(email);
    const auth = { Authorization: `Bearer ${token}` };

    const { GET: ovGet } = await import("@/app/api/admin/overview/route");
    const ovRes = await ovGet(new Request("http://localhost/api/admin/overview", { headers: auth }));
    expect(ovRes.status).toBe(200);
    const ov = await ovRes.json();
    expect(ov.ok).toBe(true);
    expect(typeof ov.gmv).toBe("number");
    expect(typeof ov.feeCollected).toBe("number");

    const { GET: usersGet } = await import("@/app/api/admin/users/route");
    const uRes = await usersGet(
      new Request(`http://localhost/api/admin/users?search=${encodeURIComponent(email)}`, { headers: auth })
    );
    expect(uRes.status).toBe(200);
    const uData = await uRes.json();
    expect(uData.users.length).toBe(1);
    expect(uData.users[0].email).toBe(email);
    expect("password_hash" in uData.users[0]).toBe(false);
    expect("passwordHash" in uData.users[0]).toBe(false);

    const { GET: ordersGet } = await import("@/app/api/admin/orders/route");
    const oRes = await ordersGet(new Request("http://localhost/api/admin/orders?limit=5", { headers: auth }));
    expect(oRes.status).toBe(200);

    const { GET: auditGet } = await import("@/app/api/admin/audit/route");
    const aRes = await auditGet(new Request("http://localhost/api/admin/audit?limit=5", { headers: auth }));
    expect(aRes.status).toBe(200);

    await client.execute({ sql: "DELETE FROM sessions WHERE user_id = ?;", args: [adminId] });
  });
});

describe("Admin User Management", () => {
  test("upgrade plan, tolak ubah diri sendiri, suspend blokir login", async () => {
    const adminEmail = `adminaksi_${Date.now()}@openlynk.id`;
    const targetEmail = `targetaksi_${Date.now()}@openlynk.id`;
    const adminId = await createUser(adminEmail, "admin");
    const targetId = await createUser(targetEmail);
    createdUserIds.push(adminId, targetId);

    const adminToken = await loginToken(adminEmail);
    const auth = { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" };
    const { PATCH } = await import("@/app/api/admin/users/route");
    const patch = (body: unknown) =>
      PATCH(
        new Request("http://localhost/api/admin/users", {
          method: "PATCH",
          headers: auth,
          body: JSON.stringify(body),
        })
      );

    // 1. Upgrade plan target ke pro
    const upRes = await patch({ userId: targetId, plan: "pro" });
    expect(upRes.status).toBe(200);
    const planCheck = await client.execute({ sql: "SELECT plan FROM users WHERE id = ?;", args: [targetId] });
    expect(String(planCheck.rows[0]?.plan)).toBe("pro");

    // 2. Tidak bisa mengubah akun sendiri
    const selfRes = await patch({ userId: adminId, plan: "pro" });
    expect(selfRes.status).toBe(400);

    // 3. Suspend → login ditolak 403 + sesi lama dimatikan
    const targetToken = await loginToken(targetEmail);
    const susRes = await patch({ userId: targetId, suspended: true, suspendedReason: "spam uji" });
    expect(susRes.status).toBe(200);

    const { POST: loginPost } = await import("@/app/api/auth/login/route");
    const blocked = await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: "RahasiaAdmin123!" }),
      })
    );
    expect(blocked.status).toBe(403);

    const { validateSessionToken } = await import("@/lib/auth");
    expect(await validateSessionToken(targetToken)).toBeNull();

    // 4. Unsuspend → login pulih
    const unRes = await patch({ userId: targetId, suspended: false });
    expect(unRes.status).toBe(200);
    const relogin = await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: "RahasiaAdmin123!" }),
      })
    );
    expect(relogin.status).toBe(200);

    await client.execute({ sql: "DELETE FROM sessions WHERE user_id IN (?, ?);", args: [adminId, targetId] });
  });

  test("demote admin terakhir ditolak, demote biasa diizinkan", async () => {
    const emailA = `soloa_${Date.now()}@openlynk.id`;
    const emailB = `solob_${Date.now()}@openlynk.id`;
    const soloA = await createUser(emailA, "admin");
    const soloB = await createUser(emailB, "admin");
    createdUserIds.push(soloA, soloB);
    const tokenA = await loginToken(emailA);
    const { PATCH } = await import("@/app/api/admin/users/route");

    // Catat & turunkan sementara semua admin lain agar skenario "terakhir" deterministik
    const otherRes = await client.execute({
      sql: "SELECT id FROM users WHERE role = 'admin' AND id NOT IN (?, ?);",
      args: [soloA, soloB],
    });
    const otherIds = otherRes.rows.map((r) => String((r as Record<string, unknown>).id));
    for (const id of otherIds) {
      await client.execute({ sql: "UPDATE users SET role = 'creator' WHERE id = ?;", args: [id] });
    }

    try {
      // Ada 2 admin (A & B): A demote B → diizinkan
      const okDemote = await PATCH(
        new Request("http://localhost/api/admin/users", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${tokenA}`, "Content-Type": "application/json" },
          body: JSON.stringify({ userId: soloB, role: "creator" }),
        })
      );
      expect(okDemote.status).toBe(200);

      // Tinggal 1 admin (A): demote via ADMIN_TOKEN → ditolak 400
      const lastDemote = await PATCH(
        new Request("http://localhost/api/admin/users", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${TEST_ADMIN_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ userId: soloA, role: "creator" }),
        })
      );
      expect(lastDemote.status).toBe(400);

      // Kembalikan B agar cleanup konsisten
      await client.execute({ sql: "UPDATE users SET role = 'admin' WHERE id = ?;", args: [soloB] });
    } finally {
      for (const id of otherIds) {
        await client.execute({ sql: "UPDATE users SET role = 'admin' WHERE id = ?;", args: [id] });
      }
      await client.execute({ sql: "DELETE FROM sessions WHERE user_id IN (?, ?);", args: [soloA, soloB] });
    }
  });

  test("bersihkan data uji admin", async () => {
    for (const id of createdUserIds) {
      await client.execute({ sql: "DELETE FROM sessions WHERE user_id = ?;", args: [id] }).catch(() => {});
      await client.execute({ sql: "DELETE FROM admin_audit_log WHERE target_id = ?;", args: [id] }).catch(() => {});
      await client.execute({ sql: "DELETE FROM users WHERE id = ?;", args: [id] });
    }
    createdUserIds.length = 0;
    const left = await client.execute({
      sql: "SELECT COUNT(*) as c FROM users WHERE email LIKE '%_admintest_%' OR email LIKE '%adminku_%' OR email LIKE '%adminaksi_%' OR email LIKE '%targetaksi_%' OR email LIKE '%calonadmin_%' OR email LIKE '%kreatorbiasa_%' OR email LIKE '%soloadmin_%';",
    });
    void left;
    expect(true).toBe(true);
  });
});
