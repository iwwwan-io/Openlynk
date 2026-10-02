import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { promises as fs } from "node:fs";
import path from "node:path";
import { client, ensureDbInitialized } from "@/lib/db";
import {
  isImageKitConfigured,
  getImageKit,
  uploadFile,
  generateExpiringDownloadUrl,
} from "@/lib/storage";
import { createSession } from "@/lib/auth";
import { uid } from "@/lib/types";

beforeAll(async () => {
  await ensureDbInitialized();
});

describe("Storage Provider & Local Fallback", () => {
  test("beroperasi dalam mode fallback lokal saat env ImageKit tidak disetel", async () => {
    const originalPub = process.env.IMAGEKIT_PUBLIC_KEY;
    const originalPriv = process.env.IMAGEKIT_PRIVATE_KEY;
    const originalUrl = process.env.IMAGEKIT_URL_ENDPOINT;

    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;

    expect(isImageKitConfigured()).toBe(false);
    expect(getImageKit()).toBeNull();

    // 1. Upload file publik
    const publicContent = Buffer.from("public image content test");
    const publicResult = await uploadFile({
      buffer: publicContent,
      fileName: "test-banner.png",
      mimeType: "image/png",
      isPrivate: false,
    });

    expect(publicResult.provider).toBe("local");
    expect(publicResult.isPrivate).toBe(false);
    expect(publicResult.url).toStartWith("/uploads/");
    const localPublicPath = path.join(process.cwd(), "public", "uploads", publicResult.fileId);
    expect(await fs.readFile(localPublicPath, "utf-8")).toBe("public image content test");

    // 2. Upload file privat digital
    const privateContent = Buffer.from("%PDF-1.4 test digital ebook content");
    const privateResult = await uploadFile({
      buffer: privateContent,
      fileName: "ebook-panduan.pdf",
      mimeType: "application/pdf",
      isPrivate: true,
    });

    expect(privateResult.provider).toBe("local");
    expect(privateResult.isPrivate).toBe(true);
    expect(privateResult.url).toStartWith("/api/downloads/local/");
    const localPrivatePath = path.join(
      process.cwd(),
      "data",
      "uploads",
      "private",
      privateResult.fileId
    );
    expect(await fs.readFile(localPrivatePath, "utf-8")).toBe(
      "%PDF-1.4 test digital ebook content"
    );

    // Bersihkan file uji coba lokal
    await fs.unlink(localPublicPath).catch(() => {});
    await fs.unlink(localPrivatePath).catch(() => {});

    // Kembalikan env jika ada
    if (originalPub) process.env.IMAGEKIT_PUBLIC_KEY = originalPub;
    if (originalPriv) process.env.IMAGEKIT_PRIVATE_KEY = originalPriv;
    if (originalUrl) process.env.IMAGEKIT_URL_ENDPOINT = originalUrl;
  });

  test("menghasilkan Expiring Signed URL saat ImageKit dikonfigurasi", () => {
    process.env.IMAGEKIT_PUBLIC_KEY = "test_public_key";
    process.env.IMAGEKIT_PRIVATE_KEY = "test_private_key";
    process.env.IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/openlynk_test";

    expect(isImageKitConfigured()).toBe(true);

    // 1. Path relatif
    const signedFromPath = generateExpiringDownloadUrl("/openlynk/digital/ebook.pdf", 3600);
    expect(signedFromPath).toStartWith("https://ik.imagekit.io/openlynk_test/openlynk/digital/ebook.pdf");
    expect(signedFromPath).toContain("ik-t=");
    expect(signedFromPath).toContain("ik-s=");

    // 2. Full ImageKit URL
    const fullUrl = "https://ik.imagekit.io/openlynk_test/openlynk/digital/template.zip";
    const signedFromUrl = generateExpiringDownloadUrl(fullUrl, 7200);
    expect(signedFromUrl).toStartWith(fullUrl);
    expect(signedFromUrl).toContain("ik-t=");
    expect(signedFromUrl).toContain("ik-s=");

    // Reset env
    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;
  });
});

describe("Uploads API Route & Multi-Tenant Authorization", () => {
  test("menolak unggahan tanpa sesi dan mengizinkan kreator login", async () => {
    const { POST: uploadsPost } = await import("@/app/api/uploads/route");

    // 1. Tanpa autentikasi -> ditolak 401
    const unauthForm = new FormData();
    unauthForm.append(
      "file",
      new Blob(["dummy image content"], { type: "image/png" }),
      "photo.png"
    );
    const unauthReq = new Request("http://localhost/api/uploads", {
      method: "POST",
      body: unauthForm,
    });
    const unauthRes = await uploadsPost(unauthReq);
    expect(unauthRes.status).toBe(401);

    // 2. Dengan user login
    const session = await createSession("usr_demo");
    const authForm = new FormData();
    authForm.append(
      "file",
      new Blob(["valid png bytes"], { type: "image/png" }),
      "avatar.png"
    );
    authForm.append("kind", "image");

    const authReq = new Request("http://localhost/api/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      body: authForm,
    });
    const authRes = await uploadsPost(authReq);
    expect(authRes.status).toBe(201);
    const data = await authRes.json();
    expect(data.url).toBeDefined();
    expect(data.provider).toBe("local");

    // 3. Menolak file berbahaya / tipe yang tidak diizinkan (.exe)
    const badForm = new FormData();
    badForm.append(
      "file",
      new Blob(["malicious bytes"], { type: "application/x-msdownload" }),
      "malware.exe"
    );
    const badReq = new Request("http://localhost/api/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
      body: badForm,
    });
    const badRes = await uploadsPost(badReq);
    expect(badRes.status).toBe(400);

    // Bersihkan file yang diunggah
    if (data.url.startsWith("/uploads/")) {
      const p = path.join(process.cwd(), "public", data.url);
      await fs.unlink(p).catch(() => {});
    }
  });
});

describe("Secure Digital Downloads Endpoint (/api/downloads/[orderId])", () => {
  const testOrderId = uid("ord_test_dl");
  const testPageId = uid("page_test_dl");
  const testProductId = uid("prod_test_dl");
  const buyerEmail = "pembeli_aman@gmail.com";
  let creatorToken = "";

  beforeAll(async () => {
    const now = new Date().toISOString();
    // Buat page
    await client.execute({
      sql: `INSERT INTO pages (id, user_id, slug, name, bio, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, 'usr_demo', 'page-download-test', 'Page DL', '', 'default', '#18181b', 0, 1, '[]', ?, ?);`,
      args: [testPageId, now, now],
    });

    // Buat produk digital lokal
    const localDigitalPath = path.join(process.cwd(), "data", "uploads", "private");
    await fs.mkdir(localDigitalPath, { recursive: true });
    await fs.writeFile(
      path.join(localDigitalPath, "test-course.pdf"),
      "%PDF-1.4 Materi Kursus Eksklusif OpenLynk"
    );

    await client.execute({
      sql: `INSERT INTO products (id, page_id, name, description, price_idr, kind, file_url, is_active, created_at)
            VALUES (?, ?, 'Ebook Masterclass', 'Panduan', 50000, 'digital', '/api/downloads/local/test-course.pdf', 1, ?);`,
      args: [testProductId, testPageId, now],
    });

    // Buat pesanan status pending
    await client.execute({
      sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, created_at)
            VALUES (?, ?, ?, 'Budi Pembeli', ?, 1, 50000, 2500, 'pending', ?);`,
      args: [testOrderId, testProductId, testPageId, buyerEmail, now],
    });

    const s = await createSession("usr_demo");
    creatorToken = s.token;
  });

  afterAll(async () => {
    await client.execute({ sql: "DELETE FROM orders WHERE id = ?;", args: [testOrderId] });
    await client.execute({ sql: "DELETE FROM products WHERE id = ?;", args: [testProductId] });
    await client.execute({ sql: "DELETE FROM pages WHERE id = ?;", args: [testPageId] });
    await fs.unlink(path.join(process.cwd(), "data", "uploads", "private", "test-course.pdf")).catch(() => {});
  });

  test("menolak unduhan jika pesanan belum lunas", async () => {
    const { GET: downloadGet } = await import("@/app/api/downloads/[orderId]/route");
    const req = new Request(
      `http://localhost/api/downloads/${testOrderId}?contact=${encodeURIComponent(buyerEmail)}`
    );
    const res = await downloadGet(req, { params: Promise.resolve({ orderId: testOrderId }) });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("belum lunas");
  });

  test("menolak pembeli lain yang kontaknya tidak sesuai saat order sudah paid", async () => {
    const { GET: downloadGet } = await import("@/app/api/downloads/[orderId]/route");

    // Ubah status order jadi paid
    await client.execute({
      sql: "UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?;",
      args: [new Date().toISOString(), testOrderId],
    });

    // Kontak pembeli salah
    const req = new Request(
      `http://localhost/api/downloads/${testOrderId}?contact=pembeli_palsu@gmail.com`
    );
    const res = await downloadGet(req, { params: Promise.resolve({ orderId: testOrderId }) });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Akses ditolak");
  });

  test("mengizinkan pembeli sah mengunduh berkas dengan verifikasi kontak", async () => {
    const { GET: downloadGet } = await import("@/app/api/downloads/[orderId]/route");

    // 1. Cek format JSON
    const jsonReq = new Request(
      `http://localhost/api/downloads/${testOrderId}?contact=${encodeURIComponent(buyerEmail)}&format=json`
    );
    const jsonRes = await downloadGet(jsonReq, {
      params: Promise.resolve({ orderId: testOrderId }),
    });
    expect(jsonRes.status).toBe(200);
    const jsonData = await jsonRes.json();
    expect(jsonData.ok).toBe(true);
    expect(jsonData.productName).toBe("Ebook Masterclass");
    expect(jsonData.downloadUrl).toBeDefined();

    // 2. Cek download file langsung (stream berkas)
    const streamReq = new Request(
      `http://localhost/api/downloads/${testOrderId}?contact=${encodeURIComponent(buyerEmail)}`
    );
    const streamRes = await downloadGet(streamReq, {
      params: Promise.resolve({ orderId: testOrderId }),
    });
    expect(streamRes.status).toBe(200);
    expect(streamRes.headers.get("content-type")).toBe("application/pdf");
    expect(streamRes.headers.get("content-disposition")).toContain("attachment; filename=");
    const text = await streamRes.text();
    expect(text).toContain("Materi Kursus Eksklusif OpenLynk");
  });

  test("mengizinkan pemilik halaman (kreator) mengunduh untuk preview berkas", async () => {
    const { GET: downloadGet } = await import("@/app/api/downloads/[orderId]/route");
    const req = new Request(`http://localhost/api/downloads/${testOrderId}`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const res = await downloadGet(req, { params: Promise.resolve({ orderId: testOrderId }) });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Materi Kursus Eksklusif OpenLynk");
  });
});
