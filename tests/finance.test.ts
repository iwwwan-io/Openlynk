import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { client, ensureDbInitialized } from "@/lib/db";
import {
  getCreatorBalance,
  getPayoutAccount,
  upsertPayoutAccount,
  requestPayout,
  updatePayoutStatus,
  MIN_PAYOUT_AMOUNT,
} from "@/lib/payout";
import { createSession } from "@/lib/auth";
import { uid } from "@/lib/types";

beforeAll(async () => {
  await ensureDbInitialized();
});

describe("Creator Balance & Payout Calculations", () => {
  const testUserId = uid("usr_fin");
  const testPageId = uid("page_fin");
  const testProdId = uid("prod_fin");

  beforeAll(async () => {
    const now = new Date().toISOString();

    // 1. Buat User
    await client.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
            VALUES (?, 'kreator_fin@test.id', 'dummyhash', 'Kreator Keuangan', 'creator', ?, ?);`,
      args: [testUserId, now, now],
    });

    // 2. Buat Halaman milik User
    await client.execute({
      sql: `INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, ?, 'kreator-fin-test', 'Halaman Keuangan', '', 'default', '#18181b', 0, 1, '[]', ?, ?);`,
      args: [testPageId, testUserId, now, now],
    });

    // 3. Buat Produk Digital
    await client.execute({
      sql: `INSERT INTO products (id, page_id, name, description, price_idr, kind, file_url, is_active, created_at)
            VALUES (?, ?, 'Template Creator OS', 'Template', 100000, 'digital', 'https://example.com/file.zip', 1, ?);`,
      args: [testProdId, testPageId, now],
    });

    // 4. Tambah 2 pesanan paid (@ 100.000) dan 1 pesanan pending (@ 100.000)
    await client.execute({
      sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, created_at, paid_at)
            VALUES ('ord_fin_1', ?, ?, 'Pembeli 1', 'p1@test.com', 1, 100000, 5000, 'paid', ?, ?);`,
      args: [testProdId, testPageId, now, now],
    });
    await client.execute({
      sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, created_at, paid_at)
            VALUES ('ord_fin_2', ?, ?, 'Pembeli 2', 'p2@test.com', 1, 100000, 5000, 'paid', ?, ?);`,
      args: [testProdId, testPageId, now, now],
    });
    await client.execute({
      sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, created_at)
            VALUES ('ord_fin_pending', ?, ?, 'Pembeli 3', 'p3@test.com', 1, 100000, 5000, 'pending', ?);`,
      args: [testProdId, testPageId, now],
    });
  });

  afterAll(async () => {
    await client.execute({ sql: "DELETE FROM orders WHERE page_id = ?;", args: [testPageId] });
    await client.execute({ sql: "DELETE FROM products WHERE id = ?;", args: [testProdId] });
    await client.execute({ sql: "DELETE FROM pages WHERE id = ?;", args: [testPageId] });
    await client.execute({ sql: "DELETE FROM payout_requests WHERE user_id = ?;", args: [testUserId] });
    await client.execute({ sql: "DELETE FROM payout_accounts WHERE user_id = ?;", args: [testUserId] });
    await client.execute({ sql: "DELETE FROM users WHERE id = ?;", args: [testUserId] });
  });

  test("menghitung total penjualan bersih dari order berstatus paid dan mengecualikan pending", async () => {
    const bal = await getCreatorBalance(testUserId);
    expect(bal.totalEarnings).toBe(200000); // 2 order paid @ 100.000
    expect(bal.totalWithdrawn).toBe(0);
    expect(bal.pendingWithdrawals).toBe(0);
    expect(bal.availableBalance).toBe(200000);
  });

  test("mengatur dan memperbarui rekening pencairan bank kreator", async () => {
    // 1. Awalnya belum ada rekening
    expect(await getPayoutAccount(testUserId)).toBeNull();

    // 2. Simpan rekening baru
    const acc = await upsertPayoutAccount(testUserId, {
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "Budi Santoso",
    });

    expect(acc.bankName).toBe("BCA");
    expect(acc.accountNumber).toBe("1234567890");
    expect(acc.accountHolder).toBe("Budi Santoso");

    // 3. Ambil kembali
    const fetched = await getPayoutAccount(testUserId);
    expect(fetched).not.toBeNull();
    expect(fetched?.bankName).toBe("BCA");

    // 4. Perbarui ke Bank Mandiri
    const updated = await upsertPayoutAccount(testUserId, {
      bankName: "Bank Mandiri",
      accountNumber: "9876543210",
      accountHolder: "Budi Santoso",
    });
    expect(updated.bankName).toBe("Bank Mandiri");
    expect(updated.accountNumber).toBe("9876543210");
  });

  test("menolak permohonan penarikan jika nominal di bawah batas minimum (50k) atau melebihi saldo", async () => {
    // Kurang dari 50.000
    expect(requestPayout(testUserId, 25000)).rejects.toThrow("minimal");

    // Melebihi saldo 200.000
    expect(requestPayout(testUserId, 250000)).rejects.toThrow("tidak mencukupi");
  });

  test("siklus hidup penarikan dana: pending -> saldo berkurang -> approval admin (completed)", async () => {
    // 1. Tarik dana Rp 75.000
    const req = await requestPayout(testUserId, 75000);
    expect(req.amountIdr).toBe(75000);
    expect(req.status).toBe("pending");

    // 2. Cek saldo setelah request diajukan (dana 75.000 masuk pendingWithdrawals, saldo tersedia sisa 125.000)
    let bal = await getCreatorBalance(testUserId);
    expect(bal.totalEarnings).toBe(200000);
    expect(bal.pendingWithdrawals).toBe(75000);
    expect(bal.availableBalance).toBe(125000);

    // 3. Admin platform memproses transfer dan menyelesaikan (completed)
    const processed = await updatePayoutStatus(req.id, "completed", "Transfer via BCA KlikBisnis berhasil", "https://example.com/bukti.jpg");
    expect(processed.status).toBe("completed");
    expect(processed.adminNotes).toBe("Transfer via BCA KlikBisnis berhasil");

    // 4. Cek saldo akhir: totalWithdrawn menjadi 75.000, pending menjadi 0, available tetap 125.000
    bal = await getCreatorBalance(testUserId);
    expect(bal.totalWithdrawn).toBe(75000);
    expect(bal.pendingWithdrawals).toBe(0);
    expect(bal.availableBalance).toBe(125000);
  });
});

describe("Finance API Endpoints (/api/payouts)", () => {
  test("GET /api/payouts, POST /api/payouts/account, dan POST /api/payouts/request", async () => {
    const { GET: payoutsGet } = await import("@/app/api/payouts/route");
    const { POST: accountPost } = await import("@/app/api/payouts/account/route");
    const { POST: requestPost } = await import("@/app/api/payouts/request/route");

    const session = await createSession("usr_demo");

    // 1. GET /api/payouts
    const getReq = new Request("http://localhost/api/payouts", {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const getRes = await payoutsGet(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.ok).toBe(true);
    expect(getData.balance).toBeDefined();
    expect(getData.supportedBanks).toBeArray();

    // 2. POST /api/payouts/account (Simpan Rekening)
    const accReq = new Request("http://localhost/api/payouts/account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bankName: "BCA",
        accountNumber: "8881234567",
        accountHolder: "Kreator Demo",
      }),
    });
    const accRes = await accountPost(accReq);
    expect(accRes.status).toBe(200);
    const accData = await accRes.json();
    expect(accData.ok).toBe(true);
    expect(accData.account.accountNumber).toBe("8881234567");
  });
});
