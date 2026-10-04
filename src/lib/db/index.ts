import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "node:path";
import { promises as fs } from "node:fs";
import * as schema from "./schema";
import type { DbSeed } from "./seed-data";
import { defaultSeed } from "./seed-data";

const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "data", "openlynk.db")}`;
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

async function resilientFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string | URL = typeof input === "string" || input instanceof URL ? input : "";
  let method = init?.method;
  let headers = init?.headers;
  let bodyData: BodyInit | null | undefined = init?.body;

  if (typeof input === "object" && "url" in input) {
    url = (input as Request).url;
    method = method || (input as Request).method;
    headers = headers || (input as Request).headers;
    if (!bodyData && (input as Request).body) {
      try {
        bodyData = await (input as Request).arrayBuffer();
      } catch {
        // Fallback
      }
    }
  }

  if (bodyData && typeof (bodyData as ReadableStream<Uint8Array>).getReader === "function") {
    try {
      const chunks: Uint8Array[] = [];
      const reader = (bodyData as ReadableStream<Uint8Array>).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        combined.set(c, offset);
        offset += c.length;
      }
      bodyData = combined;
    } catch {
      // Abaikan jika tidak bisa
    }
  }

  const maxRetries = 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, {
        ...init,
        method: method || "GET",
        headers,
        body: bodyData,
      });
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export const client = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
  fetch: resilientFetch,
});

export const db = drizzle(client, { schema });

let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      // Pastikan direktori data ada jika memakai file lokal
      if (dbUrl.startsWith("file:")) {
        const filePath = dbUrl.replace("file:", "");
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }

      // Aktifkan WAL mode dan Foreign Keys jika lokal SQLite
      if (dbUrl.startsWith("file:")) {
        await client.execute("PRAGMA journal_mode = WAL;").catch(() => {});
        await client.execute("PRAGMA foreign_keys = ON;").catch(() => {});
      }

      // Buat tabel jika belum ada
      await client.batch([
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          avatar TEXT,
          role TEXT NOT NULL DEFAULT 'creator',
          plan TEXT NOT NULL DEFAULT 'free',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS pages (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          slug TEXT NOT NULL UNIQUE,
          custom_domain TEXT UNIQUE,
          name TEXT NOT NULL,
          bio TEXT NOT NULL DEFAULT '',
          image TEXT,
          banner_image TEXT,
          socials TEXT,
          theme TEXT NOT NULL DEFAULT 'default',
          accent_color TEXT NOT NULL DEFAULT '#18181b',
          dark_mode INTEGER NOT NULL DEFAULT 0,
          is_public INTEGER NOT NULL DEFAULT 1,
          bento TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          price_idr INTEGER NOT NULL,
          stock INTEGER,
          kind TEXT NOT NULL,
          image_url TEXT,
          file_url TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
          buyer_name TEXT NOT NULL,
          buyer_contact TEXT NOT NULL,
          qty INTEGER NOT NULL DEFAULT 1,
          total_idr INTEGER NOT NULL,
          fee_idr INTEGER NOT NULL,
          status TEXT NOT NULL,
          coupon_code TEXT,
          discount_idr INTEGER NOT NULL DEFAULT 0,
          snap_token TEXT,
          created_at TEXT NOT NULL,
          paid_at TEXT,
          download_count INTEGER NOT NULL DEFAULT 0,
          last_downloaded_at TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS coupons (
          id TEXT PRIMARY KEY,
          page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
          code TEXT NOT NULL,
          discount_type TEXT NOT NULL,
          discount_value INTEGER NOT NULL,
          min_order_idr INTEGER DEFAULT 0,
          max_uses INTEGER,
          used_count INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          expires_at TEXT,
          created_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
          at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS clicks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
          href TEXT NOT NULL,
          at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS subscribers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS payout_accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          bank_name TEXT NOT NULL,
          account_number TEXT NOT NULL,
          account_holder TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS payout_requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount_idr INTEGER NOT NULL,
          bank_name TEXT NOT NULL,
          account_number TEXT NOT NULL,
          account_holder TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          admin_notes TEXT,
          proof_url TEXT,
          created_at TEXT NOT NULL,
          processed_at TEXT
        );`,
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
        `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`,
        `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);`,
        `CREATE INDEX IF NOT EXISTS idx_products_page_id ON products(page_id);`,
        `CREATE INDEX IF NOT EXISTS idx_orders_page_id ON orders(page_id);`,
        `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
        `CREATE INDEX IF NOT EXISTS idx_coupons_page_id ON coupons(page_id);`,
        `CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);`,
        `CREATE INDEX IF NOT EXISTS idx_views_page_id ON views(page_id);`,
        `CREATE INDEX IF NOT EXISTS idx_clicks_page_id ON clicks(page_id);`,
        `CREATE INDEX IF NOT EXISTS idx_subscribers_page_id ON subscribers(page_id);`,
        `CREATE INDEX IF NOT EXISTS idx_payout_accounts_user_id ON payout_accounts(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);`,
      ]);

      // Pastikan kolom baru di pages & orders ada bila database sudah dibuat sebelumnya
      await client.execute("ALTER TABLE pages ADD COLUMN user_id TEXT;").catch(() => {});
      await client.execute("CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);").catch(() => {});
      await client.execute("ALTER TABLE pages ADD COLUMN banner_image TEXT;").catch(() => {});
      await client.execute("ALTER TABLE pages ADD COLUMN socials TEXT;").catch(() => {});
      await client.execute("ALTER TABLE pages ADD COLUMN custom_domain TEXT;").catch(() => {});
      await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_custom_domain ON pages(custom_domain);").catch(() => {});
      await client.execute("ALTER TABLE orders ADD COLUMN coupon_code TEXT;").catch(() => {});
      await client.execute("ALTER TABLE orders ADD COLUMN discount_idr INTEGER DEFAULT 0;").catch(() => {});
      await client.execute("ALTER TABLE orders ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0;").catch(() => {});
      await client.execute("ALTER TABLE orders ADD COLUMN last_downloaded_at TEXT;").catch(() => {});
      await client.execute("ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';").catch(() => {});

      // Inisialisasi Demo User default (demo@openlynk.id / password123) jika belum ada
      const userCountRes = await client.execute("SELECT COUNT(*) as c FROM users;");
      const userCount = Number(userCountRes.rows[0]?.c ?? 0);
      if (userCount === 0) {
        // Pre-computed scrypt hash untuk 'password123'
        const defaultHash = "1e9bc464e9ff13a9af311b7b31a3e8ee:3e62c47e6cd079045ea60970f0653b3149bf6742195295034b9c328df6c3dc90477a51973557d2566eeef9a316d7fc794da8332e4d4d96c6146f2a6afd5815e8";
        const now = new Date().toISOString();
        await client.execute({
          sql: `INSERT OR IGNORE INTO users (id, email, password_hash, name, avatar, role, plan, created_at, updated_at)
                VALUES ('usr_demo', 'demo@openlynk.id', ?, 'Kreator Demo', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'creator', 'free', ?, ?);`,
          args: [defaultHash, now, now],
        });
      }

      // Cek apakah tabel pages kosong, jika ya: migrasikan dari db.json atau masukkan seed
      const countRes = await client.execute("SELECT COUNT(*) as c FROM pages;");
      const count = Number(countRes.rows[0]?.c ?? 0);

      if (count === 0) {
        await migrateFromDbJsonOrSeed();
      }

      // Selalu pastikan halaman tanpa pemilik terhubung ke usr_demo
      await client.execute("UPDATE pages SET user_id = 'usr_demo' WHERE user_id IS NULL;");

      // Cek jika kupon masih kosong, tambahkan demo kupon
      const couponCountRes = await client.execute("SELECT COUNT(*) as c FROM coupons;");
        const couponCount = Number(couponCountRes.rows[0]?.c ?? 0);
        if (couponCount === 0) {
          for (const c of defaultSeed.coupons) {
            await client.execute({
              sql: `INSERT OR REPLACE INTO coupons (id, page_id, code, discount_type, discount_value, min_order_idr, max_uses, used_count, is_active, expires_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                c.id,
                c.pageId,
                c.code.toUpperCase(),
                c.discountType,
                c.discountValue,
                c.minOrderIdr ?? 0,
                c.maxUses ?? null,
                c.usedCount ?? 0,
                c.isActive ? 1 : 0,
                c.expiresAt ?? null,
                c.createdAt,
              ],
            });
          }
        }
    })();
  }
  return initPromise;
}

async function migrateFromDbJsonOrSeed() {
  const jsonPath = path.join(process.cwd(), "data", "db.json");
  let dataToInsert: DbSeed = defaultSeed;

  try {
    const raw = await fs.readFile(jsonPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbSeed>;
    if (parsed.pages && parsed.pages.length > 0) {
      dataToInsert = {
        pages: parsed.pages.map((p) => ({
          ...p,
          theme: p.theme ?? "default",
          accentColor: p.accentColor ?? "#18181b",
          darkMode: p.darkMode ?? false,
          isPublic: p.isPublic ?? true,
          bio: p.bio ?? "",
          bento: p.bento ?? [],
        })),
        products: parsed.products ?? [],
        orders: parsed.orders ?? [],
        coupons: parsed.coupons ?? defaultSeed.coupons ?? [],
        views: parsed.views ?? [],
        clicks: parsed.clicks ?? [],
        subscribers: parsed.subscribers ?? [],
      };
    }
  } catch {
    // Tidak ada db.json, gunakan defaultSeed
  }

  const validPageIds = new Set(dataToInsert.pages.map((p) => p.id));
  dataToInsert.products = dataToInsert.products.filter((p) => validPageIds.has(p.pageId));
  dataToInsert.orders = dataToInsert.orders.filter((o) => validPageIds.has(o.pageId));
  dataToInsert.views = dataToInsert.views.filter((v) => validPageIds.has(v.pageId));
  dataToInsert.clicks = dataToInsert.clicks.filter((c) => validPageIds.has(c.pageId));
  dataToInsert.subscribers = dataToInsert.subscribers.filter((s) => validPageIds.has(s.pageId));

  // Insert Pages
  for (const p of dataToInsert.pages) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO pages (id, user_id, slug, name, bio, image, banner_image, socials, theme, accent_color, dark_mode, is_public, bento, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id,
        p.userId ?? "usr_demo",
        p.slug,
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

  // Insert Products
  for (const pr of dataToInsert.products) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO products (id, page_id, name, description, price_idr, stock, kind, image_url, file_url, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pr.id,
        pr.pageId,
        pr.name,
        pr.description ?? "",
        pr.priceIdr,
        pr.stock ?? null,
        pr.kind,
        pr.imageUrl ?? null,
        pr.fileUrl ?? null,
        pr.isActive ? 1 : 0,
        pr.createdAt,
      ],
    });
  }

  // Insert Orders
  for (const o of dataToInsert.orders) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO orders (id, product_id, page_id, buyer_name, buyer_contact, qty, total_idr, fee_idr, status, coupon_code, discount_idr, snap_token, created_at, paid_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  // Insert Coupons
  for (const c of dataToInsert.coupons || []) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO coupons (id, page_id, code, discount_type, discount_value, min_order_idr, max_uses, used_count, is_active, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        c.id,
        c.pageId,
        c.code.toUpperCase(),
        c.discountType,
        c.discountValue,
        c.minOrderIdr ?? 0,
        c.maxUses ?? null,
        c.usedCount ?? 0,
        c.isActive ? 1 : 0,
        c.expiresAt ?? null,
        c.createdAt,
      ],
    });
  }

  // Insert Views
  for (const v of dataToInsert.views) {
    await client.execute({
      sql: `INSERT INTO views (page_id, at) VALUES (?, ?)`,
      args: [v.pageId, v.at],
    });
  }

  // Insert Clicks
  for (const cl of dataToInsert.clicks) {
    await client.execute({
      sql: `INSERT INTO clicks (page_id, href, at) VALUES (?, ?, ?)`,
      args: [cl.pageId, cl.href, cl.at],
    });
  }

  // Insert Subscribers
  for (const s of dataToInsert.subscribers) {
    const subRecord = s as Record<string, unknown>;
    const at =
      typeof subRecord.at === "string"
        ? subRecord.at
        : typeof subRecord.createdAt === "string"
        ? subRecord.createdAt
        : new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO subscribers (page_id, email, at) VALUES (?, ?, ?)`,
      args: [s.pageId, s.email, at],
    });
  }

  // Backup db.json ke db.json.bak jika ada
  try {
    if (await fs.stat(jsonPath).then(() => true).catch(() => false)) {
      await fs.copyFile(jsonPath, `${jsonPath}.bak`);
    }
  } catch {}
}
