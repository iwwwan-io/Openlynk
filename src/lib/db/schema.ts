import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import type { BentoItem, OrderStatus, SocialLinks, PayoutStatus } from "@/lib/types";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    avatar: text("avatar"),
    role: text("role", { enum: ["creator", "admin"] }).notNull().default("creator"),
    plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
  ]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_sessions_token").on(table.token),
    index("idx_sessions_user_id").on(table.userId),
  ]
);

export const pages = sqliteTable(
  "pages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    customDomain: text("custom_domain").unique(),
    name: text("name").notNull(),
    bio: text("bio").notNull().default(""),
    image: text("image"),
    bannerImage: text("banner_image"),
    socials: text("socials", { mode: "json" }).$type<SocialLinks>(),
    theme: text("theme").notNull().default("default"),
    accentColor: text("accent_color").notNull().default("#18181b"),
    darkMode: integer("dark_mode", { mode: "boolean" }).notNull().default(false),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
    bento: text("bento", { mode: "json" }).$type<BentoItem[]>().notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_pages_slug").on(table.slug),
    index("idx_pages_user_id").on(table.userId),
    index("idx_pages_custom_domain").on(table.customDomain),
  ]
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceIdr: integer("price_idr").notNull(),
    stock: integer("stock"),
    kind: text("kind", { enum: ["digital", "fisik"] }).notNull(),
    imageUrl: text("image_url"),
    fileUrl: text("file_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_products_page_id").on(table.pageId),
  ]
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    buyerName: text("buyer_name").notNull(),
    buyerContact: text("buyer_contact").notNull(),
    qty: integer("qty").notNull().default(1),
    totalIdr: integer("total_idr").notNull(),
    feeIdr: integer("fee_idr").notNull(),
    status: text("status").$type<OrderStatus>().notNull(),
    couponCode: text("coupon_code"),
    discountIdr: integer("discount_idr").notNull().default(0),
    snapToken: text("snap_token"),
    createdAt: text("created_at").notNull(),
    paidAt: text("paid_at"),
    downloadCount: integer("download_count").notNull().default(0),
    lastDownloadedAt: text("last_downloaded_at"),
  },
  (table) => [
    index("idx_orders_page_id").on(table.pageId),
    index("idx_orders_status").on(table.status),
  ]
);

export const coupons = sqliteTable(
  "coupons",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    discountType: text("discount_type", { enum: ["percent", "fixed"] }).notNull(),
    discountValue: integer("discount_value").notNull(),
    minOrderIdr: integer("min_order_idr").default(0),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    expiresAt: text("expires_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_coupons_page_id").on(table.pageId),
    index("idx_coupons_code").on(table.code),
  ]
);

export const views = sqliteTable(
  "views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    at: text("at").notNull(),
  },
  (table) => [
    index("idx_views_page_id").on(table.pageId),
  ]
);

export const clicks = sqliteTable(
  "clicks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    href: text("href").notNull(),
    at: text("at").notNull(),
  },
  (table) => [
    index("idx_clicks_page_id").on(table.pageId),
  ]
);

export const subscribers = sqliteTable(
  "subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    at: text("at").notNull(),
  },
  (table) => [
    index("idx_subscribers_page_id").on(table.pageId),
  ]
);

export const payoutAccounts = sqliteTable(
  "payout_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolder: text("account_holder").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_payout_accounts_user_id").on(table.userId),
  ]
);

export const payoutRequests = sqliteTable(
  "payout_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountIdr: integer("amount_idr").notNull(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolder: text("account_holder").notNull(),
    status: text("status").$type<PayoutStatus>().notNull().default("pending"),
    adminNotes: text("admin_notes"),
    proofUrl: text("proof_url"),
    createdAt: text("created_at").notNull(),
    processedAt: text("processed_at"),
  },
  (table) => [
    index("idx_payout_requests_user_id").on(table.userId),
    index("idx_payout_requests_status").on(table.status),
  ]
);
