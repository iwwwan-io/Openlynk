import { NextResponse } from "next/server";
import { getDb } from "@/lib/store";
import { formatIndonesianPhone } from "@/lib/whatsapp";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  // Rate limiting pencarian: maks 15 request per menit per client
  if (!rateLimit(`buyer_lookup:${clientKey(req)}`, 15)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan pencarian. Silakan tunggu 1 menit." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { contact?: string };
  const rawContact = (body.contact || "").trim();

  if (!rawContact || rawContact.length < 3) {
    return NextResponse.json(
      { error: "Silakan masukkan email atau nomor WhatsApp yang valid." },
      { status: 400 }
    );
  }

  const lowerEmail = rawContact.toLowerCase();
  const normalizedPhone = formatIndonesianPhone(rawContact);

  const db = await getDb();

  // Cari seluruh order yang lunas/terkirim yang cocok dengan kontak pembeli
  const matchedOrders = db.orders.filter((o) => {
    if (o.status !== "paid" && o.status !== "sent") return false;

    const orderContactLower = o.buyerContact.trim().toLowerCase();
    // 1. Cocok persis (email atau teks kontak)
    if (orderContactLower === lowerEmail) return true;

    // 2. Cocok format nomor telepon WhatsApp
    if (normalizedPhone) {
      const orderPhone = formatIndonesianPhone(o.buyerContact);
      if (orderPhone && orderPhone === normalizedPhone) return true;
    }

    return false;
  });

  // Urutkan dari yang paling baru
  matchedOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const items = matchedOrders.map((o) => {
    const product = db.products.find((p) => p.id === o.productId);
    const page = db.pages.find((p) => p.id === o.pageId);

    return {
      orderId: o.id,
      buyerName: o.buyerName,
      buyerContact: o.buyerContact,
      productName: product?.name || "Produk Digital",
      productDescription: product?.description || "",
      productImage: product?.imageUrl || null,
      hasFile: Boolean(product?.fileUrl),
      creatorName: page?.name || "Kreator OpenLynk",
      creatorSlug: page?.slug || "",
      totalIdr: o.totalIdr,
      paidAt: o.paidAt || o.createdAt,
      downloadCount: o.downloadCount ?? 0,
      downloadUrl: `/api/downloads/${o.id}?contact=${encodeURIComponent(o.buyerContact)}`,
    };
  });

  return NextResponse.json({ ok: true, orders: items, total: items.length });
}
