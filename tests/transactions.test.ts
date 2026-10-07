import { describe, expect, test } from "bun:test";
import { client } from "@/lib/db";
import {
  getDb,
  createOrderDirect,
  markOrderPaid,
  markOrderCancelledOrExpired,
} from "@/lib/store";
import { uid, parseSawerProductId, type Order } from "@/lib/types";

describe("Sawer ProductId Parser", () => {
  test("mem-parsing sawer dengan bentoId dan pesan", () => {
    const res = parseSawerProductId("sawer:b_sawer_123:Semangat berkarya!");
    expect(res.isSawer).toBe(true);
    expect(res.bentoId).toBe("b_sawer_123");
    expect(res.message).toBe("Semangat berkarya!");
  });

  test("mem-parsing sawer tanpa bentoId", () => {
    const res = parseSawerProductId("sawer::Traktir kopi hangat");
    expect(res.isSawer).toBe(true);
    expect(res.bentoId).toBeUndefined();
    expect(res.message).toBe("Traktir kopi hangat");
  });

  test("mem-parsing format legacy tanpa pemisah bentoId", () => {
    const res = parseSawerProductId("sawer:Format lama");
    expect(res.isSawer).toBe(true);
    expect(res.bentoId).toBeUndefined();
    expect(res.message).toBe("Format lama");
  });

  test("mengembalikan isSawer false untuk produk reguler", () => {
    const res = parseSawerProductId("prod_digital_1");
    expect(res.isSawer).toBe(false);
    expect(res.message).toBe("");
  });
});

describe("Integritas Transaksi & Sawer Donation Lifecycle", () => {
  test("Sawer pending tidak menambah akumulasi dana sebelum paid", async () => {
    const db = await getDb();
    const demo = db.pages.find((p) => p.slug === "demo");
    expect(demo).toBeDefined();
    if (!demo) return;

    let sawerCard = demo.bento.find((b) => b.type === "sawer");
    if (!sawerCard) {
      sawerCard = {
        id: "b_sawer_test",
        type: "sawer",
        title: "Traktir Kopi & Dukung Kreator",
        message: "Dukungan Anda membantu saya terus membuat konten!",
        unitName: "Cangkir Kopi",
        unitPrice: 15000,
        targetAmount: 1000000,
        currentAmount: 0,
        size: "2x2",
        pos: { x: 0, y: 10 },
      };
      demo.bento.push(sawerCard);
      await client.execute({
        sql: "UPDATE pages SET bento = ? WHERE id = ?;",
        args: [JSON.stringify(demo.bento), demo.id],
      });
    }
    expect(sawerCard).toBeDefined();
    if (!sawerCard || sawerCard.type !== "sawer") return;

    const initialAmount = sawerCard.currentAmount ?? 0;
    const donationAmount = 25000;
    const orderId = uid("sawer_test");

    // 1. Simulasikan pembuatan order pending
    const order: Order = {
      id: orderId,
      productId: `sawer:${sawerCard.id}:Tetap semangat!`,
      pageId: demo.id,
      buyerName: "Donatur Uji",
      buyerContact: "donatur@test.com",
      qty: 1,
      totalIdr: donationAmount,
      feeIdr: 1250,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await createOrderDirect(order);

    // Verifikasi bento saat pending: currentAmount TIDAK boleh bertambah
    const dbAfterPending = await getDb();
    const demoAfterPending = dbAfterPending.pages.find((p) => p.slug === "demo");
    const sawerAfterPending = demoAfterPending?.bento.find((b) => b.id === sawerCard.id);
    expect(sawerAfterPending?.type === "sawer" ? sawerAfterPending.currentAmount ?? 0 : 0).toBe(initialAmount);

    // 2. Tandai paid via markOrderPaid
    const paidResult = await markOrderPaid(orderId);
    expect(paidResult.newlyPaid).toBe(true);
    expect(paidResult.order?.status).toBe("paid");

    // Verifikasi bento setelah paid: currentAmount bertambah sesuai nominal
    const dbAfterPaid = await getDb();
    const demoAfterPaid = dbAfterPaid.pages.find((p) => p.slug === "demo");
    const sawerAfterPaid = demoAfterPaid?.bento.find((b) => b.id === sawerCard.id);
    expect(sawerAfterPaid?.type === "sawer" ? sawerAfterPaid.currentAmount ?? 0 : 0).toBe(initialAmount + donationAmount);

    // 3. Idempotency test: memanggil markOrderPaid lagi tidak menambah donasi dobel
    const secondPaidResult = await markOrderPaid(orderId);
    expect(secondPaidResult.newlyPaid).toBe(false);

    const dbAfterSecond = await getDb();
    const demoAfterSecond = dbAfterSecond.pages.find((p) => p.slug === "demo");
    const sawerAfterSecond = demoAfterSecond?.bento.find((b) => b.id === sawerCard.id);
    expect(sawerAfterSecond?.type === "sawer" ? sawerAfterSecond.currentAmount ?? 0 : 0).toBe(initialAmount + donationAmount);

    // Bersihkan data uji
    await client.execute({ sql: "DELETE FROM orders WHERE id = ?;", args: [orderId] });
    sawerCard.currentAmount = initialAmount;
    await client.execute({
      sql: "UPDATE pages SET bento = ? WHERE id = ?;",
      args: [JSON.stringify(demo.bento), demo.id],
    });
  });
});

describe("Siklus Hidup Stok & Kupon pada Pembatalan / Kedaluwarsa", () => {
  test("Stok produk dan kuota kupon dikembalikan saat order dibatalkan (cancelled/expired)", async () => {
    const testProductId = uid("prod_test");
    const testCouponId = uid("coup_test");
    const testCouponCode = "TESTREVERT";
    const initialStock = 10;
    const orderQty = 2;

    // Buat produk uji dengan stok 10
    await client.execute({
      sql: `INSERT INTO products (id, page_id, name, description, price_idr, stock, kind, is_active, created_at)
            VALUES (?, 'page_demo', 'Produk Tes Revert', 'Uji coba', 50000, ?, 'fisik', 1, ?);`,
      args: [testProductId, initialStock, new Date().toISOString()],
    });

    // Buat kupon uji dengan usedCount = 1
    await client.execute({
      sql: `INSERT INTO coupons (id, page_id, code, discount_type, discount_value, used_count, is_active, created_at)
            VALUES (?, 'page_demo', ?, 'fixed', 10000, 1, 1, ?);`,
      args: [testCouponId, testCouponCode, new Date().toISOString()],
    });

    // Buat order pending yang telah memotong stok 2 (stok tersisa 8)
    await client.execute({
      sql: "UPDATE products SET stock = stock - ? WHERE id = ?;",
      args: [orderQty, testProductId],
    });

    const testOrderId = uid("order_test_revert");
    const testOrder: Order = {
      id: testOrderId,
      productId: testProductId,
      pageId: "page_demo",
      buyerName: "Pembeli Uji",
      buyerContact: "pembeli@test.com",
      qty: orderQty,
      totalIdr: 90000,
      feeIdr: 4500,
      status: "pending",
      couponCode: testCouponCode,
      discountIdr: 10000,
      createdAt: new Date().toISOString(),
    };
    await createOrderDirect(testOrder);

    // Pastikan stok sekarang 8
    const checkProdBefore = await client.execute({
      sql: "SELECT stock FROM products WHERE id = ?;",
      args: [testProductId],
    });
    expect(Number(checkProdBefore.rows[0]?.stock)).toBe(8);

    // Batalkan order via markOrderCancelledOrExpired
    const cancelResult = await markOrderCancelledOrExpired(testOrderId, "cancelled");
    expect(cancelResult.newlyReverted).toBe(true);
    expect(cancelResult.order?.status).toBe("cancelled");

    // Verifikasi stok dikembalikan menjadi 10
    const checkProdAfter = await client.execute({
      sql: "SELECT stock FROM products WHERE id = ?;",
      args: [testProductId],
    });
    expect(Number(checkProdAfter.rows[0]?.stock)).toBe(10);

    // Verifikasi kupon usedCount dikurangi kembali menjadi 0
    const checkCouponAfter = await client.execute({
      sql: "SELECT used_count FROM coupons WHERE id = ?;",
      args: [testCouponId],
    });
    expect(Number(checkCouponAfter.rows[0]?.used_count)).toBe(0);

    // Idempotency: memanggil lagi tidak me-revert dobel
    const secondCancel = await markOrderCancelledOrExpired(testOrderId, "cancelled");
    expect(secondCancel.newlyReverted).toBe(false);

    const checkProdFinal = await client.execute({
      sql: "SELECT stock FROM products WHERE id = ?;",
      args: [testProductId],
    });
    expect(Number(checkProdFinal.rows[0]?.stock)).toBe(10);

    // Bersihkan data uji
    await client.execute({ sql: "DELETE FROM orders WHERE id = ?;", args: [testOrderId] });
    await client.execute({ sql: "DELETE FROM products WHERE id = ?;", args: [testProductId] });
    await client.execute({ sql: "DELETE FROM coupons WHERE id = ?;", args: [testCouponId] });
  });
});
