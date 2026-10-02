import { NextResponse } from "next/server";
import { isAdmin, getSessionUser, canManagePage } from "@/lib/auth";
import { client } from "@/lib/db";
import { createSnapToken } from "@/lib/midtrans";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import {
  getDb,
  validateAndApplyCoupon,
  incrementCouponUses,
  createOrderDirect,
  markOrderCancelledOrExpired,
} from "@/lib/store";
import { uid } from "@/lib/types";
import { fee } from "@/lib/validate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId") ?? "";
  const user = await getSessionUser(req);

  if (pageId) {
    const allowed = await canManagePage(pageId, user, req);
    if (!allowed) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    if (!isAdmin(req) && (!user || user.role !== "admin")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const db = await getDb();
  const orders = db.orders
    .filter((o) => !pageId || o.pageId === pageId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100);
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  if (!rateLimit(`order:${clientKey(req)}`, 20)) {
    return NextResponse.json({ error: "terlalu banyak, coba lagi" }, { status: 429 });
  }
  const body = (await req.json()) as {
    productId?: string;
    pageId?: string;
    bentoId?: string;
    isDonation?: boolean;
    amount?: number;
    message?: string;
    buyerName?: string;
    buyerContact?: string;
    qty?: number;
    couponCode?: string;
  };

  // Alur 1: Donasi / Sawer / Traktir Kopi
  if (body.isDonation || body.productId === "sawer" || (!body.productId && body.amount)) {
    const pageId = body.pageId;
    if (!pageId) return NextResponse.json({ error: "pageId wajib" }, { status: 400 });
    const db = await getDb();
    const page = db.pages.find((p) => p.id === pageId);
    if (!page) return NextResponse.json({ error: "halaman tidak ditemukan" }, { status: 404 });

    const amount = Math.max(Math.floor(body.amount ?? 15000), 1000);
    const donorName = (body.buyerName?.trim() || "Kawan Baik").slice(0, 80);
    const donorContact = (body.buyerContact?.trim() || "donatur@openlynk.id").slice(0, 80);
    const message = (body.message?.trim() || "Semangat terus berkarya! ☕").slice(0, 200);

    const orderId = uid("sawer");
    const snap = await createSnapToken({
      orderId,
      grossAmount: amount + fee(amount),
      customerName: donorName,
      customerContact: donorContact,
    });

    // Format productId dengan encode bentoId agar webhook/simulasi tahu bento mana yang ditambah
    const productId = body.bentoId ? `sawer:${body.bentoId}:${message}` : `sawer::${message}`;

    const order = {
      id: orderId,
      productId,
      pageId: page.id,
      buyerName: donorName,
      buyerContact: donorContact,
      qty: Math.max(Math.floor(body.qty ?? 1), 1),
      totalIdr: amount,
      feeIdr: fee(amount),
      status: "pending" as const,
      snapToken: snap.token,
      createdAt: new Date().toISOString(),
    };

    // NOTE: currentAmount di Bento TIDAK ditambah sekarang.
    // currentAmount hanya bertambah saat pembayaran terkonfirmasi (paid).
    await createOrderDirect(order);
    return NextResponse.json(
      { order, snapToken: snap.token, redirectUrl: snap.redirectUrl, sandbox: snap.sandbox },
      { status: 201 }
    );
  }

  // Alur 2: Pembelian Produk Reguler
  const qty = Math.min(Math.max(Math.floor(body.qty ?? 1), 1), 10);
  if (!body.productId || !body.buyerName || !body.buyerContact) {
    return NextResponse.json({ error: "product, nama, kontak wajib" }, { status: 400 });
  }
  const db = await getDb();
  const product = db.products.find((p) => p.id === body.productId && p.isActive);
  if (!product) return NextResponse.json({ error: "produk tidak aktif" }, { status: 404 });
  if (product.stock !== null && product.stock < qty) {
    return NextResponse.json({ error: "stok kurang" }, { status: 400 });
  }

  const rawSubtotal = product.priceIdr * qty;
  let discountIdr = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (body.couponCode?.trim()) {
    const check = await validateAndApplyCoupon(product.pageId, body.couponCode, rawSubtotal);
    if (check.valid && check.coupon) {
      discountIdr = check.discountIdr;
      appliedCouponCode = check.coupon.code;
      await incrementCouponUses(check.coupon.id);
    }
  }

  const total = Math.max(rawSubtotal - discountIdr, 0);
  const orderId = uid("order");
  const snap = await createSnapToken({
    orderId,
    grossAmount: total + fee(total),
    customerName: body.buyerName,
    customerContact: body.buyerContact,
  });
  const order = {
    id: orderId,
    productId: product.id,
    pageId: product.pageId,
    buyerName: body.buyerName.slice(0, 80),
    buyerContact: body.buyerContact.slice(0, 80),
    qty,
    totalIdr: total,
    feeIdr: fee(total),
    status: "pending" as const,
    couponCode: appliedCouponCode,
    discountIdr,
    snapToken: snap.token,
    createdAt: new Date().toISOString(),
  };

  // Kurangi stok produk secara atomic
  if (product.stock !== null) {
    await client.execute({
      sql: "UPDATE products SET stock = stock - ? WHERE id = ? AND stock IS NOT NULL;",
      args: [qty, product.id],
    });
  }

  await createOrderDirect(order);
  return NextResponse.json(
    { order, snapToken: snap.token, redirectUrl: snap.redirectUrl, sandbox: snap.sandbox },
    { status: 201 }
  );
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { orderId?: string; status?: "sent" | "cancelled" };
  if (!body.orderId) return NextResponse.json({ error: "orderId wajib" }, { status: 400 });

  const db = await getDb();
  const existingOrder = db.orders.find((o) => o.id === body.orderId);
  if (!existingOrder) return NextResponse.json({ error: "order tidak ada" }, { status: 404 });

  const user = await getSessionUser(req);
  const allowed = await canManagePage(existingOrder.pageId, user, req);
  if (!allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (body.status === "cancelled") {
    const res = await markOrderCancelledOrExpired(body.orderId, "cancelled");
    if (!res.order) return NextResponse.json({ error: "order tidak ada" }, { status: 404 });
    if (!res.newlyReverted && res.order.status !== "cancelled") {
      return NextResponse.json({ error: "hanya order pending yang bisa dibatalkan" }, { status: 400 });
    }
    return NextResponse.json(res.order);
  }

  if (body.status === "sent") {
    if (existingOrder.status !== "paid") {
      return NextResponse.json({ error: "hanya order paid yang bisa ditandai sent" }, { status: 400 });
    }
    await client.execute({
      sql: "UPDATE orders SET status = 'sent' WHERE id = ?;",
      args: [body.orderId],
    });
    existingOrder.status = "sent";
    return NextResponse.json(existingOrder);
  }

  return NextResponse.json({ error: "transisi tidak valid" }, { status: 400 });
}

