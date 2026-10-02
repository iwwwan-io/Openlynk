import { client, ensureDbInitialized } from "./db";
import {
  type Order,
  type Page,
  type Product,
  type OrderStatus,
  type Coupon,
  type BentoItem,
  parseSawerProductId,
} from "./types";
import type { ThemeName } from "./themes";
import type { View, Click, Subscriber } from "./db/seed-data";

export type { View, Click, Subscriber };

export type Db = {
  pages: Page[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  views: View[];
  clicks: Click[];
  subscribers: Subscriber[];
};

export async function getDb(): Promise<Db> {
  await ensureDbInitialized();

  const [pagesRows, productsRows, ordersRows, couponsRows, viewsRows, clicksRows, subsRows] =
    await Promise.all([
      client.execute("SELECT * FROM pages ORDER BY created_at ASC;"),
      client.execute("SELECT * FROM products ORDER BY created_at ASC;"),
      client.execute("SELECT * FROM orders ORDER BY created_at DESC;"),
      client.execute("SELECT * FROM coupons ORDER BY created_at DESC;"),
      client.execute("SELECT * FROM views;"),
      client.execute("SELECT * FROM clicks;"),
      client.execute("SELECT * FROM subscribers;"),
    ]);

  const pages: Page[] = pagesRows.rows.map((r: any) => ({
    id: String(r.id),
    userId: r.user_id ? String(r.user_id) : undefined,
    slug: String(r.slug),
    name: String(r.name),
    bio: String(r.bio ?? ""),
    image: r.image ? String(r.image) : undefined,
    bannerImage: r.banner_image ? String(r.banner_image) : undefined,
    socials: r.socials
      ? typeof r.socials === "string"
        ? JSON.parse(r.socials)
        : r.socials
      : undefined,
    customDomain: r.custom_domain ? String(r.custom_domain) : undefined,
    theme: (r.theme ?? "default") as any,
    accentColor: String(r.accent_color ?? "#18181b"),
    darkMode: Boolean(r.dark_mode),
    isPublic: Boolean(r.is_public),
    bento: typeof r.bento === "string" ? JSON.parse(r.bento) : (r.bento ?? []),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));

  const products: Product[] = productsRows.rows.map((r: any) => ({
    id: String(r.id),
    pageId: String(r.page_id),
    name: String(r.name),
    description: String(r.description ?? ""),
    priceIdr: Number(r.price_idr),
    stock: r.stock !== null && r.stock !== undefined ? Number(r.stock) : null,
    kind: r.kind as "digital" | "fisik",
    imageUrl: r.image_url ? String(r.image_url) : undefined,
    fileUrl: r.file_url ? String(r.file_url) : undefined,
    isActive: Boolean(r.is_active),
    createdAt: String(r.created_at),
  }));

  const orders: Order[] = ordersRows.rows.map((r: any) => ({
    id: String(r.id),
    productId: String(r.product_id),
    pageId: String(r.page_id),
    buyerName: String(r.buyer_name),
    buyerContact: String(r.buyer_contact),
    qty: Number(r.qty),
    totalIdr: Number(r.total_idr),
    feeIdr: Number(r.fee_idr),
    status: r.status as OrderStatus,
    couponCode: r.coupon_code ? String(r.coupon_code) : undefined,
    discountIdr: r.discount_idr !== null && r.discount_idr !== undefined ? Number(r.discount_idr) : 0,
    snapToken: r.snap_token ? String(r.snap_token) : undefined,
    createdAt: String(r.created_at),
    paidAt: r.paid_at ? String(r.paid_at) : undefined,
    downloadCount: Number(r.download_count ?? 0),
    lastDownloadedAt: r.last_downloaded_at ? String(r.last_downloaded_at) : undefined,
  }));

  const coupons: Coupon[] = couponsRows.rows.map((r: any) => ({
    id: String(r.id),
    pageId: String(r.page_id),
    code: String(r.code),
    discountType: r.discount_type as "percent" | "fixed",
    discountValue: Number(r.discount_value),
    minOrderIdr: r.min_order_idr !== null && r.min_order_idr !== undefined ? Number(r.min_order_idr) : 0,
    maxUses: r.max_uses !== null && r.max_uses !== undefined ? Number(r.max_uses) : null,
    usedCount: Number(r.used_count ?? 0),
    isActive: Boolean(r.is_active),
    expiresAt: r.expires_at ? String(r.expires_at) : null,
    createdAt: String(r.created_at),
  }));

  const views: View[] = viewsRows.rows.map((r: any) => ({
    pageId: String(r.page_id),
    at: String(r.at),
  }));

  const clicks: Click[] = clicksRows.rows.map((r: any) => ({
    pageId: String(r.page_id),
    href: String(r.href),
    at: String(r.at),
  }));

  const subscribers: Subscriber[] = subsRows.rows.map((r: any) => ({
    pageId: String(r.page_id),
    email: String(r.email),
    at: String(r.at),
  }));

  return {
    pages,
    products,
    orders,
    coupons,
    views,
    clicks,
    subscribers,
  };
}

export async function saveDb(nextDb: Db): Promise<void> {
  await ensureDbInitialized();

  // 1. Sync Pages: Upsert semua page & hapus page yang di-delete
  const currentPagesRes = await client.execute("SELECT id FROM pages;");
  const currentIds = new Set(currentPagesRes.rows.map((r) => String(r.id)));
  const nextIds = new Set(nextDb.pages.map((p) => p.id));

  for (const id of currentIds) {
    if (!nextIds.has(id)) {
      await client.execute({ sql: "DELETE FROM pages WHERE id = ?;", args: [id] });
    }
  }

  for (const p of nextDb.pages) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO pages (id, user_id, slug, custom_domain, name, bio, image, banner_image, socials, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        p.id,
        p.userId ?? null,
        p.slug,
        p.customDomain ?? null,
        p.name,
        p.bio ?? "",
        p.image ?? null,
        p.bannerImage ?? null,
        p.socials ? JSON.stringify(p.socials) : null,
        p.theme ?? "default",
        p.accentColor ?? "#18181b",
        p.darkMode ? 1 : 0,
        p.isPublic ? 1 : 0,
        JSON.stringify(p.bento ?? []),
        p.createdAt,
        p.updatedAt,
      ],
    });
  }

  // 2. Sync Products: Upsert & hapus yang di-delete
  const currentProdsRes = await client.execute("SELECT id FROM products;");
  const currentProdIds = new Set(currentProdsRes.rows.map((r) => String(r.id)));
  const nextProdIds = new Set(nextDb.products.map((pr) => pr.id));

  for (const id of currentProdIds) {
    if (!nextProdIds.has(id)) {
      await client.execute({ sql: "DELETE FROM products WHERE id = ?;", args: [id] });
    }
  }

  for (const pr of nextDb.products) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO products (id, page_id, name, description, price_idr, stock, kind, image_url, file_url, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        pr.id,
        pr.pageId,
        pr.name,
        pr.description ?? "",
        pr.priceIdr,
        pr.stock !== null && pr.stock !== undefined ? pr.stock : null,
        pr.kind,
        pr.imageUrl ?? null,
        pr.fileUrl ?? null,
        pr.isActive ? 1 : 0,
        pr.createdAt,
      ],
    });
  }

  // 3. Sync Coupons: Upsert & hapus yang di-delete
  if (nextDb.coupons) {
    const currentCouponsRes = await client.execute("SELECT id FROM coupons;");
    const currentCouponIds = new Set(currentCouponsRes.rows.map((r) => String(r.id)));
    const nextCouponIds = new Set(nextDb.coupons.map((c) => c.id));

    for (const id of currentCouponIds) {
      if (!nextCouponIds.has(id)) {
        await client.execute({ sql: "DELETE FROM coupons WHERE id = ?;", args: [id] });
      }
    }

    for (const c of nextDb.coupons) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO coupons (id, page_id, code, discount_type, discount_value, min_order_idr, max_uses, used_count, is_active, expires_at, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          c.id,
          c.pageId,
          c.code.toUpperCase().trim(),
          c.discountType,
          c.discountValue,
          c.minOrderIdr ?? 0,
          c.maxUses !== null && c.maxUses !== undefined ? c.maxUses : null,
          c.usedCount ?? 0,
          c.isActive ? 1 : 0,
          c.expiresAt ?? null,
          c.createdAt,
        ],
      });
    }
  }

  // 4. Sync Orders: Upsert
  for (const o of nextDb.orders) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, coupon_code, discount_idr, snap_token, created_at, paid_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        o.id,
        o.productId,
        o.pageId,
        o.buyerName,
        o.buyerContact,
        o.qty,
        o.totalIdr,
        o.feeIdr,
        o.status,
        o.couponCode ?? null,
        o.discountIdr ?? 0,
        o.snapToken ?? null,
        o.createdAt,
        o.paidAt ?? null,
      ],
    });
  }

  // 5. Analytics & Subscribers
  const currentViewCount = Number((await client.execute("SELECT COUNT(*) as c FROM views;")).rows[0]?.c ?? 0);
  if (nextDb.views.length > currentViewCount) {
    const newViews = nextDb.views.slice(currentViewCount);
    for (const v of newViews) {
      await client.execute({
        sql: "INSERT INTO views (page_id, at) VALUES (?, ?);",
        args: [v.pageId, v.at],
      });
    }
  }

  const currentClickCount = Number((await client.execute("SELECT COUNT(*) as c FROM clicks;")).rows[0]?.c ?? 0);
  if (nextDb.clicks.length > currentClickCount) {
    const newClicks = nextDb.clicks.slice(currentClickCount);
    for (const c of newClicks) {
      await client.execute({
        sql: "INSERT INTO clicks (page_id, href, at) VALUES (?, ?, ?);",
        args: [c.pageId, c.href, c.at],
      });
    }
  }

  const currentSubCount = Number((await client.execute("SELECT COUNT(*) as c FROM subscribers;")).rows[0]?.c ?? 0);
  if (nextDb.subscribers.length > currentSubCount) {
    const newSubs = nextDb.subscribers.slice(currentSubCount);
    for (const s of newSubs) {
      const at = (s as any).at || (s as any).createdAt || new Date().toISOString();
      await client.execute({
        sql: "INSERT INTO subscribers (page_id, email, at) VALUES (?, ?, ?);",
        args: [s.pageId, s.email, at],
      });
    }
  }
}

// Atomic helpers untuk performa tinggi & zero-locking overhead
export async function recordView(pageId: string, at = new Date().toISOString()): Promise<void> {
  await ensureDbInitialized();
  await client.execute({
    sql: "INSERT INTO views (page_id, at) VALUES (?, ?);",
    args: [pageId, at],
  });
}

export async function recordClick(pageId: string, href: string, at = new Date().toISOString()): Promise<void> {
  await ensureDbInitialized();
  await client.execute({
    sql: "INSERT INTO clicks (page_id, href, at) VALUES (?, ?, ?);",
    args: [pageId, href.slice(0, 500), at],
  });
}

export async function addSubscriber(pageId: string, email: string, at = new Date().toISOString()): Promise<void> {
  await ensureDbInitialized();
  await client.execute({
    sql: "INSERT INTO subscribers (page_id, email, at) VALUES (?, ?, ?);",
    args: [pageId, email.slice(0, 200), at],
  });
}

// Validasi Kupon Diskon
export type CouponValidationResult = {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discountIdr: number;
  finalSubtotal: number;
};

export async function validateAndApplyCoupon(
  pageId: string,
  rawCode: string,
  subtotalIdr: number
): Promise<CouponValidationResult> {
  await ensureDbInitialized();
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, message: "Kode kupon wajib diisi", discountIdr: 0, finalSubtotal: subtotalIdr };
  }

  const res = await client.execute({
    sql: "SELECT * FROM coupons WHERE page_id = ? AND code = ? LIMIT 1;",
    args: [pageId, code],
  });

  if (res.rows.length === 0) {
    return { valid: false, message: `Kupon "${code}" tidak ditemukan`, discountIdr: 0, finalSubtotal: subtotalIdr };
  }

  const row: any = res.rows[0];
  const coupon: Coupon = {
    id: String(row.id),
    pageId: String(row.page_id),
    code: String(row.code),
    discountType: row.discount_type as "percent" | "fixed",
    discountValue: Number(row.discount_value),
    minOrderIdr: Number(row.min_order_idr ?? 0),
    maxUses: row.max_uses !== null && row.max_uses !== undefined ? Number(row.max_uses) : null,
    usedCount: Number(row.used_count ?? 0),
    isActive: Boolean(row.is_active),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    createdAt: String(row.created_at),
  };

  if (!coupon.isActive) {
    return { valid: false, message: "Kupon ini sedang tidak aktif", discountIdr: 0, finalSubtotal: subtotalIdr };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "Masa berlaku kupon telah berakhir", discountIdr: 0, finalSubtotal: subtotalIdr };
  }

  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: "Kuota pemakaian kupon telah habis", discountIdr: 0, finalSubtotal: subtotalIdr };
  }

  if (coupon.minOrderIdr && subtotalIdr < coupon.minOrderIdr) {
    return {
      valid: false,
      message: `Minimal belanja untuk kupon ini adalah Rp ${coupon.minOrderIdr.toLocaleString("id-ID")}`,
      discountIdr: 0,
      finalSubtotal: subtotalIdr,
    };
  }

  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = Math.round((subtotalIdr * coupon.discountValue) / 100);
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(Math.max(discount, 0), subtotalIdr);
  const finalSubtotal = Math.max(subtotalIdr - discount, 0);

  return {
    valid: true,
    coupon,
    discountIdr: discount,
    finalSubtotal,
  };
}

export async function incrementCouponUses(couponId: string): Promise<void> {
  await ensureDbInitialized();
  await client.execute({
    sql: "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?;",
    args: [couponId],
  });
}

export async function decrementCouponUses(
  couponCodeOrId: string,
  pageId?: string
): Promise<void> {
  await ensureDbInitialized();
  if (pageId) {
    await client.execute({
      sql: "UPDATE coupons SET used_count = MAX(0, used_count - 1) WHERE page_id = ? AND code = ?;",
      args: [pageId, couponCodeOrId.toUpperCase().trim()],
    });
  } else {
    await client.execute({
      sql: "UPDATE coupons SET used_count = MAX(0, used_count - 1) WHERE id = ? OR code = ?;",
      args: [couponCodeOrId, couponCodeOrId.toUpperCase().trim()],
    });
  }
}

export async function incrementSawerAmount(
  pageId: string,
  bentoId: string | undefined,
  amount: number
): Promise<void> {
  if (amount <= 0) return;
  await ensureDbInitialized();
  const res = await client.execute({
    sql: "SELECT id, bento FROM pages WHERE id = ? LIMIT 1;",
    args: [pageId],
  });
  if (res.rows.length === 0) return;

  const rawBento = res.rows[0].bento;
  const bento: BentoItem[] =
    typeof rawBento === "string" ? JSON.parse(rawBento) : (rawBento ?? []);

  let targetCard = bentoId ? bento.find((b) => b.id === bentoId) : undefined;
  if (!targetCard) {
    targetCard = bento.find((b) => b.type === "sawer");
  }

  if (targetCard && targetCard.type === "sawer") {
    targetCard.currentAmount = (targetCard.currentAmount ?? 0) + amount;
    const now = new Date().toISOString();
    await client.execute({
      sql: "UPDATE pages SET bento = ?, updated_at = ? WHERE id = ?;",
      args: [JSON.stringify(bento), now, pageId],
    });
  }
}

export async function restoreStock(productId: string, qty: number): Promise<void> {
  if (qty <= 0) return;
  await ensureDbInitialized();
  await client.execute({
    sql: "UPDATE products SET stock = stock + ? WHERE id = ? AND stock IS NOT NULL;",
    args: [qty, productId],
  });
}

export async function createOrderDirect(order: Order): Promise<void> {
  await ensureDbInitialized();
  await client.execute({
    sql: `INSERT INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, coupon_code, discount_idr, snap_token, created_at, paid_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    args: [
      order.id,
      order.productId,
      order.pageId,
      order.buyerName,
      order.buyerContact,
      order.qty,
      order.totalIdr,
      order.feeIdr,
      order.status,
      order.couponCode ?? null,
      order.discountIdr ?? 0,
      order.snapToken ?? null,
      order.createdAt,
      order.paidAt ?? null,
    ],
  });
}

export async function markOrderPaid(orderId: string): Promise<{
  order: Order | null;
  newlyPaid: boolean;
  product?: Product;
  page?: Page;
}> {
  await ensureDbInitialized();

  const orderRes = await client.execute({
    sql: "SELECT * FROM orders WHERE id = ? LIMIT 1;",
    args: [orderId],
  });
  if (orderRes.rows.length === 0) {
    return { order: null, newlyPaid: false };
  }

  const r = orderRes.rows[0] as Record<string, unknown>;
  const order: Order = {
    id: String(r.id),
    productId: String(r.product_id),
    pageId: String(r.page_id),
    buyerName: String(r.buyer_name),
    buyerContact: String(r.buyer_contact),
    qty: Number(r.qty),
    totalIdr: Number(r.total_idr),
    feeIdr: Number(r.fee_idr),
    status: r.status as OrderStatus,
    couponCode: r.coupon_code ? String(r.coupon_code) : undefined,
    discountIdr: r.discount_idr !== null && r.discount_idr !== undefined ? Number(r.discount_idr) : 0,
    snapToken: r.snap_token ? String(r.snap_token) : undefined,
    createdAt: String(r.created_at),
    paidAt: r.paid_at ? String(r.paid_at) : undefined,
    downloadCount: Number(r.download_count ?? 0),
    lastDownloadedAt: r.last_downloaded_at ? String(r.last_downloaded_at) : undefined,
  };

  // Idempotency: Jika sudah paid atau sent, tidak proses ulang
  if (order.status === "paid" || order.status === "sent") {
    return { order, newlyPaid: false };
  }

  const paidAt = new Date().toISOString();
  await client.execute({
    sql: "UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?;",
    args: [paidAt, orderId],
  });
  order.status = "paid";
  order.paidAt = paidAt;

  // Jika donasi sawer, baru tambahkan akumulasi ke bento di sini
  const sawer = parseSawerProductId(order.productId);
  if (sawer.isSawer) {
    await incrementSawerAmount(order.pageId, sawer.bentoId, order.totalIdr);
  }

  // Ambil detail produk jika ada
  let product: Product | undefined;
  if (!sawer.isSawer) {
    const prodRes = await client.execute({
      sql: "SELECT * FROM products WHERE id = ? LIMIT 1;",
      args: [order.productId],
    });
    if (prodRes.rows.length > 0) {
      const pr = prodRes.rows[0] as Record<string, unknown>;
      product = {
        id: String(pr.id),
        pageId: String(pr.page_id),
        name: String(pr.name),
        description: String(pr.description ?? ""),
        priceIdr: Number(pr.price_idr),
        stock: pr.stock !== null && pr.stock !== undefined ? Number(pr.stock) : null,
        kind: pr.kind as "digital" | "fisik",
        imageUrl: pr.image_url ? String(pr.image_url) : undefined,
        fileUrl: pr.file_url ? String(pr.file_url) : undefined,
        isActive: Boolean(pr.is_active),
        createdAt: String(pr.created_at),
      };
    }
  }

  // Ambil detail page jika ada
  let page: Page | undefined;
  if (order.pageId) {
    const pageRes = await client.execute({
      sql: "SELECT * FROM pages WHERE id = ? LIMIT 1;",
      args: [order.pageId],
    });
    if (pageRes.rows.length > 0) {
      const p = pageRes.rows[0] as Record<string, unknown>;
      page = {
        id: String(p.id),
        userId: p.user_id ? String(p.user_id) : undefined,
        slug: String(p.slug),
        name: String(p.name),
        bio: String(p.bio ?? ""),
        image: p.image ? String(p.image) : undefined,
        bannerImage: p.banner_image ? String(p.banner_image) : undefined,
        socials: p.socials ? JSON.parse(String(p.socials)) : undefined,
        theme: (p.theme ? String(p.theme) : "default") as ThemeName,
        accentColor: String(p.accent_color ?? "#10b981"),
        darkMode: Boolean(p.dark_mode),
        isPublic: Boolean(p.is_public),
        bento: p.bento ? JSON.parse(String(p.bento)) : [],
        customDomain: p.custom_domain ? String(p.custom_domain) : undefined,
        createdAt: String(p.created_at),
        updatedAt: String(p.updated_at),
      };
    }
  }

  return { order, newlyPaid: true, product, page };
}

export async function markOrderCancelledOrExpired(
  orderId: string,
  newStatus: "expired" | "cancelled"
): Promise<{ order: Order | null; newlyReverted: boolean }> {
  await ensureDbInitialized();

  const orderRes = await client.execute({
    sql: "SELECT * FROM orders WHERE id = ? LIMIT 1;",
    args: [orderId],
  });
  if (orderRes.rows.length === 0) {
    return { order: null, newlyReverted: false };
  }

  const r = orderRes.rows[0] as Record<string, unknown>;
  const order: Order = {
    id: String(r.id),
    productId: String(r.product_id),
    pageId: String(r.page_id),
    buyerName: String(r.buyer_name),
    buyerContact: String(r.buyer_contact),
    qty: Number(r.qty),
    totalIdr: Number(r.total_idr),
    feeIdr: Number(r.fee_idr),
    status: r.status as OrderStatus,
    couponCode: r.coupon_code ? String(r.coupon_code) : undefined,
    discountIdr: r.discount_idr !== null && r.discount_idr !== undefined ? Number(r.discount_idr) : 0,
    snapToken: r.snap_token ? String(r.snap_token) : undefined,
    createdAt: String(r.created_at),
    paidAt: r.paid_at ? String(r.paid_at) : undefined,
    downloadCount: Number(r.download_count ?? 0),
    lastDownloadedAt: r.last_downloaded_at ? String(r.last_downloaded_at) : undefined,
  };

  // Hanya order pending yang dapat di-cancel atau di-expire dengan revert stok & kupon
  if (order.status !== "pending") {
    return { order, newlyReverted: false };
  }

  await client.execute({
    sql: "UPDATE orders SET status = ? WHERE id = ?;",
    args: [newStatus, orderId],
  });
  order.status = newStatus;

  // Revert stok jika produk reguler
  if (!order.productId.startsWith("sawer:")) {
    await restoreStock(order.productId, order.qty);
  }

  // Revert kupon jika terpakai
  if (order.couponCode) {
    await decrementCouponUses(order.couponCode, order.pageId);
  }

  return { order, newlyReverted: true };
}

