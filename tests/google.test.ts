import { describe, expect, test, beforeAll, afterAll } from "bun:test";

const saved: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const k of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "BETTER_AUTH_SECRET", "ADMIN_TOKEN"]) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterAll(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("Google OAuth config", () => {
  test("tidak terkonfigurasi bila env kosong", async () => {
    const { isGoogleConfigured } = await import("@/lib/google");
    expect(isGoogleConfigured()).toBe(false);
  });

  test("providers + authorize menolak dengan sopan bila belum dikonfigurasi", async () => {
    const { GET: providers } = await import("@/app/api/auth/providers/route");
    const p = await providers();
    expect((await p.json()).google).toBe(false);

    const { GET: start } = await import("@/app/api/auth/google/route");
    const s = await start(
      new Request("http://localhost/api/auth/google", { headers: { "x-forwarded-for": "10.99.9.1" } })
    );
    expect(s.status).toBe(501);
  });
});

describe("OAuth state sign/verify", () => {
  test("roundtrip valid, modifikasi ditolak", async () => {
    process.env.BETTER_AUTH_SECRET = "unit-test-secret";
    process.env.GOOGLE_CLIENT_ID = "test-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-secret";
    const { signState, verifyState, isGoogleConfigured } = await import("@/lib/google");
    expect(isGoogleConfigured()).toBe(true);

    const state = signState({ nonce: "abc123", redirect: "/dashboard" });
    const back = verifyState(state);
    expect(back?.nonce).toBe("abc123");
    expect(back?.redirect).toBe("/dashboard");

    // Tamper payload
    const [payload, sig] = state.split(".");
    const forged = Buffer.from(JSON.stringify({ nonce: "jahat", redirect: "/", exp: Date.now() + 60000 })).toString("base64url");
    expect(verifyState(`${forged}.${sig}`)).toBeNull();
    // Format rusak
    expect(verifyState("bukan-state")).toBeNull();
    expect(verifyState("")).toBeNull();

    delete process.env.BETTER_AUTH_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  test("verifikasi gagal bila secret berbeda", async () => {
    process.env.BETTER_AUTH_SECRET = "secret-a";
    const { signState, verifyState } = await import("@/lib/google");
    const state = signState({ nonce: "n", redirect: "/dashboard" });
    process.env.BETTER_AUTH_SECRET = "secret-b";
    expect(verifyState(state)).toBeNull();
    delete process.env.BETTER_AUTH_SECRET;
  });
});
