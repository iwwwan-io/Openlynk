import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { client, ensureDbInitialized } from "@/lib/db";
import {
  formatIndonesianPhone,
  sendWhatsAppMessage,
  sendDigitalDeliveryWhatsApp,
} from "@/lib/whatsapp";
import { uid } from "@/lib/types";

beforeAll(async () => {
  await ensureDbInitialized();
});

describe("WhatsApp Phone Formatter & Gateway", () => {
  test("memformat berbagai format nomor telepon Indonesia menjadi standar 628xxx", () => {
    expect(formatIndonesianPhone("081234567890")).toBe("6281234567890");
    expect(formatIndonesianPhone("+62 812-3456-7890")).toBe("6281234567890");
    expect(formatIndonesianPhone("6281234567890")).toBe("6281234567890");
    expect(formatIndonesianPhone("81234567890")).toBe("6281234567890");
    expect(formatIndonesianPhone("0857-1234-5678")).toBe("6285712345678");

    // Email atau string non-telepon harus mengembalikan null
    expect(formatIndonesianPhone("pembeli@gmail.com")).toBeNull();
    expect(formatIndonesianPhone("")).toBeNull();
    expect(formatIndonesianPhone("1234")).toBeNull();
  });

  test("berjalan dalam mode log saat kredensial gateway tidak disetel", async () => {
    const res = await sendWhatsAppMessage({
      to: "081234567890",
      message: "Halo dari OpenLynk",
    });
    expect(res.sent).toBe(false);
    expect(res.mode).toBe("log");
  });

  test("membuat template pesan pengiriman digital WhatsApp dengan tautan aman", async () => {
    const res = await sendDigitalDeliveryWhatsApp({
      buyerName: "Budi Santoso",
      buyerContact: "081299998888",
      productName: "Ebook Masterclass Creator",
      creatorName: "Alex Pratama",
      downloadUrl: "/api/downloads/ord_123?contact=081299998888",
      orderId: "ord_123",
      appUrl: "https://openlynk.id",
    });

    expect(res.mode).toBe("log");
  });
});

describe("Buyer Access Portal API (/api/buyer/orders)", () => {
  const testPageId = uid("page_buyer_test");
  const testProdId = uid("prod_buyer_test");
  const testPaidOrderId = uid("ord_buyer_paid");
  const testPendingOrderId = uid("ord_buyer_pending");
  const buyerPhone = "081277778888";
  const buyerEmail = "pembeli_digital@openlynk.id";

  beforeAll(async () => {
    const now = new Date().toISOString();
    // 1. Buat Halaman
    await client.execute({
      sql: `INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, 'usr_demo', 'slug-buyer-portal', 'Studio Alex', '', 'default', '#18181b', 0, 1, '[]', ?, ?);`,
      args: [testPageId, now, now],
    });

    // 2. Buat Produk Digital
    await client.execute({
      sql: `INSERT INTO products (id, page_id, name, description, price_idr, kind, file_url, is_active, created_at)
            VALUES (?, ?, 'Template Notion Builder', 'Template productivity', 75000, 'digital', 'https://raw.githubusercontent.com/example/notion.zip', 1, ?);`,
      args: [testProdId, testPageId, now],
    });

    // 3. Buat Order Paid dengan nomor telepon
    await client.execute({
      sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, created_at, paid_at)
            VALUES (?, ?, ?, 'Budi Telepon', ?, 1, 75000, 3750, 'paid', ?, ?);`,
      args: [testPaidOrderId, testProdId, testPageId, buyerPhone, now, now],
    });

    // 4. Buat Order Pending (tidak boleh muncul di portal)
    await client.execute({
      sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, created_at)
            VALUES (?, ?, ?, 'Budi Pending', ?, 1, 75000, 3750, 'pending', ?);`,
      args: [testPendingOrderId, testProdId, testPageId, buyerPhone, now],
    });
  });

  afterAll(async () => {
    await client.execute({ sql: "DELETE FROM orders WHERE id IN (?, ?);", args: [testPaidOrderId, testPendingOrderId] });
    await client.execute({ sql: "DELETE FROM products WHERE id = ?;", args: [testProdId] });
    await client.execute({ sql: "DELETE FROM pages WHERE id = ?;", args: [testPageId] });
  });

  test("menolak input pencarian kosong", async () => {
    const { POST: buyerOrdersPost } = await import("@/app/api/buyer/orders/route");
    const req = new Request("http://localhost/api/buyer/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: "  " }),
    });
    const res = await buyerOrdersPost(req);
    expect(res.status).toBe(400);
  });

  test("menemukan pesanan lunas menggunakan nomor telepon dalam format berbeda (0812 vs 62812)", async () => {
    const { POST: buyerOrdersPost } = await import("@/app/api/buyer/orders/route");

    // Input format +62 812-7777-8888, sementara di database tersimpan 081277778888
    const req = new Request("http://localhost/api/buyer/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: "+62 812-7777-8888" }),
    });
    const res = await buyerOrdersPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.orders.length).toBe(1);
    expect(data.orders[0].orderId).toBe(testPaidOrderId);
    expect(data.orders[0].productName).toBe("Template Notion Builder");
    expect(data.orders[0].downloadUrl).toContain(testPaidOrderId);
  });
});
