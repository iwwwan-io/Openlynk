import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSessionUser, canManagePage } from "@/lib/auth";
import { client } from "@/lib/db";
import { getDb } from "@/lib/store";
import { generateExpiringDownloadUrl } from "@/lib/storage";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "orderId wajib" }, { status: 400 });
  }

  const db = await getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  // 1. Validasi Status Pembayaran
  if (order.status !== "paid" && order.status !== "sent") {
    return NextResponse.json(
      { error: `Pesanan belum lunas (status: ${order.status}). Unduhan tidak diizinkan.` },
      { status: 403 }
    );
  }

  // 2. Verifikasi Hak Akses (Pemilik Halaman atau Pembeli)
  const user = await getSessionUser(req);
  const isOwnerOrAdmin = await canManagePage(order.pageId, user, req);

  const url = new URL(req.url);
  const contactQuery = (url.searchParams.get("contact") || url.searchParams.get("email") || "").trim().toLowerCase();
  const orderContact = order.buyerContact.trim().toLowerCase();

  const isVerifiedBuyer = Boolean(contactQuery && contactQuery === orderContact);

  if (!isOwnerOrAdmin && !isVerifiedBuyer) {
    return NextResponse.json(
      {
        error: "Akses ditolak. Sertakan email/kontak pembeli yang sesuai atau login sebagai pemilik halaman.",
      },
      { status: 403 }
    );
  }

  // 3. Validasi Produk Digital
  const product = db.products.find((p) => p.id === order.productId);
  if (!product || product.kind !== "digital" || !product.fileUrl) {
    return NextResponse.json(
      { error: "Produk ini tidak memiliki berkas digital yang dapat diunduh." },
      { status: 400 }
    );
  }

  // 3.5. Proteksi Batas Unduhan (Anti-Abuse)
  const currentDownloads = order.downloadCount ?? 0;
  if (!isOwnerOrAdmin && currentDownloads >= 25) {
    return NextResponse.json(
      {
        error: "Batas unduhan untuk pesanan ini telah tercapai (maksimal 25 kali). Hubungi kreator jika Anda membutuhkan akses ulang.",
      },
      { status: 403 }
    );
  }

  // Catat unduhan di SQLite
  if (!isOwnerOrAdmin) {
    await client.execute({
      sql: "UPDATE orders SET download_count = download_count + 1, last_downloaded_at = ? WHERE id = ?;",
      args: [new Date().toISOString(), order.id],
    });
  }

  // 4. Buat Expiring Signed URL
  const expiringUrl = generateExpiringDownloadUrl(product.fileUrl, 86400); // 24 jam

  // Jika format JSON diminta (misal via AJAX/Fetch API)
  if (url.searchParams.get("format") === "json") {
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      productName: product.name,
      downloadUrl: expiringUrl,
      expiresInSeconds: 86400,
    });
  }

  // 5. Jika URL eksternal / ImageKit Cloud -> redirect 307
  if (expiringUrl.startsWith("http://") || expiringUrl.startsWith("https://")) {
    return NextResponse.redirect(expiringUrl, { status: 307 });
  }

  // 6. Fallback Berkas Lokal -> Stream langsung sebagai unduhan file
  try {
    let localFilePath = "";
    if (expiringUrl.startsWith("/api/downloads/local/")) {
      const fileName = expiringUrl.replace("/api/downloads/local/", "");
      localFilePath = path.join(process.cwd(), "data", "uploads", "private", fileName);
    } else if (expiringUrl.startsWith("/uploads/")) {
      const fileName = expiringUrl.replace("/uploads/", "");
      localFilePath = path.join(process.cwd(), "public", "uploads", fileName);
    } else {
      localFilePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), expiringUrl);
    }

    const fileBuffer = await fs.readFile(/*turbopackIgnore: true*/ localFilePath);
    const fileName = path.basename(localFilePath);
    const ext = path.extname(fileName).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    if (ext === ".zip") contentType = "application/zip";
    if (ext === ".epub") contentType = "application/epub+zip";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    // Jika berkas fisik lokal tidak ditemukan
    return NextResponse.json(
      { error: "Berkas digital tidak ditemukan di penyimpanan server." },
      { status: 404 }
    );
  }
}
