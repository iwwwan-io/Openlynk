"use client";

import { useState } from "react";
import type { Order, Page, Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  Search,
  ShoppingBag,
  Package,
  Copy,
  Check,
  TrendingUp,
  MessageCircle,
  Download,
} from "lucide-react";
import { PageProductsManager } from "./page-products-manager";
import { exportOrdersToCSV } from "@/lib/export-csv";
import { StatusBadge } from "@/components/status-badge";
import { DataPagination } from "@/components/data-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StoreTabProps {
  orders: Order[];
  onFulfillOrder: (orderId: string) => Promise<void>;
  products?: Product[];
  activePage?: Page;
  onCreateProduct?: (data: {
    name: string;
    priceIdr: number;
    kind: "digital" | "fisik";
    stock: number | null;
    description: string;
    imageUrl?: string;
  }) => Promise<void>;
  onUpdateProduct?: (
    id: string,
    data: {
      name?: string;
      priceIdr?: number;
      kind?: "digital" | "fisik";
      stock?: number | null;
      description?: string;
      imageUrl?: string;
      fileUrl?: string;
      isActive?: boolean;
    }
  ) => Promise<void>;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
  onToggleActive?: (id: string, isActive: boolean) => Promise<void>;
  onUploadFile?: (e: React.ChangeEvent<HTMLInputElement>, productId: string) => Promise<void>;
}

function OrderStatus({ status }: { status: string }) {
  return <StatusBadge value={status} icon />;
}

export function StoreTab({
  orders,
  onFulfillOrder,
  products = [],
  activePage,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleActive,
  onUploadFile,
}: StoreTabProps) {
  const [storeView, setStoreView] = useState<"orders" | "products">("orders");
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_LIMIT = 10;

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 1800);
  }

  function getWhatsAppUrl(contact: string, orderId: string, buyerName: string) {
    const digits = contact.replace(/[^0-9]/g, "");
    if (!digits || digits.length < 8) return null;
    let phone = digits;
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    else if (phone.startsWith("8")) phone = "62" + phone;
    const msg = encodeURIComponent(`Halo ${buyerName}, kami dari OpenLynk terkait pesanan #${orderId}.`);
    return `https://wa.me/${phone}?text=${msg}`;
  }

  const filteredOrders = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        o.buyerName.toLowerCase().includes(q) ||
        o.buyerContact.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metric computations
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "sent")
    .reduce((sum, o) => sum + (o.totalIdr || 0), 0);
  const paidCount = orders.filter((o) => o.status === "paid" || o.status === "sent").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_LIMIT));
  const safeOrderPage = Math.min(Math.max(orderPage, 1), totalOrderPages);
  const pagedOrders = filteredOrders.slice((safeOrderPage - 1) * ORDERS_LIMIT, safeOrderPage * ORDERS_LIMIT);

  return (
    <div className="space-y-6">
      {/* Store Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Omset
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {formatIDR(totalRevenue)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Dari transaksi lunas</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pesanan Sukses
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {paidCount}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {orders.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Lunas & Terkirim</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menunggu Bayar
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending checkout</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Katalog Produk
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {products.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {activePage ? `Di profil /${activePage.slug}` : "Semua produk"}
          </p>
        </div>
      </div>

      {/* Main Container with Tab Switcher */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6">
        {/* Header & Sub-tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {storeView === "orders" ? "Pesanan & Transaksi" : "Katalog Produk Toko"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {storeView === "orders"
                ? `Daftar transaksi masuk dari pembeli produk di toko Anda (${orders.length} total)`
                : `Kelola semua produk digital (${products.length} produk)`}
            </p>
          </div>

          {/* Switcher: Pesanan vs Katalog Produk */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-full border border-border bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setStoreView("orders")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                storeView === "orders"
                  ? "bg-foreground text-background font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Pesanan ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStoreView("products")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                storeView === "products"
                  ? "bg-foreground text-background font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Produk ({products.length})</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: ORDERS & TRANSACTIONS */}
        {storeView === "orders" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                {[
                  { id: "all", label: "Semua", count: orders.length },
                  { id: "paid", label: "Lunas (Paid)", count: orders.filter((o) => o.status === "paid").length },
                  { id: "sent", label: "Terkirim", count: orders.filter((o) => o.status === "sent").length },
                  { id: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
                  { id: "cancelled", label: "Batal", count: orders.filter((o) => o.status === "cancelled").length },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setFilter(f.id); setOrderPage(1); }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
                      filter === f.id
                        ? "bg-foreground text-background font-bold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="font-mono text-[10px] opacity-75">({f.count})</span>
                  </button>
                ))}
              </div>

              {/* Search & Export Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <div className="flex items-center rounded-xl border border-border bg-background px-3 py-1.5 w-full sm:w-60 shadow-2xs">
                  <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOrderPage(1); }}
                    placeholder="Cari pembeli atau ID..."
                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => exportOrdersToCSV(filteredOrders, products, activePage?.name || "Toko")}
                  disabled={filteredOrders.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
                  title="Unduh data pesanan ke berkas CSV (Excel)"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-xs bg-muted/10">
                Tidak ada data pesanan yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <>
                {/* Mobile Order Cards View (shown on screens < 640px) */}
                <div className="grid grid-cols-1 gap-3 sm:hidden">
                  {pagedOrders.map((o) => {
                    const waUrl = getWhatsAppUrl(o.buyerContact, o.id, o.buyerName);
                    return (
                      <div
                        key={o.id}
                        className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => copyId(o.id)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Salin ID Pesanan"
                          >
                            <span>#{o.id.slice(0, 12)}...</span>
                            {copiedOrderId === o.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground opacity-60" />
                            )}
                          </button>
                          <OrderStatus status={o.status} />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <p className="font-bold text-foreground text-sm">{o.buyerName}</p>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-[11px] text-muted-foreground break-all">
                              {o.buyerContact}
                            </span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>Chat WA</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Total Tagihan</p>
                            <p className="font-mono font-bold text-sm text-foreground">
                              {formatIDR(o.totalIdr + o.feeIdr)}
                            </p>
                          </div>

                          {o.status === "paid" && (
                            <button
                              type="button"
                              onClick={() => onFulfillOrder(o.id)}
                              className="rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
                            >
                              Tandai Dikirim
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Responsive Table View (hidden on screens < 640px) */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border/70 bg-card">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="border-b border-border/60 bg-muted/40 uppercase tracking-wider text-[11px] hover:bg-muted/40">
                        <TableHead className="py-3.5 px-4 font-semibold">ID Pesanan</TableHead>
                        <TableHead className="py-3.5 px-4 font-semibold">Pembeli</TableHead>
                        <TableHead className="py-3.5 px-4 font-semibold">Kontak</TableHead>
                        <TableHead className="py-3.5 px-4 font-semibold">Total Tagihan</TableHead>
                        <TableHead className="py-3.5 px-4 font-semibold">Status</TableHead>
                        <TableHead className="py-3.5 px-4 font-semibold text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedOrders.map((o) => {
                        const waUrl = getWhatsAppUrl(o.buyerContact, o.id, o.buyerName);
                        return (
                          <TableRow key={o.id} className="hover:bg-muted/20">
                            <TableCell className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => copyId(o.id)}
                                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                                title="Salin ID Pesanan"
                              >
                                <span>#{o.id.slice(0, 10)}...</span>
                                {copiedOrderId === o.id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="py-3.5 px-4 font-bold text-foreground">{o.buyerName}</TableCell>
                            <TableCell className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                                  {o.buyerContact}
                                </span>
                                {waUrl && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                    title="Chat WhatsApp Pembeli"
                                  >
                                    <MessageCircle className="h-2.5 w-2.5" />
                                    <span>WA</span>
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 px-4 font-bold font-mono text-foreground">
                              {formatIDR(o.totalIdr + o.feeIdr)}
                            </TableCell>
                            <TableCell className="py-3.5 px-4">
                              <OrderStatus status={o.status} />
                            </TableCell>
                            <TableCell className="py-3.5 px-4 text-right">
                              {o.status === "paid" ? (
                                <button
                                  type="button"
                                  onClick={() => onFulfillOrder(o.id)}
                                  className="rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
                                >
                                  Tandai Dikirim
                                </button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground font-mono">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <DataPagination
                  page={safeOrderPage}
                  total={filteredOrders.length}
                  limit={ORDERS_LIMIT}
                  onChange={setOrderPage}
                />
              </>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCT CATALOG MANAGEMENT */}
        {storeView === "products" && (
          <div className="animate-in fade-in duration-150">
            {activePage && onCreateProduct && onToggleActive && onUploadFile ? (
              <PageProductsManager
                page={activePage}
                products={products}
                onCreateProduct={onCreateProduct}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
                onToggleActive={onToggleActive}
                onUploadFile={onUploadFile}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs bg-muted/10">
                Pilih profil halaman di tab &quot;Halaman & Studio&quot; untuk mengelola produk secara langsung.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
